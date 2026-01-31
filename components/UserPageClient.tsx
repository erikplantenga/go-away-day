"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { validateToken, isValidUserSegment } from "@/lib/auth";
import type { UserId } from "@/lib/firestore";
import { ensurePreviewSeeded } from "@/lib/previewStorage";
import { clearGameData } from "@/lib/firestore";
import { PhaseBanner } from "@/components/PhaseBanner";
import { PhaseContent } from "@/components/PhaseContent";
import { ZoWerktHet } from "@/components/ZoWerktHet";
import { FeestDag } from "@/components/FeestDag";

const TOKEN_ERIK = process.env.NEXT_PUBLIC_TOKEN_ERIK ?? "";
const TOKEN_BENNO = process.env.NEXT_PUBLIC_TOKEN_BENNO ?? "";
const isDevelopment = !TOKEN_ERIK && !TOKEN_BENNO;

type Props = { user: string };

export function UserPageClient({ user }: Props) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isPreview = searchParams.get("preview") === "echt";
  const shouldReset = searchParams.get("reset") === "true";
  const [, setPreviewReady] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !isPreview) return;
    (window as unknown as { __GO_AWAY_DAY_PREVIEW__: boolean; __GO_AWAY_DAY_PREVIEW_PHASE__: string }).__GO_AWAY_DAY_PREVIEW__ = true;
    (window as unknown as { __GO_AWAY_DAY_PREVIEW_PHASE__: string }).__GO_AWAY_DAY_PREVIEW_PHASE__ =
      searchParams.get("phase") || "fruitautomaat";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- trigger re-render so getPhase() sees preview
    setPreviewReady(true);
  }, [isPreview, searchParams]);

  useEffect(() => {
    if (isPreview) void ensurePreviewSeeded();
  }, [isPreview]);

  useEffect(() => {
    if (shouldReset && isDevelopment && !resetDone) {
      clearGameData();
      setResetDone(true);
      if (typeof window !== "undefined") {
        window.location.href = window.location.pathname;
      }
    }
  }, [shouldReset, resetDone]);

  if (!isValidUserSegment(user)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        <p>Ongeldige pagina. Gebruik /erik of /benno met je token.</p>
      </div>
    );
  }

  const currentUser: UserId | null = validateToken(user, token) ?? (isPreview ? (user as UserId) : null);
  if (!currentUser) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <p>Ongeldige link. Gebruik de juiste URL met je token.</p>
      </div>
    );
  }

  return (
    <>
      {isPreview && (
        <p className="mb-2 rounded bg-amber-500/20 px-3 py-2 text-center text-sm text-amber-800 dark:text-amber-200">
          Preview – vooringevulde data om de echte flow te checken.
        </p>
      )}
      {isDevelopment && (
        <div className="mb-3 flex justify-end">
          <a
            href={`${window.location.pathname}?reset=true`}
            className="rounded border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-500/20 dark:text-red-400"
          >
            🗑️ Reset speldata
          </a>
        </div>
      )}
      <FeestDag />
      <ZoWerktHet showDemoHint />
      <div className="mb-6 rounded-lg border border-foreground/10 bg-background p-4">
        <PhaseBanner />
      </div>
      <PhaseContent currentUser={currentUser} />
    </>
  );
}
