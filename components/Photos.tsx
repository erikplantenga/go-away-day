"use client";

import { useEffect, useState, useRef } from "react";

type PhotoMeta = {
  id: string;
  uploader: "erik" | "benno";
  day: string;
  caption: string;
  uploadedAt: string;
  thumbUrl: string;
  fullUrl: string;
  likeCount?: number;
};

const DAYS = [
  { value: "2026-10-03", label: "Vrijdag 3 okt" },
  { value: "2026-10-04", label: "Zaterdag 4 okt" },
  { value: "2026-10-05", label: "Zondag 5 okt" },
  { value: "2026-10-06", label: "Maandag 6 okt" },
  { value: "2026-10-07", label: "Dinsdag 7 okt" },
];

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
  const [day, setDay] = useState(DAYS[1].value);
  const [caption, setCaption] = useState("");
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLike = async (photoId: string) => {
    try {
      const res = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "toggle-like", photoId }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCount = data.likeCount as number;
        // Update local state
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
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoadingLocation(true);
    setLocationName(null);

    try {
      const coords = await readExifLocation(file);
      if (coords) {
        const name = await reverseGeocode(coords.lat, coords.lng);
        if (name) {
          setLocationName(name);
          if (!caption) {
            setCaption(name);
          }
        }
      }
    } catch {
      // No location found, that's ok
    } finally {
      setLoadingLocation(false);
    }
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

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Selecteer eerst een foto");
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
    if (!day) {
      setError("Kies een dag");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError("");

    let uploadFile: Blob = file;
    
    if (file.type.startsWith("image/") && file.size > 2 * 1024 * 1024) {
      try {
        setUploadProgress(5);
        uploadFile = await compressImage(file, 2);
        setUploadProgress(10);
      } catch (e) {
        setError("Foto comprimeren mislukt");
        setUploading(false);
        return;
      }
    }

    try {
      // 1) Vraag handtekening aan bij onze server
      setUploadProgress(8);
      const signRes = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "sign", who, password }),
      });
      const signed = await signRes.json();
      if (!signRes.ok) {
        setError(signed.error || "Kon upload niet starten");
        setUploading(false);
        return;
      }

      // 2) Upload direct naar Cloudinary
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", uploadFile);
      cloudinaryData.append("api_key", signed.apiKey);
      cloudinaryData.append("timestamp", String(signed.timestamp));
      cloudinaryData.append("signature", signed.signature);
      cloudinaryData.append("folder", signed.folder);
      cloudinaryData.append("public_id", signed.publicId);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(10 + Math.round((e.loaded / e.total) * 80));
          }
        });
        xhr.addEventListener("load", async () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status < 200 || xhr.status >= 300 || !data.secure_url) {
              setError(data.error?.message || "Upload naar Cloudinary mislukt");
              reject(new Error("upload"));
              return;
            }

            setUploadProgress(95);
            const publicId = data.public_id as string;
            const thumbUrl = data.secure_url.replace(
              "/upload/",
              "/upload/c_fill,w_400,h_400,q_auto,f_auto/",
            );

            // 3) Bewaar metadata in Firestore (gedeeld voor Erik & Benno)
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
                  location: locationName || "",
                  thumbUrl,
                  fullUrl: data.secure_url,
                },
              }),
            });
            const saved = await saveRes.json();
            if (!saveRes.ok) {
              setError(saved.error || "Foto geüpload, maar opslaan mislukt");
              reject(new Error("save"));
              return;
            }

            setUploadProgress(100);
            setShowUpload(false);
            setCaption("");
            setLocationName(null);
            setUploadProgress(0);
            if (fileRef.current) fileRef.current.value = "";
            await loadPhotos();
            resolve();
          } catch {
            setError("Onverwachte fout: " + xhr.status);
            reject(new Error("parse"));
          }
        });
        xhr.addEventListener("error", () => {
          setError("Geen verbinding met Cloudinary");
          reject(new Error("network"));
        });
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`);
        xhr.send(cloudinaryData);
      });
    } catch {
      // error already set
    } finally {
      setUploading(false);
    }
  };

  const dayLabel = (dateStr: string) => {
    const found = DAYS.find((d) => d.value === dateStr);
    return found?.label ?? dateStr;
  };

  const filtered = photos;

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
              setLocationName(null);
              setCaption("");
            }}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
          >
            <span className="text-lg">📷</span> Upload
          </button>
          {filtered.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPresentationIndex(0);
                setShowPresentation(true);
              }}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#0b1f3a]"
            >
              <span>▶</span> Presentatie
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-white/60">Laden...</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/60">Nog geen foto's</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
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
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-[#0b1f3a] text-white" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center gap-2 px-3 pb-2"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="inline-tap flex min-h-11 items-center rounded-full bg-white/10 px-4 text-sm font-semibold"
            >
              ← Terug
            </button>
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4"
            style={{
              WebkitOverflowScrolling: "touch",
              paddingBottom: "max(10rem, env(safe-area-inset-bottom))",
            }}
          >
            <h2 className="mt-2 text-xl font-bold">Foto uploaden</h2>

            <div className="mt-4 space-y-3">
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

              <div>
                <p className="mb-2 text-sm font-semibold text-white/80">Welke dag?</p>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="min-h-11 w-full rounded-xl bg-white/10 px-4 text-base text-white"
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value} className="bg-[#0b1f3a]">
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-white/80">Foto</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                {loadingLocation ? (
                  <p className="mt-1 text-xs text-[#c9a227]">📍 Locatie ophalen...</p>
                ) : locationName ? (
                  <p className="mt-1 text-xs text-[#c9a227]">📍 {locationName}</p>
                ) : (
                  <p className="mt-1 text-xs text-white/50">Kies uit camera of fotoalbum</p>
                )}
              </div>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Beschrijving (optioneel)"
                rows={2}
                className="w-full rounded-xl bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/40"
              />

              {error && <p className="text-center text-sm text-red-300">{error}</p>}

              {uploading ? (
                <div className="space-y-2">
                  <div className="relative h-12 w-full overflow-hidden rounded-xl bg-white/10">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#c9a227] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white drop-shadow">
                        {uploadProgress}% uploaden...
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!who || !password}
                  onClick={handleUpload}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
                >
                  Uploaden
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {viewPhoto && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black" role="dialog" aria-modal="true">
          <div
            className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              type="button"
              onClick={() => setViewPhoto(null)}
              className="inline-tap flex min-h-11 items-center rounded-full bg-white/15 px-4 text-sm font-semibold text-white"
            >
              ← Terug
            </button>
            <a
              href={viewPhoto.fullUrl}
              download={`malta-${viewPhoto.day}-${viewPhoto.id}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-tap flex min-h-11 items-center rounded-full bg-[#c9a227] px-4 text-sm font-bold text-[#0b1f3a]"
            >
              ⬇ Download HD
            </a>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center px-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewPhoto.fullUrl}
                alt={viewPhoto.caption || "Foto"}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <p className="text-sm font-semibold text-white">
                {viewPhoto.uploader === "erik" ? "Erik" : "Benno"} · {dayLabel(viewPhoto.day)}
              </p>
              {viewPhoto.caption && (
                <p className="mt-1 text-sm text-white/80">{viewPhoto.caption}</p>
              )}
              
              {/* Like button */}
              <div className="mt-3">
                <LikeButton
                  likeCount={viewPhoto.likeCount ?? 0}
                  onLike={() => handleLike(viewPhoto.id)}
                />
              </div>
            </div>
          </div>
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
  onLike,
}: {
  likeCount: number;
  onLike: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onLike}
      className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white transition-all hover:bg-white/20 active:scale-95"
    >
      <span className="text-xl">❤️</span>
      <span className="font-semibold">{likeCount > 0 ? likeCount : "Like"}</span>
    </button>
  );
}
