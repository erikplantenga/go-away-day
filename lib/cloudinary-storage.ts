/**
 * Cloudinary voor foto's + Firestore voor de gedeelde lijst.
 * Env: CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
 */

import { createHash } from "crypto";

export type PhotoMeta = {
  id: string;
  uploader: "erik" | "benno";
  day: string;
  caption: string;
  uploadedAt: string;
  thumbUrl: string;
  fullUrl: string;
  location?: string;
  likeCount?: number;
  isVideo?: boolean;
};

function parseCloudinaryUrl(): { cloudName: string; apiKey: string; apiSecret: string } | null {
  const url = process.env.CLOUDINARY_URL?.trim();
  if (!url) return null;

  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/\s]+)/);
  if (!match) return null;

  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3],
  };
}

export function isCloudinaryConfigured(): boolean {
  return parseCloudinaryUrl() !== null;
}

export function getCloudinaryConfig() {
  return parseCloudinaryUrl();
}

/** Signed params for browser direct upload */
export function signUpload(publicId: string, resourceType: "image" | "video" = "image") {
  const config = parseCloudinaryUrl();
  if (!config) throw new Error("Cloudinary niet geconfigureerd");

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "go-away-day";
  const toSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(toSign + config.apiSecret)
    .digest("hex");

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    resourceType,
  };
}

async function firestore() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  const key = JSON.parse(json);
  if (getApps().length === 0) {
    initializeApp({ credential: cert(key) });
  }
  return getFirestore();
}

export async function savePhotoMeta(meta: PhotoMeta): Promise<void> {
  const db = await firestore();
  if (!db) throw new Error("Firestore niet geconfigureerd");
  await db.collection("photos").doc(meta.id).set(meta);
}

export async function updatePhotoMeta(
  id: string,
  updates: { day?: string; caption?: string }
): Promise<boolean> {
  const db = await firestore();
  if (!db) return false;

  try {
    const docRef = db.collection("photos").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;

    const updateData: Record<string, string> = {};
    if (updates.day !== undefined) updateData.day = updates.day;
    if (updates.caption !== undefined) updateData.caption = updates.caption;

    if (Object.keys(updateData).length > 0) {
      await docRef.update(updateData);
    }
    return true;
  } catch (e) {
    console.error("updatePhotoMeta error:", e);
    return false;
  }
}

export async function getPhotos(uploader?: "erik" | "benno"): Promise<PhotoMeta[]> {
  const db = await firestore();
  if (!db) return [];

  try {
    const snap = await db.collection("photos").get();
    let list = snap.docs.map((doc) => doc.data() as PhotoMeta);
    if (uploader) list = list.filter((p) => p.uploader === uploader);
    // Sort by day (newest first), then by uploadedAt within same day
    list.sort((a, b) => {
      if (a.day !== b.day) return b.day.localeCompare(a.day);
      return b.uploadedAt.localeCompare(a.uploadedAt);
    });
    return list;
  } catch (e) {
    console.error("getPhotos error:", e);
    return [];
  }
}

export async function findDuplicates(): Promise<{ duplicates: PhotoMeta[][]; total: number }> {
  const db = await firestore();
  if (!db) return { duplicates: [], total: 0 };

  try {
    const snap = await db.collection("photos").get();
    const list = snap.docs.map((doc) => doc.data() as PhotoMeta);
    
    // Group by fullUrl to find exact duplicates
    const byUrl = new Map<string, PhotoMeta[]>();
    for (const photo of list) {
      const existing = byUrl.get(photo.fullUrl) || [];
      existing.push(photo);
      byUrl.set(photo.fullUrl, existing);
    }
    
    // Also group by uploader+day+similar upload time (within 5 minutes)
    const byTimeKey = new Map<string, PhotoMeta[]>();
    for (const photo of list) {
      // Create a key based on uploader, day, and upload time rounded to 5 min
      const uploadTime = new Date(photo.uploadedAt).getTime();
      const roundedTime = Math.floor(uploadTime / (5 * 60 * 1000)); // 5 minute buckets
      const key = `${photo.uploader}-${photo.day}-${roundedTime}`;
      const existing = byTimeKey.get(key) || [];
      existing.push(photo);
      byTimeKey.set(key, existing);
    }
    
    // Combine both methods
    const allDuplicates = new Map<string, PhotoMeta[]>();
    
    for (const group of byUrl.values()) {
      if (group.length > 1) {
        const key = group.map(p => p.id).sort().join(",");
        allDuplicates.set(key, group);
      }
    }
    
    for (const group of byTimeKey.values()) {
      if (group.length > 1) {
        const key = group.map(p => p.id).sort().join(",");
        if (!allDuplicates.has(key)) {
          allDuplicates.set(key, group);
        }
      }
    }
    
    const duplicates = [...allDuplicates.values()];
    return { duplicates, total: list.length };
  } catch (e) {
    console.error("findDuplicates error:", e);
    return { duplicates: [], total: 0 };
  }
}

export async function photoExistsByUrl(fullUrl: string): Promise<boolean> {
  const db = await firestore();
  if (!db) return false;

  try {
    const snap = await db.collection("photos").where("fullUrl", "==", fullUrl).limit(1).get();
    return !snap.empty;
  } catch (e) {
    console.error("photoExistsByUrl error:", e);
    return false;
  }
}

export async function removeDuplicates(): Promise<{ removed: number; kept: number }> {
  const db = await firestore();
  if (!db) return { removed: 0, kept: 0 };

  try {
    const { duplicates } = await findDuplicates();
    let removed = 0;
    
    for (const group of duplicates) {
      // Sort by uploadedAt, keep the oldest one
      group.sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
      
      // Delete all except the first one
      for (let i = 1; i < group.length; i++) {
        await db.collection("photos").doc(group[i].id).delete();
        removed++;
      }
    }
    
    return { removed, kept: duplicates.length };
  } catch (e) {
    console.error("removeDuplicates error:", e);
    return { removed: 0, kept: 0 };
  }
}

export async function deletePhoto(id: string): Promise<boolean> {
  const config = parseCloudinaryUrl();
  const db = await firestore();
  if (!config || !db) return false;

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = id.includes("/") ? id : `go-away-day/${id}`;
    const toSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = createHash("sha1")
      .update(toSign + config.apiSecret)
      .digest("hex");

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: config.apiKey,
      signature,
    });

    await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    await db.collection("photos").doc(id).delete();
    return true;
  } catch (e) {
    console.error("deletePhoto error:", e);
    return false;
  }
}

export async function addPhotoLike(photoId: string): Promise<number | null> {
  const db = await firestore();
  if (!db) return null;

  try {
    const docRef = db.collection("photos").doc(photoId);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const data = doc.data() as PhotoMeta;
    const newCount = (data.likeCount || 0) + 1;

    await docRef.update({ likeCount: newCount });
    return newCount;
  } catch (e) {
    console.error("addPhotoLike error:", e);
    return null;
  }
}

export async function removePhotoLike(photoId: string): Promise<number | null> {
  const db = await firestore();
  if (!db) return null;

  try {
    const docRef = db.collection("photos").doc(photoId);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const data = doc.data() as PhotoMeta;
    const newCount = Math.max(0, (data.likeCount || 0) - 1);

    await docRef.update({ likeCount: newCount });
    return newCount;
  } catch (e) {
    console.error("removePhotoLike error:", e);
    return null;
  }
}

export async function testCloudinary(): Promise<{ ok: boolean; message: string; cloudName?: string }> {
  const config = parseCloudinaryUrl();
  if (!config) {
    return { ok: false, message: "CLOUDINARY_URL ontbreekt of is ongeldig" };
  }

  try {
    const auth = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image?max_results=1`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (res.ok) {
      return { ok: true, message: "Cloudinary werkt!", cloudName: config.cloudName };
    }
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      message: data?.error?.message || `Cloudinary fout (${res.status})`,
      cloudName: config.cloudName,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Verbinding mislukt",
      cloudName: config.cloudName,
    };
  }
}
