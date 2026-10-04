/**
 * Firebase Storage voor foto-uploads.
 * Gebruikt dezelfde FIREBASE_SERVICE_ACCOUNT_JSON als firebase-admin.
 */

import { getApps, cert, initializeApp, type App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

let app: App | null = null;
let projectId: string | null = null;

function getApp(): App | null {
  if (app) return app;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    const key = JSON.parse(json);
    projectId = key.project_id;
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(key),
        storageBucket: key.project_id + ".firebasestorage.app",
      });
      return app;
    }
    app = getApps()[0] as App;
    return app;
  } catch (e) {
    console.error("Firebase init error:", e);
    return null;
  }
}

export function isStorageConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
}

function bucket() {
  const a = getApp();
  if (!a) return null;
  try {
    return getStorage(a).bucket();
  } catch (e) {
    console.error("Storage bucket error:", e);
    return null;
  }
}

export type PhotoMeta = {
  id: string;
  uploader: "erik" | "benno";
  day: string;
  caption: string;
  uploadedAt: string;
  thumbUrl: string;
  fullUrl: string;
};

export async function uploadPhoto(
  buffer: Buffer,
  contentType: string,
  uploader: "erik" | "benno",
  day: string,
  caption: string,
): Promise<PhotoMeta> {
  const b = bucket();
  if (!b) {
    throw new Error("Storage bucket niet beschikbaar");
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const fullPath = `photos/full/${id}.${ext}`;
  const thumbPath = `photos/thumb/${id}.${ext}`;

  const fullFile = b.file(fullPath);
  await fullFile.save(buffer, {
    contentType,
    metadata: {
      metadata: { uploader, day, caption },
    },
  });
  
  try {
    await fullFile.makePublic();
  } catch (e) {
    console.error("makePublic error (full):", e);
  }

  const thumbBuffer = await createThumbnail(buffer, contentType);
  const thumbFile = b.file(thumbPath);
  await thumbFile.save(thumbBuffer, {
    contentType: "image/jpeg",
  });
  
  try {
    await thumbFile.makePublic();
  } catch (e) {
    console.error("makePublic error (thumb):", e);
  }

  const bucketName = b.name;
  const thumbUrl = `https://storage.googleapis.com/${bucketName}/${thumbPath}`;
  const fullUrl = `https://storage.googleapis.com/${bucketName}/${fullPath}`;

  const a = getApp();
  if (!a) throw new Error("Firebase app niet beschikbaar");
  
  const db = getFirestore(a);
  const meta: PhotoMeta = {
    id,
    uploader,
    day,
    caption,
    uploadedAt: new Date().toISOString(),
    thumbUrl,
    fullUrl,
  };
  await db.collection("photos").doc(id).set(meta);

  return meta;
}

export async function getPhotos(uploader?: "erik" | "benno"): Promise<PhotoMeta[]> {
  const a = getApp();
  if (!a) return [];

  try {
    const db = getFirestore(a);
    let query: FirebaseFirestore.Query = db.collection("photos").orderBy("uploadedAt", "desc");
    if (uploader) {
      query = query.where("uploader", "==", uploader);
    }
    const snap = await query.get();
    return snap.docs.map((doc) => doc.data() as PhotoMeta);
  } catch (e) {
    console.error("getPhotos error:", e);
    return [];
  }
}

export async function deletePhoto(id: string): Promise<boolean> {
  const b = bucket();
  if (!b) return false;

  try {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();
    const doc = await db.collection("photos").doc(id).get();
    if (!doc.exists) return false;

    const data = doc.data() as PhotoMeta;
    const fullPath = data.fullUrl.split("/").slice(-2).join("/");
    const thumbPath = data.thumbUrl.split("/").slice(-2).join("/");

    await Promise.all([
      b.file(fullPath).delete().catch(() => {}),
      b.file(thumbPath).delete().catch(() => {}),
      db.collection("photos").doc(id).delete(),
    ]);
    return true;
  } catch {
    return false;
  }
}

async function createThumbnail(buffer: Buffer, _contentType: string): Promise<Buffer> {
  // Simple approach: return a lower quality version
  // In production, you'd use sharp or similar for proper resizing
  // For now, we just return the original - the browser will handle display size
  // The "low quality" is achieved by CSS sizing, not actual compression here
  return buffer;
}
