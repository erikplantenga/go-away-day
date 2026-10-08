"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PhotoMeta = {
  id: string;
  uploader: "erik" | "benno";
  day: string;
  caption: string;
  uploadedAt: string;
  thumbUrl: string;
  fullUrl: string;
  isVideo?: boolean;
};

type Filter = "all" | "erik" | "benno";

const DAYS: Record<string, string> = {
  "2026-10-03": "Zaterdag 3 okt",
  "2026-10-04": "Zondag 4 okt",
  "2026-10-05": "Maandag 5 okt",
  "2026-10-06": "Dinsdag 6 okt",
  "2026-10-07": "Woensdag 7 okt",
};

export default function DownloadPage() {
  const [photos, setPhotos] = useState<PhotoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        setPhotos(data.photos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = photos.filter((p) => filter === "all" || p.uploader === filter);

  const groupedByDay = filtered.reduce((acc, photo) => {
    if (!acc[photo.day]) acc[photo.day] = [];
    acc[photo.day].push(photo);
    return acc;
  }, {} as Record<string, PhotoMeta[]>);

  const sortedDays = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1f3a]">
        <div className="text-xl text-white">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1f3a] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b1f3a]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl">
              ←
            </Link>
            <h1 className="text-lg font-bold text-white">Download HD Foto's</h1>
            <div className="w-8" />
          </div>

          {/* Filter buttons */}
          <div className="mt-4 flex gap-2">
            {(["all", "erik", "benno"] as const).map((opt) => {
              const count = opt === "all" ? photos.length : photos.filter((p) => p.uploader === opt).length;
              const label = opt === "all" ? "Allemaal" : opt === "erik" ? "Erik" : "Benno";
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilter(opt)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    filter === opt ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-center text-xs text-white/60">
            📱 Lang indrukken op foto → "Bewaar afbeelding" om naar Foto's te bewaren
          </p>
        </div>
      </div>

      {/* Photos by day */}
      <div className="mx-auto max-w-2xl px-4">
        {sortedDays.map((day) => (
          <div key={day} className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-[#c9a227]">
              {DAYS[day] || day} ({groupedByDay[day].length})
            </h2>
            <div className="space-y-4">
              {groupedByDay[day].map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded-xl bg-white/5">
                  {photo.isVideo ? (
                    <video
                      src={photo.fullUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full"
                      poster={photo.thumbUrl}
                    />
                  ) : (
                    <div className="relative">
                      {!loadedImages.has(photo.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#c9a227]" />
                        </div>
                      )}
                      <img
                        src={photo.fullUrl}
                        alt={photo.caption || "Foto"}
                        className={`w-full transition-opacity duration-300 ${
                          loadedImages.has(photo.id) ? "opacity-100" : "opacity-0"
                        }`}
                        onLoad={() => handleImageLoad(photo.id)}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span className={photo.uploader === "erik" ? "text-blue-400" : "text-pink-400"}>
                        {photo.uploader === "erik" ? "👨 Erik" : "👨 Benno"}
                      </span>
                      {photo.caption && photo.caption !== "(Hersteld)" && (
                        <span className="text-white/70">{photo.caption}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="mt-10 text-center text-white/50">Geen foto's gevonden</div>
        )}
      </div>

      {/* Stats footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b1f3a]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 text-center text-sm text-white/70">
          {filtered.filter((p) => !p.isVideo).length} foto's •{" "}
          {filtered.filter((p) => p.isVideo).length} video's
        </div>
      </div>
    </div>
  );
}
