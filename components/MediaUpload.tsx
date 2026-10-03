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

export function MediaUpload() {
  const [user, setUser] = useState<MediaUser | null>(null);
  const [day, setDay] = useState<TripDayId | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploads, setUploads] = useState<MediaUploadEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMediaUploads()
      .then(setUploads)
      .catch(() => {});
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    setError(null);
    setSuccess(false);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newEntry = await uploadMedia(file, user, {
          day: day ?? undefined,
          caption: caption.trim() || undefined,
          onProgress: (p) => {
            const overallProgress = ((i + p / 100) / files.length) * 100;
            setProgress(overallProgress);
          },
        });
        setUploads((prev) => [newEntry, ...prev]);
      }
      setSuccess(true);
      setCaption("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const startPresentation = () => {
    if (uploads.length === 0) return;
    setPresentationIndex(0);
    setShowPresentation(true);
  };

  const nextSlide = () => {
    setPresentationIndex((i) => (i + 1) % uploads.length);
  };

  const prevSlide = () => {
    setPresentationIndex((i) => (i - 1 + uploads.length) % uploads.length);
  };

  const closePresentation = () => {
    setShowPresentation(false);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Presentatie Modal */}
      {showPresentation && uploads.length > 0 && (
        <PresentationModal
          uploads={uploads}
          currentIndex={presentationIndex}
          onNext={nextSlide}
          onPrev={prevSlide}
          onClose={closePresentation}
        />
      )}

      {/* Wie ben je? */}
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
      </div>

      {user && (
        <>
          {/* Welke dag? */}
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm font-semibold text-[#c9a227]">Welke dag?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(TRIP_DAY_LABELS) as TripDayId[]).map((dayId) => (
                <button
                  key={dayId}
                  type="button"
                  onClick={() => setDay(day === dayId ? null : dayId)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    day === dayId
                      ? "bg-[#c9a227] text-[#0b1f3a]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {TRIP_DAY_LABELS[dayId]}
                </button>
              ))}
            </div>
          </div>

          {/* Naam / beschrijving */}
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-sm font-semibold text-[#c9a227]">
              Naam of beschrijving (optioneel)
            </p>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Bijv. Sunset bij Blue Lagoon"
              className="mt-3 w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:bg-white/15"
            />
          </div>

          {/* Upload knop */}
          <div className="rounded-xl bg-white/5 p-4">
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {uploading ? "Bezig met uploaden..." : "Selecteer uit fotoalbum"}
            </button>

            {uploading && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-[#c9a227] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-white/60">
                  {Math.round(progress)}%
                </p>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-500/20 p-2 text-center text-sm text-red-300">
                {error}
              </p>
            )}

            {success && (
              <p className="mt-3 rounded-lg bg-green-500/20 p-2 text-center text-sm text-green-300">
                Upload gelukt!
              </p>
            )}
          </div>
        </>
      )}

      {/* Presentatie knop */}
      {uploads.length > 0 && (
        <button
          type="button"
          onClick={startPresentation}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-[#0b1f3a] transition-all active:scale-[0.98]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Presentatie starten ({uploads.length} foto&apos;s)
        </button>
      )}

      {/* Grid met uploads */}
      {uploads.length > 0 && (
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm font-semibold text-[#c9a227]">
            Geüploade foto&apos;s ({uploads.length})
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {uploads.slice(0, 9).map((upload, i) => (
              <div
                key={upload.id || i}
                className="relative aspect-square overflow-hidden rounded-lg bg-black/30"
              >
                {upload.fileType.startsWith("video/") ? (
                  <video
                    src={upload.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={upload.url}
                    alt={upload.caption || upload.fileName}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4">
                  <span className="block truncate text-[10px] font-medium text-white">
                    {upload.caption ||
                      (upload.day ? TRIP_DAY_LABELS[upload.day] : "")}
                  </span>
                </div>
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {upload.user === "benno" ? "B" : "E"}
                </span>
                {upload.day && (
                  <span className="absolute right-1 top-1 rounded bg-[#c9a227]/80 px-1.5 py-0.5 text-[10px] font-bold text-[#0b1f3a]">
                    {upload.day.split("-")[0].toUpperCase()}
                  </span>
                )}
                {upload.fileType.startsWith("video/") && (
                  <span className="absolute right-1 top-6 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    ▶
                  </span>
                )}
              </div>
            ))}
          </div>
          {uploads.length > 9 && (
            <p className="mt-2 text-center text-xs text-white/50">
              +{uploads.length - 9} meer
            </p>
          )}
        </div>
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " ") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(onNext, 4000);
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

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="text-sm text-white/70">
          {currentIndex + 1} / {uploads.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoPlay(!autoPlay)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              autoPlay ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/15 text-white"
            }`}
          >
            {autoPlay ? "Stop" : "Auto"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-tap flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
      </div>

      {/* Media */}
      <div
        className="flex flex-1 items-center justify-center px-2"
        onClick={onNext}
      >
        {current.fileType.startsWith("video/") ? (
          <video
            key={current.url}
            src={current.url}
            className="max-h-full max-w-full object-contain"
            controls
            autoPlay
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.url}
            src={current.url}
            alt={current.caption || current.fileName}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      {/* Info & Controls */}
      <div
        className="shrink-0 px-4 pb-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {/* Caption & metadata */}
        <div className="mb-3 text-center">
          {current.caption && (
            <p className="text-lg font-semibold text-white">{current.caption}</p>
          )}
          <p className="mt-1 text-sm text-white/60">
            {current.day ? TRIP_DAY_LABELS[current.day] : ""}
            {current.day && " · "}
            {current.user === "benno" ? "Benno" : "Erik"}
          </p>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-xl text-white"
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-xl text-white"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
