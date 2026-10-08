"use client";

import { useEffect, useState } from "react";
import type { IdeasUser } from "@/lib/ideas2027";
import {
  clearFaceIdVault,
  enableFaceId,
  loadFaceIdVault,
  loginWithFaceId,
} from "@/lib/ideasFaceId";

type UnlockProps = {
  onUnlocked: (creds: { user: IdeasUser; password: string }) => void | Promise<void>;
  busy?: boolean;
  className?: string;
};

/** Login-knop als Face ID al is ingesteld op dit apparaat */
export function FaceIdUnlockButton({ onUnlocked, busy, className }: UnlockProps) {
  const [enabled, setEnabled] = useState(false);
  const [localBusy, setLocalBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEnabled(!!loadFaceIdVault());
  }, []);

  if (!enabled) return null;

  const run = async () => {
    setError("");
    setLocalBusy(true);
    try {
      const unlocked = await loginWithFaceId();
      await onUnlocked(unlocked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Face ID mislukt");
    } finally {
      setLocalBusy(false);
    }
  };

  const isBusy = busy || localBusy;

  return (
    <div className={className}>
      <button
        type="button"
        disabled={isBusy}
        onClick={() => void run()}
        className="w-full rounded-xl border border-[#c9a227]/60 bg-[#c9a227]/15 py-3 text-sm font-bold text-[#c9a227] disabled:opacity-50"
      >
        {isBusy ? "Bezig…" : "Inloggen met Face ID"}
      </button>
      {error && <p className="mt-2 text-center text-sm text-red-300">{error}</p>}
    </div>
  );
}

type SetupProps = {
  user: IdeasUser | "" | null;
  password: string;
  className?: string;
};

/** Inschakelen / uitzetten na wachtwoord-login */
export function FaceIdSetupRow({ user, password, className }: SetupProps) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setEnabled(!!loadFaceIdVault());
  }, []);

  const canEnable = !!user && password.length > 0;

  const handleEnable = async () => {
    if (!user || !password) return;
    setMsg("");
    setBusy(true);
    try {
      await enableFaceId(user, password);
      setEnabled(true);
      setMsg("Face ID staat aan — werkt overal in de app.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Face ID mislukt");
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = () => {
    clearFaceIdVault();
    setEnabled(false);
    setMsg("Face ID uitgezet.");
  };

  return (
    <div className={`rounded-2xl border border-[#c9a227]/40 bg-[#c9a227]/10 px-4 py-3 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#c9a227]">Face ID / Touch ID</p>
          <p className="mt-0.5 text-xs text-white/60">
            {enabled
              ? "Aan — quiz, foto's en ideeën"
              : canEnable
                ? "Koppel voor sneller inloggen overal"
                : "Eerst wachtwoord invullen, dan inschakelen"}
          </p>
        </div>
        {enabled ? (
          <button
            type="button"
            onClick={handleDisable}
            className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80"
          >
            Uit
          </button>
        ) : (
          <button
            type="button"
            disabled={busy || !canEnable}
            onClick={() => void handleEnable()}
            className="shrink-0 rounded-xl bg-[#c9a227] px-3 py-2 text-xs font-bold text-[#0b1f3a] disabled:opacity-40"
          >
            {busy ? "…" : "Inschakelen"}
          </button>
        )}
      </div>
      {msg && <p className="mt-2 text-xs text-white/80">{msg}</p>}
    </div>
  );
}
