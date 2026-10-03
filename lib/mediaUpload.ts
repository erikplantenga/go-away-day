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

  const formData = new FormData();
  formData.append("file", file);
  formData.append("user", user);
  if (options?.day) formData.append("day", options.day);
  if (options?.caption) formData.append("caption", options.caption);

  options?.onProgress?.(30);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  options?.onProgress?.(90);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload mislukt");
  }

  const entry = await response.json();
  options?.onProgress?.(100);

  return entry;
}

export async function getMediaUploads(): Promise<MediaUploadEntry[]> {
  try {
    const response = await fetch("/api/upload");
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}
