"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Idea2027, IdeasUser } from "@/lib/ideas2027";
import {
  loadIdeasSession,
  loadSeenIdeaIds,
  markIdeasSeen,
  saveSeenIdeaIds,
} from "@/lib/ideasSeen";

const POLL_MS = 12_000;

function displayName(user: IdeasUser) {
  return user === "erik" ? "Erik" : "Benno";
}

function LightbulbIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-[#c9a227]"
    >
      <path
        d="M9 18h6M10 21h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 3a6 6 0 0 0-3.5 10.8c.5.4.8 1 .9 1.7h5.2c.1-.7.4-1.3.9-1.7A6 6 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 7v2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IdeasNewIdeaPopup() {
  const [toast, setToast] = useState<{ name: string; count: number } | null>(null);
  const showing = useRef(false);
  const seeded = useRef(false);

  const dismiss = useCallback(() => {
    showing.current = false;
    setToast(null);
  }, []);

  const check = useCallback(async () => {
    if (showing.current) return;
    const session = loadIdeasSession();
    if (!session) return;

    try {
      const r = await fetch("/api/ideas-2027", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "list",
          user: session.user,
          password: session.password,
        }),
      });
      if (!r.ok) return;
      const json = await r.json();
      const ideas = (json.data ?? []) as Idea2027[];
      const ids = ideas.map((i) => i.id);
      const seen = loadSeenIdeaIds();

      // Eerste keer: alles als gezien markeren, geen popup voor oude ideeën
      if (!seeded.current && seen.size === 0) {
        saveSeenIdeaIds(ids);
        seeded.current = true;
        return;
      }
      seeded.current = true;

      const fresh = ideas.filter(
        (i) => i.author !== session.user && !seen.has(i.id),
      );
      if (!fresh.length) return;

      const newest = [...fresh].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      )[0]!;
      const sameAuthor = fresh.filter((i) => i.author === newest.author);

      // Direct als gezien markeren → wegklikken = nooit opnieuw dezelfde popup
      markIdeasSeen(fresh.map((i) => i.id));
      showing.current = true;
      setToast({
        name: displayName(newest.author),
        count: sameAuthor.length,
      });
    } catch {
      /* stil falen */
    }
  }, []);

  useEffect(() => {
    void check();
    const id = window.setInterval(() => void check(), POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [check]);

  if (!toast) return null;

  const title =
    toast.count === 1
      ? `${toast.name} heeft een idee`
      : `${toast.name} heeft ${toast.count} nieuwe ideeën`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
      <style>{`@keyframes ideasToastIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-3xl border border-[#c9a227]/40 bg-gradient-to-b from-[#0b1f3a] to-[#061220] px-6 py-7 text-center shadow-2xl"
        style={{ animation: "ideasToastIn .25s ease-out" }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#c9a227]/15">
          <LightbulbIcon />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm text-white/60">Bekijk het bij Ideeën 2027</p>
        <div className="mt-6 flex flex-col gap-2">
          <a
            href="/ideeen-2027"
            onClick={dismiss}
            className="w-full rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a]"
          >
            Naar ideeën
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-xl bg-white/10 py-3 text-sm font-semibold text-white/80"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
