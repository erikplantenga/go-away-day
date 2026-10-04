/**
 * Cloudinary Storage voor foto-uploads.
 * Gebruikt CLOUDINARY_URL env var: cloudinary://api_key:api_secret@cloud_name
 */

export type PhotoMeta = {
  id: string;
  uploader: "erik" | "benno";
  day: string;
  caption: string;
  uploadedAt: string;
  thumbUrl: string;
  fullUrl: string;
  location?: string;
};

function parseCloudinaryUrl(): { cloudName: string; apiKey: string; apiSecret: string } | null {
  const url = process.env.CLOUDINARY_URL;
  if (!url) return null;
  
  const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
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

export async function uploadPhoto(
  buffer: Buffer,
  contentType: string,
  uploader: "erik" | "benno",
  day: string,
  caption: string,
  location?: string,
): Promise<PhotoMeta> {
  const config = parseCloudinaryUrl();
  if (!config) {
    throw new Error("Cloudinary niet geconfigureerd");
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Create signature for upload
  const crypto = await import("crypto");
  const paramsToSign = `folder=go-away-day&public_id=${id}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + config.apiSecret)
    .digest("hex");

  // Upload to Cloudinary using base64
  const base64Data = `data:${contentType};base64,${buffer.toString("base64")}`;
  
  const formData = new URLSearchParams();
  formData.append("file", base64Data);
  formData.append("public_id", id);
  formData.append("folder", "go-away-day");
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", config.apiKey);
  formData.append("signature", signature);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    { 
      method: "POST", 
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload mislukt: ${err}`);
  }

  const uploadData = await uploadRes.json();
  const publicId = uploadData.public_id;

  // Generate URLs with transformations
  const baseUrl = `https://res.cloudinary.com/${config.cloudName}/image/upload`;
  const thumbUrl = `${baseUrl}/c_fill,w_400,h_400,q_auto,f_auto/${publicId}`;
  const fullUrl = `${baseUrl}/q_auto,f_auto/${publicId}`;

  const meta: PhotoMeta = {
    id,
    uploader,
    day,
    caption,
    location,
    uploadedAt: new Date().toISOString(),
    thumbUrl,
    fullUrl,
  };

  // Store metadata in Firestore (if available) or return just the meta
  try {
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getApps, initializeApp, cert } = await import("firebase-admin/app");
    
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (json) {
      const key = JSON.parse(json);
      if (getApps().length === 0) {
        initializeApp({ credential: cert(key) });
      }
      const db = getFirestore();
      await db.collection("photos").doc(id).set(meta);
    }
  } catch (e) {
    console.error("Firestore save error (non-fatal):", e);
  }

  return meta;
}

export async function getPhotos(uploader?: "erik" | "benno"): Promise<PhotoMeta[]> {
  try {
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getApps, initializeApp, cert } = await import("firebase-admin/app");
    
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!json) return [];
    
    const key = JSON.parse(json);
    if (getApps().length === 0) {
      initializeApp({ credential: cert(key) });
    }
    
    const db = getFirestore();
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
  const config = parseCloudinaryUrl();
  if (!config) return false;

  try {
    // Delete from Cloudinary
    const timestamp = Math.floor(Date.now() / 1000);
    const crypto = await import("crypto");
    const paramsToSign = `public_id=go-away-day/${id}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + config.apiSecret)
      .digest("hex");

    const formData = new URLSearchParams();
    formData.append("public_id", `go-away-day/${id}`);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", config.apiKey);
    formData.append("signature", signature);

    await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      { 
        method: "POST", 
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // Delete from Firestore
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getApps, initializeApp, cert } = await import("firebase-admin/app");
    
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (json) {
      const key = JSON.parse(json);
      if (getApps().length === 0) {
        initializeApp({ credential: cert(key) });
      }
      const db = getFirestore();
      await db.collection("photos").doc(id).delete();
    }

    return true;
  } catch (e) {
    console.error("deletePhoto error:", e);
    return false;
  }
}
