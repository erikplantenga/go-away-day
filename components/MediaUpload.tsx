"use client";

import { useState, useRef, useEffect } from "react";
import { uploadMedia, getMediaUploads, type MediaUser, type MediaUploadEntry } from "@/lib/mediaUpload";

export function MediaUpload() {
  const [user, setUser] = useState<MediaUser | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploads, setUploads] = useState<MediaUploadEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
        const newEntry = await uploadMedia(file, user, (p) => {
          const overallProgress = ((i + p / 100) / files.length) * 100;
          setProgress(overallProgress);
        });
        setUploads((prev) => [newEntry, ...prev]);
      }
      setSuccess(true);
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

  return (
    <div className="space-y-4 pb-4">
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
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm font-semibold text-[#c9a227]">
            Selecteer foto&apos;s of video&apos;s
          </p>
          <p className="mt-1 text-sm text-white/60">
            Je kunt meerdere bestanden tegelijk selecteren
          </p>

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
      )}

      {uploads.length > 0 && (
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm font-semibold text-[#c9a227]">
            Geüploade bestanden ({uploads.length})
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
                    alt={upload.fileName}
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {upload.user === "benno" ? "B" : "E"}
                </span>
                {upload.fileType.startsWith("video/") && (
                  <span className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
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
