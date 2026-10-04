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

  const [who, setWho] = useState<"erik" | "benno" | "">("");
  const [password, setPassword] = useState("");
  const [day, setDay] = useState(DAYS[1].value);
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = () => {
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

    const formData = new FormData();
    formData.append("op", "upload");
    formData.append("who", who);
    formData.append("password", password);
    formData.append("day", day);
    formData.append("caption", caption);
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      setUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.photo) {
          setShowUpload(false);
          setCaption("");
          setUploadProgress(0);
          if (fileRef.current) fileRef.current.value = "";
          loadPhotos();
        } else {
          setError(data.error || "Upload mislukt");
        }
      } catch {
        setError("Onverwachte fout: " + xhr.status);
      }
    });

    xhr.addEventListener("error", () => {
      setUploading(false);
      setError("Geen verbinding met server");
    });

    xhr.addEventListener("abort", () => {
      setUploading(false);
      setError("Upload geannuleerd");
    });

    xhr.open("POST", "/api/photos");
    xhr.send(formData);
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

        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
        >
          <span className="text-lg">📷</span> Foto uploaden
        </button>

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
                  <p className="text-xs font-semibold text-white">{photo.uploader === "erik" ? "Erik" : "Benno"}</p>
                  <p className="truncate text-xs text-white/70">{dayLabel(photo.day)}</p>
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
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                  className="w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                <p className="mt-1 text-xs text-white/50">Kies uit camera of fotoalbum</p>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
