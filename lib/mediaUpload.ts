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
  data: string; // base64
  uploadedAt: string;
  day?: TripDayId;
  caption?: string;
}

const STORAGE_KEY = "goAwayDayMedia";

function loadFromStorage(): MediaUploadEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries: MediaUploadEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full - verwijder oude items
    const trimmed = entries.slice(0, 20);
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

  // Resize image if too large
  const resized = await resizeImage(file, 1200);
  
  options?.onProgress?.(50);

  const base64 = await fileToBase64(resized);
  
  options?.onProgress?.(80);

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

  const existing = loadFromStorage();
  existing.unshift(entry);
  saveToStorage(existing);

  options?.onProgress?.(100);

  return entry;
}

export async function getMediaUploads(): Promise<MediaUploadEntry[]> {
  return loadFromStorage();
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
  // Videos niet resizen
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
