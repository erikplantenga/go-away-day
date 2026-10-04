"use client";

import { useEffect, useState } from "react";

export default function FotoStatusPage() {
  const [result, setResult] = useState<{ ok?: boolean; message?: string; cloudName?: string } | null>(null);

  useEffect(() => {
    fetch("/api/photos?test=1")
      .then((r) => r.json())
      .then(setResult)
      .catch(() => setResult({ ok: false, message: "Kon status niet ophalen" }));
  }, []);

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-[#0b1f3a] px-5 py-10 text-white">
      <h1 className="text-2xl font-bold">Foto status</h1>
      <p className="mt-2 text-sm text-white/70">Check of Cloudinary werkt voor uploads.</p>

      {!result ? (
        <p className="mt-8 text-sm text-white/60">Bezig met checken…</p>
      ) : (
        <div
          className={`mt-8 rounded-2xl px-4 py-5 ${
            result.ok ? "bg-emerald-500/20 text-emerald-100" : "bg-red-500/20 text-red-100"
          }`}
        >
          <p className="text-lg font-bold">{result.ok ? "Werkt!" : "Nog niet klaar"}</p>
          <p className="mt-2 text-sm">{result.message}</p>
          {result.cloudName && <p className="mt-2 text-xs opacity-70">Cloud: {result.cloudName}</p>}
        </div>
      )}

      {!result?.ok && (
        <div className="mt-6 space-y-3 text-sm text-white/80">
          <p className="font-semibold text-white">Dit moet je checken in Vercel:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Settings → Environment Variables</li>
            <li>
              CLOUDINARY_URL moet exact zo:
              <br />
              <code className="mt-1 block break-all rounded-lg bg-black/30 px-2 py-2 text-xs">
                cloudinary://API_KEY:API_SECRET@lfj4hm44
              </code>
            </li>
            <li>Kopieer API Key + Secret opnieuw uit Cloudinary (Settings → API Keys)</li>
            <li>Save → Deployments → Redeploy</li>
          </ol>
        </div>
      )}

      <a
        href="/"
        className="mt-8 flex min-h-11 items-center justify-center rounded-xl bg-[#c9a227] text-sm font-bold text-[#0b1f3a]"
      >
        Terug naar app
      </a>
    </main>
  );
}
