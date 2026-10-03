import { getApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getDb, isFirebaseConfigured } from "./firestore";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import * as supabase from "./supabase";

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
  id?: string;
  user: MediaUser;
  fileName: string;
  fileType: string;
  url: string;
  uploadedAt: Timestamp | string;
  day?: TripDayId;
  caption?: string;
}

function isSupabaseMode(): boolean {
  return supabase.isSupabaseConfigured() && !isFirebaseConfigured();
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
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `uploads/${user}/${timestamp}_${safeFileName}`;

  if (isSupabaseMode()) {
    return uploadToSupabase(file, user, path, options);
  }

  return uploadToFirebase(file, user, path, options);
}

async function uploadToFirebase(
  file: File,
  user: MediaUser,
  path: string,
  options?: {
    day?: TripDayId;
    caption?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<MediaUploadEntry> {
  const storage = getStorage(getApp());
  const storageRef = ref(storage, path);
  
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        options?.onProgress?.(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          const entry: Omit<MediaUploadEntry, "id"> = {
            user,
            fileName: file.name,
            fileType: file.type,
            url: downloadURL,
            uploadedAt: serverTimestamp() as Timestamp,
            day: options?.day,
            caption: options?.caption,
          };

          const db = getDb();
          const docRef = await addDoc(collection(db, "mediaUploads"), entry);

          resolve({
            id: docRef.id,
            ...entry,
            uploadedAt: new Date().toISOString(),
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

async function uploadToSupabase(
  file: File,
  user: MediaUser,
  path: string,
  options?: {
    day?: TripDayId;
    caption?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<MediaUploadEntry> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const client = createClient(url, key);

  options?.onProgress?.(10);

  const { data, error } = await client.storage
    .from("media")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  options?.onProgress?.(80);

  const { data: urlData } = client.storage.from("media").getPublicUrl(data.path);

  const entry: MediaUploadEntry = {
    user,
    fileName: file.name,
    fileType: file.type,
    url: urlData.publicUrl,
    uploadedAt: new Date().toISOString(),
    day: options?.day,
    caption: options?.caption,
  };

  const existing = (await getValue<MediaUploadEntry[]>("mediaUploads")) ?? [];
  existing.push(entry);
  await setValue("mediaUploads", existing);

  options?.onProgress?.(100);

  return entry;
}

async function getValue<K>(keyName: string): Promise<K | null> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const client = createClient(url, key);

  const { data } = await client
    .from("store")
    .select("value")
    .eq("key", keyName)
    .single();
  return (data?.value as K) ?? null;
}

async function setValue(keyName: string, value: unknown): Promise<void> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const client = createClient(url, key);

  await client.from("store").upsert({ key: keyName, value }, { onConflict: "key" });
}

export async function getMediaUploads(): Promise<MediaUploadEntry[]> {
  if (isSupabaseMode()) {
    return (await getValue<MediaUploadEntry[]>("mediaUploads")) ?? [];
  }

  const db = getDb();
  const q = query(collection(db, "mediaUploads"), orderBy("uploadedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as MediaUploadEntry[];
}
