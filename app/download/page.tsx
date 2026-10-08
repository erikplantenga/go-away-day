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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

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

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(filtered.map((p) => p.id)));
  };

  const selectNone = () => {
    setSelected(new Set());
  };

  const handleSaveToPhotos = async () => {
    const toSave = filtered.filter((p) => selected.has(p.id) && !p.isVideo);
    if (toSave.length === 0) return;

    setSaving(true);
    setSaveProgress({ current: 0, total: toSave.length });

    try {
      const files: File[] = [];
      
      for (let i = 0; i < toSave.length; i++) {
        const photo = toSave[i];
        setSaveProgress({ current: i + 1, total: toSave.length });
        
        try {
          const response = await fetch(photo.fullUrl);
          const blob = await response.blob();
          const ext = photo.fullUrl.includes(".png") ? "png" : "jpg";
          const file = new File([blob], `malta-${photo.day}-${i + 1}.${ext}`, { type: blob.type });
          files.push(file);
        } catch (err) {
          console.error("Failed to fetch:", photo.id, err);
        }
      }

      if (files.length > 0 && navigator.canShare?.({ files })) {
        await navigator.share({
          files,
          title: "Malta 2026 Foto's",
        });
      } else {
        alert("Je browser ondersteunt delen niet. Gebruik lang indrukken om foto's individueel op te slaan.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setSaving(false);
      setSaveProgress({ current: 0, total: 0 });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1f3a]">
        <div className="text-xl text-white">Laden...</div>
      </div>
    );
  }

  const selectedCount = filtered.filter((p) => selected.has(p.id)).length;
  const selectedPhotosCount = filtered.filter((p) => selected.has(p.id) && !p.isVideo).length;

  return (
    <div className="min-h-screen bg-[#0b1f3a] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b1f3a]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl">
              ←
            </Link>
            <h1 className="text-lg font-bold text-white">
              {selectMode ? `${selectedCount} geselecteerd` : "Download HD Foto's"}
            </h1>
            <button
              type="button"
              onClick={() => {
                setSelectMode(!selectMode);
                if (selectMode) setSelected(new Set());
              }}
              className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                selectMode ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
              }`}
            >
              {selectMode ? "Klaar" : "Selecteer"}
            </button>
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
                  onClick={() => {
                    setFilter(opt);
                    setSelected(new Set());
                  }}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    filter === opt ? "bg-[#c9a227] text-[#0b1f3a]" : "bg-white/10 text-white"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {selectMode && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-semibold text-white"
              >
                Selecteer alle ({filtered.length})
              </button>
              <button
                type="button"
                onClick={selectNone}
                className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-semibold text-white"
              >
                Deselecteer alles
              </button>
            </div>
          )}

          {!selectMode && (
            <p className="mt-3 text-center text-xs text-white/60">
              Tik op "Selecteer" om meerdere foto's te kiezen
            </p>
          )}
        </div>
      </div>

      {/* Photos grid */}
      <div className="mx-auto max-w-2xl px-4">
        {sortedDays.map((day) => (
          <div key={day} className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-[#c9a227]">
              {DAYS[day] || day} ({groupedByDay[day].length})
            </h2>
            <div className="grid grid-cols-3 gap-1">
              {groupedByDay[day].map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => selectMode && toggleSelect(photo.id)}
                  className={`relative aspect-square overflow-hidden rounded-lg ${
                    selectMode ? "cursor-pointer" : ""
                  }`}
                >
                  {photo.isVideo ? (
                    <div className="flex h-full w-full items-center justify-center bg-white/10">
                      <span className="text-2xl">🎬</span>
                    </div>
                  ) : (
                    <img
                      src={photo.thumbUrl}
                      alt={photo.caption || "Foto"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  
                  {selectMode && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition ${
                        selected.has(photo.id) ? "bg-[#c9a227]/30" : "bg-black/20"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                          selected.has(photo.id)
                            ? "border-[#c9a227] bg-[#c9a227] text-[#0b1f3a]"
                            : "border-white bg-black/30"
                        }`}
                      >
                        {selected.has(photo.id) && <span className="text-sm font-bold">✓</span>}
                      </div>
                    </div>
                  )}

                  {photo.isVideo && (
                    <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
                      Video
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="mt-10 text-center text-white/50">Geen foto's gevonden</div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b1f3a]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3">
          {saving ? (
            <div className="space-y-2">
              <div className="relative h-10 w-full overflow-hidden rounded-xl bg-white/10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#c9a227] transition-all duration-300"
                  style={{ width: `${(saveProgress.current / saveProgress.total) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white drop-shadow">
                    {saveProgress.current} / {saveProgress.total} laden...
                  </span>
                </div>
              </div>
            </div>
          ) : selectMode && selectedCount > 0 ? (
            <button
              type="button"
              onClick={handleSaveToPhotos}
              disabled={selectedPhotosCount === 0}
              className="w-full rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
            >
              📱 Bewaar {selectedPhotosCount} foto's naar Foto's
            </button>
          ) : (
            <div className="text-center text-sm text-white/70">
              {filtered.filter((p) => !p.isVideo).length} foto's •{" "}
              {filtered.filter((p) => p.isVideo).length} video's
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
