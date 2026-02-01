"use client";

import { useState, useEffect, useRef } from "react";
import type { UserId } from "@/lib/firestore";
import {
  getCitySubmission,
  setCitySubmission,
  hasBothSubmitted,
  combineAndDedupeCities,
  getCities,
  isDemoMode,
  type CityEntry,
} from "@/lib/firestore";
import { getWegstreepDay1StartTime } from "@/lib/dates";

const DRAFT_KEY = "go-away-day-city-draft";

function getDraftKey(user: UserId): string {
  const base = isDemoMode() ? "go-away-day-demo-draft" : DRAFT_KEY;
  return `${base}-${user}`;
}

function loadDraft(user: UserId): CityEntry[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getDraftKey(user));
    if (!raw) return null;
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr) || arr.length !== 5) return null;
    const ok = arr.every((x) => x && typeof x.city === "string");
    if (!ok) return null;
    return arr.map((c: { city: string; country?: string }) => ({
      city: String(c.city),
      country: c.country != null ? String(c.country) : "",
      addedBy: user,
    }));
  } catch {
    return null;
  }
}

function saveDraft(user: UserId, cities: CityEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    const toSave = cities.map(({ city, country, addedBy }) => ({ city, country, addedBy }));
    localStorage.setItem(getDraftKey(user), JSON.stringify(toSave));
  } catch {}
}

type Props = {
  currentUser: UserId;
  /** Demo: toon knop om door te gaan naar wegstrepen */
  demoOnGoToWegstreep?: () => void;
};

function otherUser(u: UserId): UserId {
  return u === "erik" ? "benno" : "erik";
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const rest = totalSec % 86400;
  const h = Math.floor(rest / 3600);
  const m = Math.floor((rest % 3600) / 60);
  if (d > 0) return `${d}d ${h}u ${m}m`;
  return `${h}u ${m}m`;
}

function CombinedListWithCountdown({
  demoOnGoToWegstreep,
}: {
  demoOnGoToWegstreep?: () => void;
}) {
  const [cities, setCities] = useState<CityEntry[]>([]);
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    let cancelled = false;
    getCities().then((list) => {
      if (!cancelled) setCities(list);
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    const update = () => {
      const target = getWegstreepDay1StartTime();
      const left = Math.max(0, target.getTime() - Date.now());
      setCountdown(formatCountdown(left));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4 rounded-lg border border-foreground/10 bg-background p-4">
      <p className="text-center font-medium text-foreground/90">
        Beide hebben steden opgegeven. De gezamenlijke lijst (dubbelen eraf):
      </p>
      <ul className="space-y-1 rounded border border-foreground/10 bg-foreground/5 px-3 py-2">
        {cities.map((c, i) => (
          <li key={i} className="font-medium text-foreground">
            {c.city}
            {c.country ? ` (${c.country})` : ""}
          </li>
        ))}
      </ul>
      <p className="text-center text-sm text-foreground/70">
        Countdown tot de eerste wegstreep-dag (2 februari):
      </p>
      <p className="text-center text-2xl font-mono font-bold tabular-nums text-foreground">
        {countdown}
      </p>
      {demoOnGoToWegstreep && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={demoOnGoToWegstreep}
            className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-sm font-medium text-foreground"
          >
            🎊 Demo: ga door naar wegstrepen →
          </button>
        </div>
      )}
    </div>
  );
}

const DEMO_DUTCH = [
  { city: "Amsterdam", country: "Nederland" },
  { city: "Rotterdam", country: "Nederland" },
  { city: "Den Haag", country: "Nederland" },
  { city: "Utrecht", country: "Nederland" },
  { city: "Eindhoven", country: "Nederland" },
];

const DEMO_FRENCH = [
  { city: "Parijs", country: "Frankrijk" },
  { city: "Lyon", country: "Frankrijk" },
  { city: "Marseille", country: "Frankrijk" },
  { city: "Bordeaux", country: "Frankrijk" },
  { city: "Nice", country: "Frankrijk" },
];

function getDemoCitiesForUser(u: UserId): CityEntry[] {
  const list = u === "erik" ? DEMO_DUTCH : DEMO_FRENCH;
  return list.map((c) => ({ ...c, addedBy: u }));
}

function getDemoCitiesForOther(u: UserId): CityEntry[] {
  const list = u === "erik" ? DEMO_FRENCH : DEMO_DUTCH;
  const other = otherUser(u);
  return list.map((c) => ({ ...c, addedBy: other }));
}

export function CityInputForm({ currentUser, demoOnGoToWegstreep }: Props) {
  const [cities, setCitiesState] = useState<CityEntry[]>(() =>
    Array(5)
      .fill(null)
      .map(() => ({ city: "", country: "", addedBy: currentUser }))
  );
  const [submitted, setSubmitted] = useState<boolean | null>(null);
  const [otherSubmitted, setOtherSubmitted] = useState<boolean | null>(null);
  const [combined, setCombined] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demoOtherSaving, setDemoOtherSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [mySubmission, both] = await Promise.all([
          getCitySubmission(currentUser),
          hasBothSubmitted(),
        ]);
        if (cancelled) return;
        setSubmitted(mySubmission !== null);
        setOtherSubmitted(both ? true : (await getCitySubmission(otherUser(currentUser))) !== null);
        if (mySubmission) {
          const padded = [...mySubmission];
          while (padded.length < 5) padded.push({ city: "", country: "", addedBy: currentUser });
          setCitiesState(padded.slice(0, 5));
        } else {
          const draft = loadDraft(currentUser);
          if (draft && draft.length === 5) setCitiesState(draft);
        }
        const existing = await getCities();
        if (existing.length > 0) setCombined(true);
        else if (both) {
          await combineAndDedupeCities();
          if (!cancelled) setCombined(true);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Fout bij laden");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  /* In het echt: zodra jij hebt opgegeven, elke 2 s checken of de ander ook heeft opgegeven. */
  useEffect(() => {
    if (!submitted || combined) return;
    let cancelled = false;
    const check = async () => {
      if (cancelled) return;
      try {
        const both = await hasBothSubmitted();
        if (cancelled || !both) return;
        setOtherSubmitted(true);
        const existing = await getCities();
        if (existing.length > 0) {
          setCombined(true);
          return;
        }
        try {
          await combineAndDedupeCities();
        } catch {
          await new Promise((r) => setTimeout(r, 800));
          if (cancelled) return;
          await combineAndDedupeCities();
        }
        if (!cancelled) setCombined(true);
      } catch {
        // volgende poll probeert opnieuw
      }
    };
    const t = setInterval(check, 2000);
    check();
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [submitted, combined]);

  const saveDraftRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (submitted === true || combined || loading) return;
    saveDraftRef.current = setTimeout(() => {
      saveDraftRef.current = null;
      saveDraft(currentUser, cities);
    }, 400);
    return () => {
      if (saveDraftRef.current) clearTimeout(saveDraftRef.current);
    };
  }, [cities, currentUser, submitted, combined, loading]);

  const handleChange = (index: number, field: "city" | "country", value: string) => {
    setCitiesState((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]!, [field]: value, addedBy: currentUser };
      return next;
    });
  };

  const fillDemo = () => {
    setCitiesState(getDemoCitiesForUser(currentUser));
    setError(null);
  };

  const fillDemoOther = async () => {
    setDemoOtherSaving(true);
    setError(null);
    try {
      const other = otherUser(currentUser);
      await setCitySubmission(other, getDemoCitiesForOther(currentUser));
      setOtherSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo invullen mislukt");
    } finally {
      setDemoOtherSaving(false);
    }
  };

  const doSubmit = async (entries: CityEntry[]) => {
    setSaving(true);
    setError(null);
    try {
      await setCitySubmission(currentUser, entries);
      if (typeof window !== "undefined") localStorage.removeItem(getDraftKey(currentUser));
      setSubmitted(true);
      setShowConfirmSubmit(false);
      const both = await hasBothSubmitted();
      if (both) {
        const existing = await getCities();
        if (existing.length === 0) await combineAndDedupeCities();
        setCombined(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entries = cities
      .map((c) => ({ city: c.city.trim(), country: (c.country ?? "").trim(), addedBy: currentUser }))
      .filter((c) => c.city);
    if (entries.length !== 5) {
      setError("Vul precies 5 steden in.");
      return;
    }
    const other = otherUser(currentUser);
    const otherSubmission = await getCitySubmission(other);
    if (otherSubmission && otherSubmission.length > 0) {
      const otherSet = new Set(
        otherSubmission.map((c) => `${c.city.trim().toLowerCase()}|${(c.country ?? "").trim().toLowerCase()}`)
      );
      const duplicates = entries.filter(
        (c) => otherSet.has(`${c.city.toLowerCase()}|${(c.country ?? "").toLowerCase()}`)
      );
      if (duplicates.length > 0) {
        const list = duplicates.map((c) => c.city).join(", ");
        setError(`Deze stad is al ingevuld: ${list}. Kies een andere stad.`);
        return;
      }
    }
    setShowConfirmSubmit(true);
    return;
  };

  if (loading) {
    return <p className="text-center text-foreground/70">Laden...</p>;
  }

  if (combined) {
    return (
      <CombinedListWithCountdown
        demoOnGoToWegstreep={demoOnGoToWegstreep}
      />
    );
  }

  const fillDemoOtherAndContinue = async () => {
    setDemoOtherSaving(true);
    setError(null);
    try {
      const other = otherUser(currentUser);
      await setCitySubmission(other, getDemoCitiesForOther(currentUser));
      setOtherSubmitted(true);
      const existing = await getCities();
      if (existing.length === 0) {
        try {
          await combineAndDedupeCities();
        } catch {
          await new Promise((r) => setTimeout(r, 500));
          await combineAndDedupeCities();
        }
      }
      setCombined(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo invullen mislukt");
    } finally {
      setDemoOtherSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-foreground/10 bg-background p-4">
        <p className="text-center text-foreground/90">Je hebt je 5 steden opgegeven.</p>
        {!otherSubmitted ? (
          <>
            <p className="mt-2 text-center text-sm text-foreground/70">
              Wacht tot {otherUser(currentUser) === "erik" ? "Erik" : "Benno"} ook 5 steden heeft ingevoerd. Werkt vanzelf bij (elke 2 sec).
            </p>
            <p className="mt-3 text-center text-sm text-foreground/60">Demo: wil je in één keer door?</p>
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={fillDemoOtherAndContinue}
                disabled={demoOtherSaving}
                className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50"
              >
                {demoOtherSaving ? "Bezig..." : "Demo: vul andere 5 in en ga verder"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  if (showConfirmSubmit) {
    const entries = cities
      .map((c) => ({ city: c.city.trim(), country: (c.country ?? "").trim(), addedBy: currentUser }))
      .filter((c) => c.city);
    return (
      <div className="space-y-4 rounded-lg border border-foreground/10 bg-background p-4">
        <p className="text-center font-medium text-foreground">
          Weet je het zeker? No way back!
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowConfirmSubmit(false)}
            className="flex-1 rounded-lg border border-foreground/30 bg-foreground/10 py-2.5 font-medium text-foreground"
          >
            Annuleren
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => doSubmit(entries as CityEntry[])}
            className="flex-1 rounded-lg bg-foreground py-2.5 font-medium text-background disabled:opacity-50"
          >
            {saving ? "Bezig..." : "Bevestigen"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-foreground/10 bg-background p-4">
      <p className="text-sm text-foreground/80">Geef 5 steden op (alleen stad, land mag maar hoeft niet).</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={fillDemo}
          className="rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm font-medium text-foreground"
        >
          Vul voorbeeld in
        </button>
        <button
          type="button"
          onClick={fillDemoOther}
          disabled={demoOtherSaving}
          className="rounded-lg border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm font-medium text-foreground disabled:opacity-50"
        >
          {demoOtherSaving ? "Bezig..." : "Vul ook de andere 5 in (demo)"}
        </button>
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i}>
          <input
            type="text"
            placeholder="Stad"
            value={cities[i]?.city ?? ""}
            onChange={(e) => handleChange(i, "city", e.target.value)}
            className="w-full rounded border border-foreground/20 bg-background px-3 py-2 text-foreground"
          />
        </div>
      ))}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-foreground py-2.5 font-medium text-background disabled:opacity-50"
      >
        {saving ? "Bezig..." : "Steden opgeven"}
      </button>
    </form>
  );
}
