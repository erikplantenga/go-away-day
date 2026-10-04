import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, doc, getDoc, setDoc } from "firebase/firestore";

export type MediaUser = "erik" | "benno";

export type TripDayId = "za-3" | "zo-4" | "ma-5" | "di-6" | "wo-7";

export const TRIP_DAY_LABELS: Record<TripDayId, string> = {
  "za-3": "Za 3 okt",
  "zo-4": "Zo 4 okt",
  "ma-5": "Ma 5 okt",
  "di-6": "Di 6 okt",
  "wo-7": "Wo 7 okt",
};

export interface MediaUploadEntry {
  id: string;
  user: MediaUser;
  fileName: string;
  fileType: string;
  url: string;
  data?: string; // legacy base64 support
  uploadedAt: string;
  day?: TripDayId;
  caption?: string;
}

const STORAGE_KEY = "mediaUploads";

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  if (!config.projectId) return null;
  return initializeApp(config);
}

export async function uploadMedia(
  file: File,
  user: MediaUser,
  options?: {
    day?: TripDayId;
    caption?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<MediaUploadEntry> {
  options?.onProgress?.(10);

  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase niet geconfigureerd");

  // Resize image
  const resized = await resizeImage(file, 1200);
  options?.onProgress?.(30);

  // Upload to Firebase Storage
  const storage = getStorage(app);
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `uploads/${user}/${timestamp}_${safeFileName}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, resized);
  options?.onProgress?.(70);

  const url = await getDownloadURL(storageRef);
  options?.onProgress?.(85);

  const entry: MediaUploadEntry = {
    id: `${timestamp}`,
    user,
    fileName: file.name,
    fileType: file.type,
    url,
    uploadedAt: new Date().toISOString(),
    day: options?.day,
    caption: options?.caption,
  };

  // Save metadata to Firestore
  const db = getFirestore(app);
  const docRef = doc(db, "config", STORAGE_KEY);
  const existing = await getMediaUploads();
  existing.unshift(entry);
  await setDoc(docRef, { items: existing });

  options?.onProgress?.(100);
  return entry;
}

export async function getMediaUploads(): Promise<MediaUploadEntry[]> {
  try {
    const app = getFirebaseApp();
    if (!app) return [];
    
    const db = getFirestore(app);
    const docRef = doc(db, "config", STORAGE_KEY);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) return [];
    const data = snap.data();
    return (data?.items as MediaUploadEntry[]) ?? [];
  } catch {
    return [];
  }
}

async function resizeImage(file: File, maxSize: number): Promise<Blob> {
  if (file.type.startsWith("video/")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        return;
      }

      if (width > height) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else {
        width = (width / height) * maxSize;
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => resolve(blob || file),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}
