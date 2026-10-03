import { createClient } from "@supabase/supabase-js";

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
  data: string;
  uploadedAt: string;
  day?: TripDayId;
  caption?: string;
}

const STORAGE_KEY = "goAwayDayMedia";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function loadFromSupabase(): Promise<MediaUploadEntry[]> {
  const client = getSupabase();
  if (!client) return [];
  try {
    const { data } = await client
      .from("store")
      .select("value")
      .eq("key", STORAGE_KEY)
      .single();
    return (data?.value as MediaUploadEntry[]) ?? [];
  } catch {
    return [];
  }
}

async function saveToSupabase(entries: MediaUploadEntry[]) {
  const client = getSupabase();
  if (!client) return;
  await client.from("store").upsert(
    { key: STORAGE_KEY, value: entries },
    { onConflict: "key" }
  );
}

function loadFromLocal(): MediaUploadEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToLocal(entries: MediaUploadEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    const trimmed = entries.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }
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

  const resized = await resizeImage(file, 800);
  
  options?.onProgress?.(50);

  const base64 = await fileToBase64(resized);
  
  options?.onProgress?.(70);

  const entry: MediaUploadEntry = {
    id: `${Date.now()}`,
    user,
    fileName: file.name,
    fileType: resized.type,
    data: base64,
    uploadedAt: new Date().toISOString(),
    day: options?.day,
    caption: options?.caption,
  };

  const existing = await getMediaUploads();
  existing.unshift(entry);
  
  // Probeer Supabase, anders lokaal
  if (getSupabase()) {
    await saveToSupabase(existing);
  }
  saveToLocal(existing);

  options?.onProgress?.(100);

  return entry;
}

export async function getMediaUploads(): Promise<MediaUploadEntry[]> {
  // Probeer Supabase eerst
  const client = getSupabase();
  if (client) {
    const remote = await loadFromSupabase();
    if (remote.length > 0) return remote;
  }
  return loadFromLocal();
}

function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
        0.8
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}
