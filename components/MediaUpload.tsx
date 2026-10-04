"use client";

import { useState, useRef, useEffect } from "react";
import {
  uploadMedia,
  getMediaUploads,
  TRIP_DAY_LABELS,
  type MediaUser,
  type MediaUploadEntry,
  type TripDayId,
} from "@/lib/mediaUpload";

interface PendingFile {
  file: File;
  preview: string;
  caption: string;
  day: TripDayId | null;
}

export function MediaUpload() {
  const [user, setUser] = useState<MediaUser | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploads, setUploads] = useState<MediaUploadEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [filter, setFilter] = useState<MediaUser | "all">("all");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [globalDay, setGlobalDay] = useState<TripDayId | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMediaUploads()
      .then(setUploads)
      .catch(() => {});
  }, []);

  const filteredUploads = filter === "all" 
    ? uploads 
    : uploads.filter(u => u.user === filter);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newPending: PendingFile[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      day: globalDay,
    }));
    
    setPendingFiles(prev => [...prev, ...newPending]);
  };

  const updatePendingCaption = (index: number, caption: string) => {
    setPendingFiles(prev => prev.map((p, i) => 
      i === index ? { ...p, caption } : p
    ));
  };

  const updatePendingDay = (index: number, day: TripDayId | null) => {
    setPendingFiles(prev => prev.map((p, i) => 
      i === index ? { ...p, day } : p
    ));
  };

  const removePending = (index: number) => {
    setPendingFiles(prev => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const applyDayToAll = (day: TripDayId) => {
    setGlobalDay(day);
    setPendingFiles(prev => prev.map(p => ({ ...p, day })));
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0 || !user) return;

    setUploading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const pending = pendingFiles[i];
        const newEntry = await uploadMedia(pending.file, user, {
          day: pending.day ?? undefined,
          caption: pending.caption.trim() || undefined,
          onProgress: (p) => {
            const overallProgress = ((i + p / 100) / pendingFiles.length) * 100;
            setProgress(overallProgress);
          },
        });
        setUploads((prev) => [newEntry, ...prev]);
      }
      
      // Cleanup previews
      pendingFiles.forEach(p => URL.revokeObjectURL(p.preview));
      
      setSuccess(true);
      setPendingFiles([]);
      setGlobalDay(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const cancelUpload = () => {
    pendingFiles.forEach(p => URL.revokeObjectURL(p.preview));
    setPendingFiles([]);
    setGlobalDay(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const startPresentation = (startIndex = 0) => {
    if (filteredUploads.length === 0) return;
    setPresentationIndex(startIndex);
    setShowPresentation(true);
  };

  const nextSlide = () => {
    setPresentationIndex((i) => (i + 1) % filteredUploads.length);
  };

  const prevSlide = () => {
    setPresentationIndex((i) => (i - 1 + filteredUploads.length) % filteredUploads.length);
  };

  const closePresentation = () => {
    setShowPresentation(false);
  };

  return (
    <div className="space-y-3 pb-4">
      {showPresentation && filteredUploads.length > 0 && (
        <PresentationModal
          uploads={filteredUploads}
          currentIndex={presentationIndex}
          onNext={nextSlide}
          onPrev={prevSlide}
          onClose={closePresentation}
        />
      )}

      {/* Upload sectie */}
      <div className="rounded-xl bg-white/5 p-4">
        <p className="text-sm font-semibold text-[#c9a227]">Wie ben je?</p>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => setUser("benno")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
              user === "benno"
                ? "bg-[#c9a227] text-[#0b1f3a]"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Benno
          </button>
          <button
            type="button"
            onClick={() => setUser("erik")}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
              user === "erik"
                ? "bg-[#c9a227] text-[#0b1f3a]"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Erik
          </button>
        </div>

        {user && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {pendingFiles.length > 0 ? "Meer toevoegen" : "Selecteer foto's"}
            </button>

            {pendingFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                {/* Dag voor alles */}
                <div>
                  <p className="text-xs text-white/60">Dag voor alle foto&apos;s:</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(Object.keys(TRIP_DAY_LABELS) as TripDayId[]).map((dayId) => (
                      <button
                        key={dayId}
                        type="button"
                        onClick={() => applyDayToAll(dayId)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                          globalDay === dayId
                            ? "bg-[#c9a227] text-[#0b1f3a]"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {TRIP_DAY_LABELS[dayId]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Foto lijst */}
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {pendingFiles.map((pending, i) => (
                    <div key={i} className="flex gap-3 rounded-lg bg-white/5 p-2">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/30">
                        {pending.file.type.startsWith("video/") ? (
                          <video src={pending.preview} className="h-full w-full object-cover" muted />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pending.preview} alt="" className="h-full w-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removePending(i)}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                        >
                          ×
                        </button>
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          type="text"
                          value={pending.caption}
                          onChange={(e) => updatePendingCaption(i, e.target.value)}
                          placeholder="Naam..."
                          className="w-full rounded bg-white/10 px-2 py-1 text-sm text-white placeholder-white/40 outline-none"
                        />
                        <select
                          value={pending.day || ""}
                          onChange={(e) => updatePendingDay(i, (e.target.value || null) as TripDayId | null)}
                          className="w-full rounded bg-white/10 px-2 py-1 text-xs text-white outline-none"
                        >
                          <option value="">Geen dag</option>
                          {(Object.keys(TRIP_DAY_LABELS) as TripDayId[]).map((dayId) => (
                            <option key={dayId} value={dayId}>{TRIP_DAY_LABELS[dayId]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Knoppen */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelUpload}
                    disabled={uploading}
                    className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-semibold text-white"
                  >
                    Annuleer
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
                  >
                    {uploading ? "Bezig..." : `Opslaan (${pendingFiles.length})`}
                  </button>
                </div>
              </div>
            )}

            {uploading && (
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-[#c9a227] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/20 p-2 text-center text-sm text-red-300">
                {error}
              </p>
            )}

            {success && (
              <p className="mt-3 rounded-lg bg-green-500/20 p-2 text-center text-sm text-green-300">
                Opgeslagen!
              </p>
            )}
          </>
        )}
      </div>

      {/* Filter en presentatie */}
      {uploads.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 rounded-lg bg-white/5 p-1">
            {(["all", "benno", "erik"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-[#c9a227] text-[#0b1f3a]"
                    : "text-white/70"
                }`}
              >
                {f === "all" ? "Alles" : f === "benno" ? "Benno" : "Erik"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => startPresentation(0)}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#0b1f3a]"
          >
            <span>▶</span>
            <span>{filteredUploads.length}</span>
          </button>
        </div>
      )}

      {/* Grid */}
      {filteredUploads.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {filteredUploads.slice(0, 15).map((upload, i) => (
            <div
              key={upload.id || i}
              className="relative aspect-square overflow-hidden rounded-lg bg-black/30"
              onClick={() => startPresentation(i)}
            >
              {upload.fileType.startsWith("video/") ? (
                <video
                  src={upload.url || upload.data}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={upload.url || upload.data}
                  alt={upload.caption || upload.fileName}
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white">
                {upload.user === "benno" ? "B" : "E"}
              </span>
              {upload.fileType.startsWith("video/") && (
                <span className="absolute right-1 top-1 text-xs text-white drop-shadow">▶</span>
              )}
            </div>
          ))}
        </div>
      )}
      {filteredUploads.length > 15 && (
        <p className="text-center text-xs text-white/50">
          +{filteredUploads.length - 15} meer
        </p>
      )}
    </div>
  );
}

function PresentationModal({
  uploads,
  currentIndex,
  onNext,
  onPrev,
  onClose,
}: {
  uploads: MediaUploadEntry[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  const current = uploads[currentIndex];
  const [autoPlay, setAutoPlay] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") onNext();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "i") setShowInfo(v => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(onNext, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, onNext]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!current) return null;

  const dayFull: Record<TripDayId, string> = {
    "za-3": "Zaterdag 3 oktober",
    "zo-4": "Zondag 4 oktober", 
    "ma-5": "Maandag 5 oktober",
    "di-6": "Dinsdag 6 oktober",
    "wo-7": "Woensdag 7 oktober",
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
            <p className="text-sm text-white/50">{currentIndex + 1} van {uploads.length}</p>
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
        {/* Navigation areas */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-0 top-0 z-10 flex h-full w-16 items-center justify-start pl-2 text-white/30 hover:text-white/70"
          aria-label="Vorige"
        >
          <span className="text-3xl">‹</span>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-0 top-0 z-10 flex h-full w-16 items-center justify-end pr-2 text-white/30 hover:text-white/70"
          aria-label="Volgende"
        >
          <span className="text-3xl">›</span>
        </button>

        {/* Media */}
        <div className="relative max-h-full max-w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
          {current.fileType.startsWith("video/") ? (
            <video
              key={current.id}
              src={current.url || current.data}
              className="max-h-[65vh] max-w-full object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.id}
              src={current.url || current.data}
              alt={current.caption || current.fileName}
              className="max-h-[65vh] max-w-full object-contain"
            />
          )}
        </div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div
          className="shrink-0 px-6 pb-6"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-lg rounded-2xl bg-white/5 p-5 backdrop-blur-sm">
            {current.day && (
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">
                {dayFull[current.day]}
              </p>
            )}
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
              <div className={`h-8 w-8 rounded-full ${current.user === "erik" ? "bg-blue-500" : "bg-green-500"} flex items-center justify-center text-sm font-bold text-white`}>
                {current.user === "erik" ? "E" : "B"}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {current.user === "erik" ? "Erik" : "Benno"}
                </p>
                <p className="text-xs text-white/50">Fotograaf</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress dots */}
      {uploads.length <= 20 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {uploads.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const diff = i - currentIndex;
                if (diff > 0) for (let j = 0; j < diff; j++) onNext();
                else for (let j = 0; j < -diff; j++) onPrev();
              }}
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
