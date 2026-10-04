/**
 * Firebase Storage voor foto-uploads.
 * Gebruikt dezelfde FIREBASE_SERVICE_ACCOUNT_JSON als firebase-admin.
 */

import { getApps, cert, initializeApp, type App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

let app: App | null = null;

function getApp(): App | null {
  if (app) return app;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    const key = JSON.parse(json);
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(key),
        storageBucket: key.project_id + ".firebasestorage.app",
      });
      return app;
    }
    app = getApps()[0] as App;
    return app;
  } catch {
    return null;
  }
}

export function isStorageConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
}

function bucket() {
  const a = getApp();
  if (!a) return null;
  return getStorage(a).bucket();
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
): Promise<PhotoMeta | null> {
  const b = bucket();
  if (!b) return null;

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
  await fullFile.makePublic();

  const thumbBuffer = await createThumbnail(buffer, contentType);
  const thumbFile = b.file(thumbPath);
  await thumbFile.save(thumbBuffer, {
    contentType: "image/jpeg",
  });
  await thumbFile.makePublic();

  const bucketName = b.name;
  const thumbUrl = `https://storage.googleapis.com/${bucketName}/${thumbPath}`;
  const fullUrl = `https://storage.googleapis.com/${bucketName}/${fullPath}`;

  const { getFirestore } = await import("firebase-admin/firestore");
  const db = getFirestore();
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
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return [];

  try {
    const { getFirestore } = await import("firebase-admin/firestore");
    getApp();
    const db = getFirestore();
    let query = db.collection("photos").orderBy("uploadedAt", "desc");
    if (uploader) {
      query = query.where("uploader", "==", uploader);
    }
    const snap = await query.get();
    return snap.docs.map((doc) => doc.data() as PhotoMeta);
  } catch {
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
