"use client";

import { useCallback, useEffect, useState } from "react";
import type { Idea2027, IdeasUser } from "@/lib/ideas2027";
import {
  clearFaceIdVault,
  enableFaceId,
  loadFaceIdVault,
  loginWithFaceId,
  platformAuthenticatorAvailable,
} from "@/lib/ideasFaceId";

type IdeaRow = Idea2027 & { average: number | null };

const SESSION_KEY = "ideas2027_session";

type Session = { user: IdeasUser; password: string };

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if ((s.user === "erik" || s.user === "benno") && typeof s.password === "string") return s;
  } catch {}
  return null;
}

function saveSession(s: Session | null) {
  if (typeof window === "undefined") return;
  if (!s) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

async function api(op: string, session: Session, extra: Record<string, unknown> = {}) {
  const r = await fetch("/api/ideas-2027", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ op, user: session.user, password: session.password, ...extra }),
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || "Mislukt");
  return json;
}

export default function Ideas2027() {
  const [session, setSession] = useState<Session | null>(null);
  const [userPick, setUserPick] = useState<IdeasUser>("erik");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [faceAvailable, setFaceAvailable] = useState(false);
  const [faceEnabled, setFaceEnabled] = useState(false);
  const [faceMsg, setFaceMsg] = useState("");

  const refresh = useCallback(async (s: Session) => {
    setLoading(true);
    setError("");
    try {
      const res = await api("list", s);
      setIdeas((res.data ?? []) as IdeaRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Laden mislukt");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await platformAuthenticatorAvailable();
      if (!cancelled) setFaceAvailable(ok);
    })();
    const vault = loadFaceIdVault();
    setFaceEnabled(!!vault);
    if (vault) setUserPick(vault.user);

    const s = loadSession();
    if (s) {
      setSession(s);
      refresh(s);
    }
    return () => { cancelled = true; };
  }, [refresh]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setBusy(true);
    try {
      const s: Session = { user: userPick, password };
      await api("list", s); // validates password
      saveSession(s);
      setSession(s);
      await refresh(s);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login mislukt");
    } finally {
      setBusy(false);
    }
  };

  const handleFaceLogin = async () => {
    setLoginError("");
    setBusy(true);
    try {
      const unlocked = await loginWithFaceId();
      const s: Session = { user: unlocked.user, password: unlocked.password };
      await api("list", s);
      saveSession(s);
      setSession(s);
      await refresh(s);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Face ID mislukt");
    } finally {
      setBusy(false);
    }
  };

  const handleEnableFaceId = async () => {
    if (!session) return;
    setFaceMsg("");
    setBusy(true);
    try {
      await enableFaceId(session.user, session.password);
      setFaceEnabled(true);
      setFaceMsg("Face ID staat aan op dit apparaat.");
    } catch (err) {
      setFaceMsg(err instanceof Error ? err.message : "Face ID mislukt");
    } finally {
      setBusy(false);
    }
  };

  const handleDisableFaceId = () => {
    clearFaceIdVault();
    setFaceEnabled(false);
    setFaceMsg("Face ID uitgezet.");
  };

  const handleLogout = () => {
    saveSession(null);
    setSession(null);
    setIdeas([]);
    setPassword("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !text.trim()) return;
    setBusy(true);
    setError("");
    try {
      await api("add", session, { text: text.trim() });
      setText("");
      await refresh(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Opslaan mislukt");
    } finally {
      setBusy(false);
    }
  };

  const handleRate = async (id: string, rating: number) => {
    if (!session) return;
    setBusy(true);
    setError("");
    try {
      await api("rate", session, { id, rating });
      await refresh(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Raten mislukt");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (idea: IdeaRow) => {
    setEditingId(idea.id);
    setEditText(idea.text);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!session || editText.trim().length < 2) return;
    setBusy(true);
    setError("");
    try {
      await api("edit", session, { id, text: editText.trim() });
      setEditingId(null);
      setEditText("");
      await refresh(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bewerken mislukt");
    } finally {
      setBusy(false);
    }
  };

  if (!session) {
    return (
      <div className="mx-auto min-h-dvh max-w-lg px-4 py-8 text-white" style={{ background: "linear-gradient(180deg,#061018 0%,#0b1f3a 50%,#061018 100%)" }}>
        <a href="/" className="mb-6 inline-block text-sm text-[#c9a227]">← Terug naar 2026</a>
        <h1 className="text-2xl font-bold tracking-tight">Ideeën 2027</h1>
        <p className="mt-2 text-sm text-white/60">
          Brainstorm voor de Go Away Day 2027-app. Log in als Erik of Benno.
        </p>

        <div className="mt-6 rounded-2xl border border-[#c9a227]/40 bg-[#c9a227]/10 px-4 py-4">
          <p className="text-base font-bold text-[#c9a227]">Face ID / Touch ID</p>
          {faceEnabled ? (
            <>
              <p className="mt-1 text-xs text-white/60">Ingesteld op dit apparaat.</p>
              <button
                type="button"
                onClick={handleFaceLogin}
                disabled={busy}
                className="mt-3 w-full rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
              >
                {busy ? "Bezig…" : "Inloggen met Face ID"}
              </button>
            </>
          ) : (
            <p className="mt-1 text-xs text-white/60">
              Log eerst in met wachtwoord. Daarna Face ID inschakelen — werkt ook voor quiz en foto&apos;s.
            </p>
          )}
        </div>

        <form onSubmit={handleLogin} className="mt-4 space-y-4 rounded-2xl bg-[#0b1f3a]/90 p-5">
          {faceEnabled && (
            <p className="text-center text-xs text-white/40">Of met wachtwoord</p>
          )}
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-white/50">Wie ben je?</p>
            <div className="grid grid-cols-2 gap-2">
              {(["erik", "benno"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUserPick(u)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold capitalize transition ${
                    userPick === u
                      ? "bg-[#c9a227] text-[#0b1f3a]"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#c9a227]"
              placeholder="••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {loginError && <p className="text-sm text-red-400">{loginError}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
          >
            {busy ? "Bezig…" : "Naar ideeën"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8 text-white" style={{ background: "linear-gradient(180deg,#061018 0%,#0b1f3a 50%,#061018 100%)" }}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <a href="/" className="text-sm text-[#c9a227]">← Terug naar 2026</a>
        <button type="button" onClick={handleLogout} className="text-xs text-white/40 underline">
          Uitloggen ({session.user})
        </button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Ideeën 2027</h1>
      <p className="mt-1 text-sm text-white/60">
        Beste scores bovenaan. Rate elkaars ideeën 1–10.
      </p>

      <div className="mt-4 rounded-2xl border border-[#c9a227]/40 bg-[#c9a227]/10 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-bold text-[#c9a227]">Face ID / Touch ID</p>
            <p className="mt-0.5 text-xs text-white/60">
              {!faceAvailable
                ? "Werkt het best in Safari op iPhone. Je kunt het hier toch proberen."
                : faceEnabled
                  ? "Aan — werkt voor ideeën, quiz en foto's"
                  : "Tik op Inschakelen (werkt daarna overal in de app)"}
            </p>
          </div>
          {faceEnabled ? (
            <button
              type="button"
              onClick={handleDisableFaceId}
              className="shrink-0 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white/80"
            >
              Uit
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={handleEnableFaceId}
              className="shrink-0 rounded-xl bg-[#c9a227] px-4 py-2.5 text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
            >
              Inschakelen
            </button>
          )}
        </div>
        {faceMsg && <p className="mt-2 text-xs text-white/80">{faceMsg}</p>}
      </div>

      <form onSubmit={handleAdd} className="mt-6 rounded-2xl bg-[#0b1f3a]/90 p-4">
        <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
          Nieuw idee
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Bijv. polarsteps-achtige live route, gezamenlijke foto-map…"
          className="w-full resize-none rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-[#c9a227]"
        />
        <button
          type="submit"
          disabled={busy || text.trim().length < 2}
          className="mt-3 w-full rounded-xl bg-[#c9a227] py-3 text-sm font-bold text-[#0b1f3a] disabled:opacity-50"
        >
          Idee opslaan
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-8 space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-white/50">
          {loading ? "Laden…" : `${ideas.length} idee${ideas.length === 1 ? "" : "ën"}`}
        </h2>

        {ideas.map((idea, index) => {
          const myRating = idea.ratings[session.user];
          const avg =
            idea.average == null ? "—" : idea.average.toFixed(idea.average % 1 === 0 ? 0 : 1);
          return (
            <article
              key={idea.id}
              className="rounded-2xl bg-[#0b1f3a]/90 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c9a227]/20 text-xs font-bold text-[#c9a227]">
                    #{index + 1}
                  </span>
                  <span className="text-xs capitalize text-white/40">
                    {idea.author}
                  </span>
                  {idea.author === session.user && editingId !== idea.id && (
                    <button
                      type="button"
                      onClick={() => startEdit(idea)}
                      className="text-[11px] text-[#c9a227] underline"
                    >
                      Bewerken
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#c9a227]">{avg}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/35">gemiddelde</div>
                </div>
              </div>

              {editingId === idea.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-[#c9a227]/50 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#c9a227]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busy || editText.trim().length < 2}
                      onClick={() => handleSaveEdit(idea.id)}
                      className="flex-1 rounded-xl bg-[#c9a227] py-2 text-xs font-bold text-[#0b1f3a] disabled:opacity-50"
                    >
                      Opslaan
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-xl bg-white/10 px-4 py-2 text-xs text-white/70"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[15px] leading-snug text-white/90">{idea.text}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-white/35">
                {idea.ratings.erik != null && <span>Erik: {idea.ratings.erik}/10</span>}
                {idea.ratings.benno != null && <span>Benno: {idea.ratings.benno}/10</span>}
                {idea.ratings.erik == null && idea.ratings.benno == null && (
                  <span>Nog niet gerate</span>
                )}
              </div>

              <div className="mt-3">
                <p className="mb-1.5 text-[10px] uppercase tracking-wider text-white/40">
                  Jouw score{myRating != null ? ` (${myRating})` : ""}
                </p>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      disabled={busy}
                      onClick={() => handleRate(idea.id, n)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                        myRating === n
                          ? "bg-[#c9a227] text-[#0b1f3a]"
                          : "bg-white/10 text-white/80 active:bg-white/20"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}

        {!loading && ideas.length === 0 && (
          <p className="rounded-2xl bg-white/5 px-4 py-8 text-center text-sm text-white/45">
            Nog geen ideeën. Zet de eerste erin!
          </p>
        )}
      </div>
    </div>
  );
}
