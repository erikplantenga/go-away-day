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
  id?: string;
  user: MediaUser;
  fileName: string;
  fileType: string;
  url: string;
  uploadedAt: string;
  day?: TripDayId;
  caption?: string;
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(url, key);
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
  const client = getClient();
  
  options?.onProgress?.(10);

  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${user}/${timestamp}_${safeFileName}`;

  options?.onProgress?.(20);

  const { data, error } = await client.storage
    .from("media")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  options?.onProgress?.(70);

  const { data: urlData } = client.storage.from("media").getPublicUrl(data.path);

  const entry: MediaUploadEntry = {
    id: `${timestamp}`,
    user,
    fileName: file.name,
    fileType: file.type,
    url: urlData.publicUrl,
    uploadedAt: new Date().toISOString(),
    day: options?.day,
    caption: options?.caption,
  };

  // Save metadata to store
  const existing = await getMediaUploads();
  existing.unshift(entry);
  
  await client.from("store").upsert(
    { key: "mediaUploads", value: existing },
    { onConflict: "key" }
  );

  options?.onProgress?.(100);

  return entry;
}

export async function getMediaUploads(): Promise<MediaUploadEntry[]> {
  try {
    const client = getClient();
    const { data } = await client
      .from("store")
      .select("value")
      .eq("key", "mediaUploads")
      .single();
    
    return (data?.value as MediaUploadEntry[]) ?? [];
  } catch {
    return [];
  }
}
