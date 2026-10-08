"use client";

import { useEffect, useState, useRef } from "react";
import JSZip from "jszip";
import { FaceIdSetupRow, FaceIdUnlockButton } from "@/components/FaceIdControls";

type PhotoMeta = {
  id: string;
  uploader: "erik" | "benno";
  day: string;
  caption: string;
  uploadedAt: string;
  thumbUrl: string;
  fullUrl: string;
  likeCount?: number;
  isVideo?: boolean;
};

const DAYS = [
  { value: "2026-10-03", label: "Zaterdag 3 okt" },
  { value: "2026-10-04", label: "Zondag 4 okt" },
  { value: "2026-10-05", label: "Maandag 5 okt" },
  { value: "2026-10-06", label: "Dinsdag 6 okt" },
  { value: "2026-10-07", label: "Woensdag 7 okt" },
];

function getTodayValue(): string {
  const now = new Date();
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const found = DAYS.find(d => d.value === iso);
  return found?.value ?? DAYS[2].value; // Default to Sunday if not found
}

type Filter = "all" | "erik" | "benno";

export function Photos() {
  const [photos, setPhotos] = useState<PhotoMeta[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<PhotoMeta | null>(null);
  const [error, setError] = useState("");
  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);

  const [who, setWho] = useState<"erik" | "benno" | "">("");
  const [password, setPassword] = useState("");
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editDay, setEditDay] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  // Multi-file upload state
  type PendingFile = {
    file: File;
    preview: string;
    day: string;
    caption: string;
    isVideo: boolean;
  };
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(-1);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFilter, setDownloadFilter] = useState<"all" | "erik" | "benno">("all");
  const [duplicates, setDuplicates] = useState<PhotoMeta[][] | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const checkDuplicates = async () => {
    setCheckingDuplicates(true);
    try {
      const res = await fetch("/api/photos?duplicates=1");
      const data = await res.json();
      setDuplicates(data.duplicates || []);
    } catch {
      setDuplicates([]);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const deleteDuplicate = async (photo: PhotoMeta) => {
    if (!who || !password) {
      setError("Kies wie je bent en vul wachtwoord in");
      return;
    }
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "delete", id: photo.id, who, password }),
      });
      if (res.ok) {
        // Remove from duplicates list
        setDuplicates(prev => 
          prev?.map(group => group.filter(p => p.id !== photo.id))
            .filter(group => group.length > 1) || null
        );
        // Refresh photos
        loadPhotos();
      }
    } catch {}
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("likedPhotos");
      if (stored) setLikedPhotos(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const filtered = photos;
  const viewPhotoIndex = viewPhoto ? filtered.findIndex(p => p.id === viewPhoto.id) : -1;

  const goToPrevPhoto = () => {
    if (viewPhotoIndex > 0) {
      setViewPhoto(filtered[viewPhotoIndex - 1]);
    } else if (filtered.length > 0) {
      setViewPhoto(filtered[filtered.length - 1]);
    }
  };

  const goToNextPhoto = () => {
    if (viewPhotoIndex < filtered.length - 1) {
      setViewPhoto(filtered[viewPhotoIndex + 1]);
    } else if (filtered.length > 0) {
      setViewPhoto(filtered[0]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToPrevPhoto();
      else goToNextPhoto();
    }
    setTouchStart(null);
  };

  const handleDelete = async () => {
    if (!viewPhoto || !who || !password) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "delete", id: viewPhoto.id, who, password }),
      });
      if (res.ok) {
        setPhotos(prev => prev.filter(p => p.id !== viewPhoto.id));
        setViewPhoto(null);
        setShowDeleteConfirm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Verwijderen mislukt");
      }
    } catch {
      setError("Verwijderen mislukt");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!viewPhoto) return;
    setEditDay(viewPhoto.day);
    setEditCaption(viewPhoto.caption);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!viewPhoto || !who || !password) return;
    setSaving(true);
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "update",
          id: viewPhoto.id,
          who,
          password,
          updates: { day: editDay, caption: editCaption },
        }),
      });
      if (res.ok) {
        const updated = { ...viewPhoto, day: editDay, caption: editCaption };
        setPhotos(prev => prev.map(p => p.id === viewPhoto.id ? updated : p));
        setViewPhoto(updated);
        setEditMode(false);
      } else {
        const data = await res.json();
        setError(data.error || "Opslaan mislukt");
      }
    } catch {
      setError("Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadAll = async () => {
    const toDownload = downloadFilter === "all" 
      ? photos 
      : photos.filter(p => p.uploader === downloadFilter);
    
    if (toDownload.length === 0) return;
    
    setDownloading(true);
    setDownloadProgress({ current: 0, total: toDownload.length });
    
    try {
      const zip = new JSZip();
      const folder = zip.folder("malta-2026-fotos");
      
      for (let i = 0; i < toDownload.length; i++) {
        const photo = toDownload[i];
        setDownloadProgress({ current: i + 1, total: toDownload.length });
        
        try {
          const response = await fetch(photo.fullUrl);
          const blob = await response.blob();
          const ext = photo.isVideo ? "mp4" : "jpg";
          const name = `${photo.day}_${photo.uploader}_${photo.id}.${ext}`;
          folder?.file(name, blob);
        } catch {
          console.error(`Failed to download ${photo.id}`);
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      const filterLabel = downloadFilter === "all" ? "alle" : downloadFilter;
      a.download = `malta-2026-${filterLabel}-fotos.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowDownloadModal(false);
    } catch (err) {
      setError("Download mislukt");
    } finally {
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const handleLike = async (photoId: string) => {
    const isLiked = likedPhotos.has(photoId);
    const op = isLiked ? "remove-like" : "add-like";
    
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op, photoId }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCount = data.likeCount as number;
        
        // Update liked state in localStorage
        const newLiked = new Set(likedPhotos);
        if (isLiked) {
          newLiked.delete(photoId);
        } else {
          newLiked.add(photoId);
        }
        setLikedPhotos(newLiked);
        try {
          localStorage.setItem("likedPhotos", JSON.stringify([...newLiked]));
        } catch {}
        
        // Update photo count in state
        setPhotos(prev => prev.map(p => {
          if (p.id !== photoId) return p;
          return { ...p, likeCount: newCount };
        }));
        if (viewPhoto?.id === photoId) {
          setViewPhoto(prev => prev ? { ...prev, likeCount: newCount } : prev);
        }
      }
    } catch {
      // Silent fail
    }
  };

  const readExifLocation = async (file: File): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const view = new DataView(e.target?.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(null);
          return;
        }
        
        let offset = 2;
        while (offset < view.byteLength) {
          if (view.getUint16(offset, false) === 0xFFE1) {
            const exifData = parseExif(view, offset + 4);
            resolve(exifData);
            return;
          }
          offset += 2 + view.getUint16(offset + 2, false);
        }
        resolve(null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
    });
  };

  const parseExif = (view: DataView, start: number): { lat: number; lng: number } | null => {
    try {
      const exifMarker = String.fromCharCode(
        view.getUint8(start), view.getUint8(start + 1),
        view.getUint8(start + 2), view.getUint8(start + 3)
      );
      if (exifMarker !== "Exif") return null;

      const tiffStart = start + 6;
      const littleEndian = view.getUint16(tiffStart, false) === 0x4949;
      const ifdOffset = view.getUint32(tiffStart + 4, littleEndian);
      
      const findGPS = (ifdStart: number): { lat: number; lng: number } | null => {
        const entries = view.getUint16(ifdStart, littleEndian);
        for (let i = 0; i < entries; i++) {
          const entryOffset = ifdStart + 2 + i * 12;
          const tag = view.getUint16(entryOffset, littleEndian);
          if (tag === 0x8825) {
            const gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
            return parseGPSIFD(tiffStart + gpsOffset, littleEndian, view, tiffStart);
          }
        }
        return null;
      };

      return findGPS(tiffStart + ifdOffset);
    } catch {
      return null;
    }
  };

  const parseGPSIFD = (
    ifdStart: number,
    littleEndian: boolean,
    view: DataView,
    tiffStart: number
  ): { lat: number; lng: number } | null => {
    try {
      const entries = view.getUint16(ifdStart, littleEndian);
      let lat = 0, lng = 0, latRef = "N", lngRef = "E";

      for (let i = 0; i < entries; i++) {
        const entryOffset = ifdStart + 2 + i * 12;
        const tag = view.getUint16(entryOffset, littleEndian);
        const valueOffset = view.getUint32(entryOffset + 8, littleEndian);

        if (tag === 1) latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
        if (tag === 3) lngRef = String.fromCharCode(view.getUint8(entryOffset + 8));
        if (tag === 2 || tag === 4) {
          const offset = tiffStart + valueOffset;
          const d = view.getUint32(offset, littleEndian) / view.getUint32(offset + 4, littleEndian);
          const m = view.getUint32(offset + 8, littleEndian) / view.getUint32(offset + 12, littleEndian);
          const s = view.getUint32(offset + 16, littleEndian) / view.getUint32(offset + 20, littleEndian);
          const decimal = d + m / 60 + s / 3600;
          if (tag === 2) lat = decimal;
          if (tag === 4) lng = decimal;
        }
      }

      if (lat && lng) {
        return {
          lat: latRef === "S" ? -lat : lat,
          lng: lngRef === "W" ? -lng : lng,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
        { headers: { "Accept-Language": "nl" } }
      );
      const data = await res.json();
      const addr = data.address || {};
      const place = addr.tourism || addr.amenity || addr.building || addr.leisure || 
                    addr.historic || addr.shop || addr.neighbourhood || addr.suburb || 
                    addr.village || addr.town || addr.city || "";
      const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || "";
      if (place && place !== area) return `${place}, ${area}`;
      return place || area || data.display_name?.split(",")[0] || null;
    } catch {
      return null;
    }
  };

  const handleFileSelect = async () => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return;

    const newPending: PendingFile[] = [];
    let skippedDuplicates = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check for duplicates: same name already in pending or already uploaded
      const isDuplicatePending = pendingFiles.some(p => 
        p.file.name === file.name && p.file.size === file.size
      );
      const isDuplicateUploaded = photos.some(p => 
        p.id.includes(file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, ""))
      );
      
      if (isDuplicatePending) {
        skippedDuplicates++;
        continue;
      }
      
      const isVideo = file.type.startsWith("video/");
      const preview = URL.createObjectURL(file);
      
      let caption = "";
      // Try to get location for images
      if (!isVideo) {
        try {
          const coords = await readExifLocation(file);
          if (coords) {
            const name = await reverseGeocode(coords.lat, coords.lng);
            if (name) caption = name;
          }
        } catch {}
      }
      
      newPending.push({
        file,
        preview,
        day: getTodayValue(),
        caption,
        isVideo,
      });
    }
    
    if (skippedDuplicates > 0) {
      setError(`${skippedDuplicates} dubbele bestand${skippedDuplicates > 1 ? "en" : ""} overgeslagen`);
    }
    
    setPendingFiles(prev => [...prev, ...newPending]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const compressImage = (file: File, maxSizeMB = 2): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        let { width, height } = img;
        const maxDim = 2048;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas niet beschikbaar"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Compressie mislukt"));
                return;
              }
              if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
                quality -= 0.1;
                tryCompress();
              } else {
                resolve(blob);
              }
            },
            "image/jpeg",
            quality
          );
        };
        tryCompress();
      };
      img.onerror = () => reject(new Error("Foto laden mislukt"));
      img.src = URL.createObjectURL(file);
    });
  };

  const loadPhotos = async () => {
    try {
      const url = filter === "all" ? "/api/photos" : `/api/photos?filter=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setPhotos(data.photos ?? []);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [filter]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mpQuizMe");
      if (saved === "erik" || saved === "benno") setWho(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (!showUpload && !viewPhoto) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showUpload, viewPhoto]);

  const uploadSingleFile = async (pending: PendingFile): Promise<{ success: boolean; error?: string }> => {
    const { file, day, caption, isVideo } = pending;
    
    let uploadFile: Blob = file;
    
    if (!isVideo && file.size > 2 * 1024 * 1024) {
      try {
        uploadFile = await compressImage(file, 2);
      } catch {
        return { success: false, error: "Compressie mislukt" };
      }
    }

    try {
      const signRes = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: isVideo ? "sign-video" : "sign", who, password }),
      });
      const signed = await signRes.json();
      if (!signRes.ok) return { success: false, error: signed.error || "Aanmelden mislukt" };

      const cloudinaryData = new FormData();
      cloudinaryData.append("file", uploadFile);
      cloudinaryData.append("api_key", signed.apiKey);
      cloudinaryData.append("timestamp", String(signed.timestamp));
      cloudinaryData.append("signature", signed.signature);
      cloudinaryData.append("folder", signed.folder);
      cloudinaryData.append("public_id", signed.publicId);

      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", async () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status < 200 || xhr.status >= 300 || !data.secure_url) {
              resolve({ success: false, error: data.error?.message || `Cloudinary fout (${xhr.status})` });
              return;
            }

            const publicId = data.public_id as string;
            const thumbUrl = isVideo
              ? data.secure_url.replace("/upload/", "/upload/c_fill,w_400,h_400,q_auto,f_jpg,so_0/")
              : data.secure_url.replace("/upload/", "/upload/c_fill,w_400,h_400,q_auto,f_auto/");

            const saveRes = await fetch("/api/photos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                op: "save",
                who,
                password,
                photo: {
                  id: publicId.includes("/") ? publicId.split("/").pop() : publicId,
                  day,
                  caption: caption || "",
                  thumbUrl,
                  fullUrl: data.secure_url,
                  isVideo,
                },
              }),
            });
            if (saveRes.ok) {
              resolve({ success: true });
            } else {
              const saveData = await saveRes.json();
              resolve({ success: false, error: saveData.error || "Opslaan mislukt" });
            }
          } catch (e) {
            resolve({ success: false, error: "Verwerking mislukt" });
          }
        });
        xhr.addEventListener("error", () => resolve({ success: false, error: "Netwerk fout" }));
        const resourceType = isVideo ? "video" : "image";
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${signed.cloudName}/${resourceType}/upload`);
        xhr.send(cloudinaryData);
      });
    } catch (e) {
      return { success: false, error: "Onverwachte fout" };
    }
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      setError("Selecteer eerst foto's of video's");
      return;
    }
    if (!who) {
      setError("Kies wie je bent");
      return;
    }
    if (!password) {
      setError("Vul je wachtwoord in");
      return;
    }

    setUploading(true);
    setError("");

    let successCount = 0;
    let lastError = "";
    for (let i = 0; i < pendingFiles.length; i++) {
      setCurrentUploadIndex(i);
      setUploadProgress(0);
      const result = await uploadSingleFile(pendingFiles[i]);
      if (result.success) {
        successCount++;
      } else {
        lastError = result.error || "Onbekende fout";
      }
    }

    // Cleanup previews
    pendingFiles.forEach(p => URL.revokeObjectURL(p.preview));
    
    setUploading(false);
    setCurrentUploadIndex(-1);
    setUploadProgress(0);
    setPendingFiles([]);
    
    if (successCount === pendingFiles.length) {
      setShowUpload(false);
      await loadPhotos();
    } else {
      setError(`${successCount} van ${pendingFiles.length} geüpload. Fout: ${lastError}`);
      await loadPhotos();
    }
  };

  const dayLabel = (dateStr: string) => {
    const found = DAYS.find((d) => d.value === dateStr);
    return found?.label ?? dateStr;
  };

  return (
    <>
      <div className="space-y-3 pb-3">
        <div className="flex gap-2">
          {(["all", "erik", "benno"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                filter === f ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
              }`}
            >
              {f === "all" ? "Alle" : f === "erik" ? "Erik" : "Benno"}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setShowUpload(true);
            }}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
          >
            <span className="text-lg">📷</span> Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadPhotos();
            }}
            className="flex min-h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg"
            title="Ververs"
          >
            🔄
          </button>
          {photos.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  setPresentationIndex(0);
                  setShowPresentation(true);
                }}
                className="flex min-h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg"
                title="Presentatie"
              >
                ▶️
              </button>
              <button
                type="button"
                onClick={() => setShowDownloadModal(true)}
                className="flex min-h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg"
                title="Download"
              >
                ⬇️
              </button>
            </>
          )}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-white/60">Laden...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/60">Nog geen foto's</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {filtered.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setViewPhoto(photo)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-black/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbUrl}
                  alt={photo.caption || "Foto"}
                  className="h-full w-full object-cover transition-transform group-active:scale-[0.98]"
                  loading="lazy"
                />
                {photo.isVideo && (
                  <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
                    ▶
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{photo.uploader === "erik" ? "Erik" : "Benno"}</p>
                      <p className="truncate text-xs text-white/70">{dayLabel(photo.day)}</p>
                    </div>
                    {(photo.likeCount ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <span>❤️</span>
                        <span className="text-white font-medium">{photo.likeCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Duplicate check - helemaal onderaan */}
        {photos.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={checkDuplicates}
              disabled={checkingDuplicates}
              className="text-xs text-white/40 hover:text-white/60"
            >
              {checkingDuplicates ? "Checken..." : "Check op dubbele foto's"}
            </button>
            
            {duplicates !== null && (
              <div className="mt-3">
                {duplicates.length === 0 ? (
                  <p className="text-xs text-green-400">✓ Geen dubbelen gevonden</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-orange-400">
                      {duplicates.length} dubbele foto('s) gevonden:
                    </p>
                    {duplicates.map((group, gi) => (
                      <div key={gi} className="rounded-lg bg-white/5 p-2">
                        <p className="mb-2 text-xs text-white/60">
                          {group.length}x dezelfde foto:
                        </p>
                        <div className="flex gap-2 overflow-x-auto">
                          {group.map((photo, pi) => (
                            <div key={photo.id} className="shrink-0">
                              <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo.thumbUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <p className="mt-1 text-[10px] text-white/50">
                                {photo.uploader} · {photo.day.slice(-2)}/10
                              </p>
                              {pi > 0 && (
                                <button
                                  type="button"
                                  onClick={() => deleteDuplicate(photo)}
                                  className="mt-1 text-[10px] text-red-400"
                                >
                                  Verwijder
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-white/40">
                      Kies boven wie je bent + wachtwoord om te verwijderen
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-[#0b1f3a] text-white" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center gap-2 px-3 pb-2"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => {
                pendingFiles.forEach(p => URL.revokeObjectURL(p.preview));
                setPendingFiles([]);
                setShowUpload(false);
                setError("");
              }}
              className="inline-tap flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-semibold"
            >
              ← Terug
            </button>
            {pendingFiles.length > 0 && (
              <span className="text-sm text-white/60">{pendingFiles.length} geselecteerd</span>
            )}
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4"
            style={{
              WebkitOverflowScrolling: "touch",
              paddingBottom: "max(10rem, env(safe-area-inset-bottom))",
            }}
          >
            <h2 className="mt-2 text-xl font-bold">Foto's & video's uploaden</h2>

            <div className="mt-4 space-y-3">
              <FaceIdUnlockButton
                onUnlocked={({ user, password: pass }) => {
                  setWho(user);
                  setPassword(pass);
                  setError("");
                }}
              />
              <div>
                <p className="mb-2 text-sm font-semibold text-white/80">Wie ben je?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["erik", "benno"] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setWho(id)}
                      className={`rounded-xl px-4 py-3 text-sm font-bold ${
                        who === id ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
                      }`}
                    >
                      {id === "erik" ? "Erik" : "Benno"}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wachtwoord"
                className="min-h-11 w-full rounded-xl bg-white/10 px-4 text-base text-white placeholder:text-white/40"
              />
              <FaceIdSetupRow user={who} password={password} />

              <div>
                <p className="mb-2 text-sm font-semibold text-white/80">Selecteer foto's of video's</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                <p className="mt-1 text-xs text-white/50">Je kunt meerdere bestanden tegelijk kiezen</p>
              </div>

              {/* Pending files list */}
              {pendingFiles.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white/80">
                    {pendingFiles.length} bestand{pendingFiles.length !== 1 ? "en" : ""} klaar:
                  </p>
                  {pendingFiles.map((pending, index) => (
                    <div 
                      key={index} 
                      className={`rounded-xl bg-white/5 p-3 ${
                        uploading && currentUploadIndex === index ? "ring-2 ring-[#c9a227]" : ""
                      }`}
                    >
                      <div className="flex gap-2">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/30">
                          {pending.isVideo ? (
                            <div className="flex h-full w-full items-center justify-center bg-black/50 text-lg">
                              🎬
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={pending.preview}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                          {uploading && currentUploadIndex === index && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                              <span className="text-[10px] font-bold text-[#c9a227]">{uploadProgress}%</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-xs text-white/60">{pending.file.name}</p>
                            {!uploading && (
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(pending.preview);
                                  setPendingFiles(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="shrink-0 text-red-400 hover:text-red-300"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <select
                            value={pending.day}
                            onChange={(e) => {
                              setPendingFiles(prev => prev.map((p, i) => 
                                i === index ? { ...p, day: e.target.value } : p
                              ));
                            }}
                            disabled={uploading}
                            className="min-h-8 w-full rounded-lg bg-white/10 px-2 text-sm text-white disabled:opacity-50"
                          >
                            {DAYS.map((d) => (
                              <option key={d.value} value={d.value} className="bg-[#0b1f3a]">
                                {d.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={pending.caption}
                            onChange={(e) => {
                              setPendingFiles(prev => prev.map((p, i) => 
                                i === index ? { ...p, caption: e.target.value } : p
                              ));
                            }}
                            disabled={uploading}
                            placeholder="Beschrijving..."
                            className="min-h-8 w-full rounded-lg bg-white/10 px-2 text-sm text-white placeholder:text-white/40 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-center text-sm text-red-300">{error}</p>}

              {uploading ? (
                <div className="space-y-2">
                  <p className="text-center text-sm text-white/70">
                    Uploaden {currentUploadIndex + 1} van {pendingFiles.length}...
                  </p>
                  <div className="relative h-12 w-full overflow-hidden rounded-xl bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#c9a227] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white drop-shadow">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!who || !password || pendingFiles.length === 0}
                  onClick={handleUpload}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
                >
                  {pendingFiles.length === 0 
                    ? "Selecteer eerst bestanden" 
                    : `${pendingFiles.length} bestand${pendingFiles.length !== 1 ? "en" : ""} uploaden`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewPhoto && (
        <div 
          className="fixed inset-0 z-[90] flex flex-col bg-black" 
          role="dialog" 
          aria-modal="true"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => { setViewPhoto(null); setEditMode(false); setShowDeleteConfirm(false); }}
              className="inline-tap flex min-h-11 items-center rounded-full bg-white/15 px-4 text-sm font-semibold text-white"
            >
              ← Terug
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="inline-tap flex min-h-11 items-center rounded-full bg-white/15 px-3 text-sm font-semibold text-white"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-tap flex min-h-11 items-center rounded-full bg-red-500/80 px-3 text-sm font-semibold text-white"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div className="flex min-h-0 flex-1 flex-col relative">
            {/* Navigation arrows */}
            {filtered.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevPhoto}
                  className="absolute left-0 top-1/2 z-10 -translate-y-1/2 p-4 text-3xl text-white/40 active:text-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goToNextPhoto}
                  className="absolute right-0 top-1/2 z-10 -translate-y-1/2 p-4 text-3xl text-white/40 active:text-white"
                >
                  ›
                </button>
              </>
            )}
            
            <div className="flex flex-1 items-center justify-center px-10">
              {viewPhoto.isVideo ? (
                <video
                  src={viewPhoto.fullUrl}
                  controls
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewPhoto.fullUrl}
                  alt={viewPhoto.caption || "Foto"}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
            
            <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {filtered.length > 1 && (
                <p className="mb-2 text-center text-xs text-white/50">
                  {viewPhotoIndex + 1} / {filtered.length} · Swipe voor volgende
                </p>
              )}
              <p className="text-sm font-semibold text-white">
                {viewPhoto.uploader === "erik" ? "Erik" : "Benno"} · {dayLabel(viewPhoto.day)}
                {viewPhoto.isVideo && <span className="ml-2">🎬</span>}
              </p>
              {viewPhoto.caption && (
                <p className="mt-1 text-sm text-white/80">{viewPhoto.caption}</p>
              )}
              
              <div className="mt-3 flex gap-2">
                <LikeButton
                  likeCount={viewPhoto.likeCount ?? 0}
                  isLiked={likedPhotos.has(viewPhoto.id)}
                  onLike={() => handleLike(viewPhoto.id)}
                />
                <a
                  href={viewPhoto.fullUrl}
                  download={`malta-${viewPhoto.day}-${viewPhoto.id}${viewPhoto.isVideo ? ".mp4" : ".jpg"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-tap flex min-h-11 items-center rounded-full bg-[#c9a227] px-4 text-sm font-bold text-[#0b1f3a]"
                >
                  ⬇ Download
                </a>
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {editMode && (
            <div className="absolute inset-0 z-[95] flex items-center justify-center bg-black/80 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-[#0b1f3a] p-5">
                <h3 className="text-lg font-bold text-white">Bewerken</h3>
                
                <div className="mt-4 space-y-3">
                  <FaceIdUnlockButton
                    onUnlocked={({ user, password: pass }) => {
                      setWho(user);
                      setPassword(pass);
                      setError("");
                    }}
                  />
                  <div>
                    <p className="mb-1 text-sm text-white/70">Wie ben je?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["erik", "benno"] as const).map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setWho(id)}
                          className={`rounded-lg px-3 py-2 text-sm font-bold ${
                            who === id ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
                          }`}
                        >
                          {id === "erik" ? "Erik" : "Benno"}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wachtwoord"
                    className="min-h-10 w-full rounded-lg bg-white/10 px-3 text-white placeholder:text-white/40"
                  />
                  <FaceIdSetupRow user={who} password={password} />
                  
                  <div>
                    <p className="mb-1 text-sm text-white/70">Dag</p>
                    <select
                      value={editDay}
                      onChange={(e) => setEditDay(e.target.value)}
                      className="min-h-10 w-full rounded-lg bg-white/10 px-3 text-white"
                    >
                      {DAYS.map((d) => (
                        <option key={d.value} value={d.value} className="bg-[#0b1f3a]">
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <p className="mb-1 text-sm text-white/70">Beschrijving</p>
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder:text-white/40"
                    />
                  </div>
                  
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setEditMode(false); setError(""); }}
                      className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-semibold text-white"
                    >
                      Annuleren
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saving || !who || !password}
                      className="flex-1 rounded-lg bg-[#c9a227] py-2 text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
                    >
                      {saving ? "Opslaan..." : "Opslaan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 z-[95] flex items-center justify-center bg-black/80 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-[#0b1f3a] p-5 text-center">
                <p className="text-4xl">🗑️</p>
                <h3 className="mt-3 text-lg font-bold text-white">Weet je het zeker?</h3>
                <p className="mt-2 text-sm text-white/70">
                  Deze {viewPhoto.isVideo ? "video" : "foto"} wordt permanent verwijderd.
                </p>
                
                <div className="mt-4 space-y-3">
                  <FaceIdUnlockButton
                    onUnlocked={({ user, password: pass }) => {
                      setWho(user);
                      setPassword(pass);
                      setError("");
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {(["erik", "benno"] as const).map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setWho(id)}
                        className={`rounded-lg px-3 py-2 text-sm font-bold ${
                          who === id ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
                        }`}
                      >
                        {id === "erik" ? "Erik" : "Benno"}
                      </button>
                    ))}
                  </div>
                  
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Wachtwoord"
                    className="min-h-10 w-full rounded-lg bg-white/10 px-3 text-white placeholder:text-white/40"
                  />
                  
                  {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowDeleteConfirm(false); setError(""); }}
                    className="flex-1 rounded-lg bg-white/10 py-3 text-sm font-semibold text-white"
                  >
                    Annuleren
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || !who || !password}
                    className="flex-1 rounded-lg bg-red-500 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {deleting ? "Verwijderen..." : "Verwijderen"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showPresentation && filtered.length > 0 && (
        <PresentationModal
          photos={filtered}
          currentIndex={presentationIndex}
          onIndexChange={setPresentationIndex}
          onClose={() => setShowPresentation(false)}
          dayLabel={dayLabel}
        />
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0b1f3a] p-5">
            <h3 className="text-xl font-bold text-white">Download foto's</h3>
            
            {downloading ? (
              <div className="mt-5">
                <div className="relative h-12 w-full overflow-hidden rounded-xl bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#c9a227] transition-all duration-300"
                    style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow">
                      {downloadProgress.current} / {downloadProgress.total}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-white/50">ZIP wordt gemaakt...</p>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm text-white/70">
                  Kies hoe je de foto's wilt downloaden:
                </p>

                {/* iPhone / HD Gallery option */}
                <a
                  href="/download"
                  className="mt-4 flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4 text-left"
                >
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-bold text-white">HD Galerij (iPhone)</div>
                    <div className="text-xs text-white/70">Lang indrukken → opslaan naar Foto's</div>
                  </div>
                </a>

                {/* ZIP download section */}
                <div className="mt-4 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <div>
                      <div className="font-bold text-white">ZIP bestand</div>
                      <div className="text-xs text-white/70">Alle foto's in één download</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    {(["all", "erik", "benno"] as const).map((opt) => {
                      const count = opt === "all" 
                        ? photos.length 
                        : photos.filter(p => p.uploader === opt).length;
                      const label = opt === "all" ? "Alle" : opt === "erik" ? "Erik" : "Benno";
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setDownloadFilter(opt)}
                          className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                            downloadFilter === opt 
                              ? "bg-[#c9a227] text-[#0b1f3a]" 
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    className="mt-3 w-full rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a]"
                  >
                    ⬇️ Download ZIP
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDownloadModal(false)}
                  className="mt-4 w-full rounded-xl bg-white/10 py-3 text-sm font-semibold text-white"
                >
                  Annuleren
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PresentationModal({
  photos,
  currentIndex,
  onIndexChange,
  onClose,
  dayLabel,
}: {
  photos: PhotoMeta[];
  currentIndex: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  dayLabel: (d: string) => string;
}) {
  const current = photos[currentIndex];
  const [autoPlay, setAutoPlay] = useState(false);

  const goNext = () => onIndexChange((currentIndex + 1) % photos.length);
  const goPrev = () => onIndexChange((currentIndex - 1 + photos.length) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, photos.length]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, currentIndex, photos.length]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!current) return null;

  const dayFull: Record<string, string> = {
    "2026-10-03": "Zaterdag 3 oktober",
    "2026-10-04": "Zondag 4 oktober",
    "2026-10-05": "Maandag 5 oktober",
    "2026-10-06": "Dinsdag 6 oktober",
    "2026-10-07": "Woensdag 7 oktober",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-b from-[#0a1628] via-[#061018] to-[#030810]"
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇲🇹</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">Malta 2026</p>
            <p className="text-sm text-white/50">{currentIndex + 1} van {photos.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoPlay(!autoPlay)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              autoPlay
                ? "bg-[#c9a227] text-[#0b1f3a] shadow-lg shadow-[#c9a227]/30"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {autoPlay ? "■ Stop" : "▶ Diashow"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
      </div>

      {/* Media container */}
      <div className="relative flex flex-1 items-center justify-center p-4">
        {/* Navigation arrows */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-0 top-0 z-10 flex h-full w-16 items-center justify-start pl-2 text-white/30 hover:text-white/70"
          aria-label="Vorige"
        >
          <span className="text-3xl">‹</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-0 top-0 z-10 flex h-full w-16 items-center justify-end pr-2 text-white/30 hover:text-white/70"
          aria-label="Volgende"
        >
          <span className="text-3xl">›</span>
        </button>

        {/* Photo */}
        <div className="relative max-h-full max-w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.id}
            src={current.fullUrl}
            alt={current.caption || "Foto"}
            className="max-h-[60vh] max-w-full object-contain"
          />
        </div>
      </div>

      {/* Info panel */}
      <div
        className="shrink-0 px-6 pb-6"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-lg rounded-2xl bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">
            {dayFull[current.day] || dayLabel(current.day)}
          </p>
          {current.caption ? (
            <p className="mt-2 text-xl font-bold leading-tight text-white">
              {current.caption}
            </p>
          ) : (
            <p className="mt-2 text-lg text-white/50 italic">
              Geen beschrijving
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
              current.uploader === "erik" ? "bg-blue-500" : "bg-green-500"
            }`}>
              {current.uploader === "erik" ? "E" : "B"}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {current.uploader === "erik" ? "Erik" : "Benno"}
              </p>
              <p className="text-xs text-white/50">Fotograaf</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      {photos.length <= 20 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onIndexChange(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex
                  ? "w-6 bg-[#c9a227]"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LikeButton({
  likeCount,
  isLiked,
  onLike,
}: {
  likeCount: number;
  isLiked: boolean;
  onLike: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onLike}
      className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all active:scale-95 ${
        isLiked 
          ? "bg-red-500 text-white" 
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      <span className="text-xl">{isLiked ? "❤️" : "🤍"}</span>
      <span className="font-semibold">
        {likeCount > 0 ? likeCount : ""} {isLiked ? "Liked" : "Like"}
      </span>
    </button>
  );
}
