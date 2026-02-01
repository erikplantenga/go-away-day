import { NextRequest, NextResponse } from "next/server";
import type { CityEntry, RemovedEntry, GameConfig } from "@/lib/firestore";

// Static export (GitHub Pages): geen server, geen Firebase/Redis-imports bij build
export const dynamic = "force-static";
export const revalidate = false;

export async function POST(req: NextRequest) {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ error: "No storage" }, { status: 503 });
  }
  const { getRedis } = await import("@/lib/upstash-server");
  const fb = await import("@/lib/firebase-admin");
  const redis = () => getRedis();
  const get = async (key: string) => {
    const r = redis();
    if (!r) return null;
    const v = await r.get(key);
    return v as string | null;
  };
  const set = async (key: string, value: unknown) => {
    const r = redis();
    if (!r) return;
    await r.set(key, JSON.stringify(value));
  };
  const isFirebaseBackend = () => fb.isFirebaseAdminConfigured();

  const useFb = isFirebaseBackend();
  const r = useFb ? null : redis();
  if (!useFb && !r) return NextResponse.json({ error: "No storage" }, { status: 503 });

  const body = await req.json();
  const op = body.op as string;

  try {
    if (useFb) {
      if (op === "getCities") return NextResponse.json({ data: await fb.getCities() });
      if (op === "setCities") {
        await fb.setCities(body.cities as CityEntry[]);
        return NextResponse.json({ ok: true });
      }
      if (op === "getCitySubmission")
        return NextResponse.json({ data: await fb.getCitySubmission(body.user) });
      if (op === "setCitySubmission") {
        await fb.setCitySubmission(body.user, body.cities);
        return NextResponse.json({ ok: true });
      }
      if (op === "hasBothSubmitted")
        return NextResponse.json({ data: await fb.hasBothSubmitted() });
      if (op === "combineAndDedupeCities")
        return NextResponse.json({ data: await fb.combineAndDedupeCities() });
      if (op === "getRemoved") return NextResponse.json({ data: await fb.getRemoved() });
      if (op === "addRemoved") {
        await fb.addRemoved({
          city: body.city,
          country: body.country,
          removedBy: body.removedBy,
          date: body.date,
        });
        return NextResponse.json({ ok: true });
      }
      if (op === "hasUserStruckToday")
        return NextResponse.json({
          data: await fb.hasUserStruckToday(body.user, body.dateStr),
        });
      if (op === "getStrikeCount")
        return NextResponse.json({ data: await fb.getStrikeCount(body.user) });
      if (op === "getStrikeCountForDate")
        return NextResponse.json({ data: await fb.getStrikeCountForDate(body.user, body.dateStr) });
      if (op === "getSpins") return NextResponse.json({ data: await fb.getSpins() });
      if (op === "addSpin") {
        await fb.addSpin({
          user: body.user,
          city: body.city,
          date: body.dateStr,
          points: body.points ?? 1,
        });
        return NextResponse.json({ ok: true });
      }
      if (op === "hasUserSpunToday")
        return NextResponse.json({
          data: await fb.hasUserSpunToday(body.user, body.dateStr),
        });
      if (op === "getRemainingCities")
        return NextResponse.json({ data: await fb.getRemainingCities() });
      if (op === "getConfig") return NextResponse.json({ data: await fb.getConfig() });
      if (op === "setConfig") {
        await fb.setConfig(body.updates);
        return NextResponse.json({ ok: true });
      }
      if (op === "setWinner") {
        await fb.setWinner(body.city);
        return NextResponse.json({ ok: true });
      }
    }

    if (op === "getCities") {
      const v = await get("cities");
      return NextResponse.json({ data: v ? JSON.parse(v) : [] });
    }
    if (op === "setCities") {
      await set("cities", body.cities as CityEntry[]);
      return NextResponse.json({ ok: true });
    }
    if (op === "getCitySubmission") {
      const v = await get(`submission_${body.user}`);
      return NextResponse.json({ data: v ? JSON.parse(v) : null });
    }
    if (op === "setCitySubmission") {
      await set(`submission_${body.user}`, body.cities);
      return NextResponse.json({ ok: true });
    }
    if (op === "hasBothSubmitted") {
      const [e, b] = await Promise.all([get("submission_erik"), get("submission_benno")]);
      return NextResponse.json({ data: !!(e && b) });
    }
    if (op === "combineAndDedupeCities") {
      const erik = await get("submission_erik");
      const benno = await get("submission_benno");
      const all: CityEntry[] = [
        ...(erik ? JSON.parse(erik) : []),
        ...(benno ? JSON.parse(benno) : []),
      ];
      const seen = new Set<string>();
      const deduped: CityEntry[] = [];
      for (const c of all) {
        const k = `${c.city.toLowerCase()}|${(c.country ?? "").toLowerCase()}`;
        if (!seen.has(k)) {
          seen.add(k);
          deduped.push(c);
        }
      }
      await set("cities", deduped);
      return NextResponse.json({ data: deduped });
    }
    if (op === "getRemoved") {
      const v = await get("removed");
      return NextResponse.json({ data: v ? JSON.parse(v) : [] });
    }
    if (op === "addRemoved") {
      const list: RemovedEntry[] = (await get("removed")) ? JSON.parse((await get("removed"))!) : [];
      list.push({
        city: body.city,
        country: body.country,
        removedBy: body.removedBy,
        date: body.date,
      });
      await set("removed", list);
      return NextResponse.json({ ok: true });
    }
    if (op === "hasUserStruckToday") {
      const v = await get("removed");
      const list: RemovedEntry[] = v ? JSON.parse(v) : [];
      const found = list.some(
        (r) => r.removedBy === body.user && r.date === body.dateStr
      );
      return NextResponse.json({ data: found });
    }
    if (op === "getStrikeCount") {
      const v = await get("removed");
      const list: RemovedEntry[] = v ? JSON.parse(v) : [];
      const count = list.filter((r: RemovedEntry) => r.removedBy === body.user).length;
      return NextResponse.json({ data: count });
    }
    if (op === "getStrikeCountForDate") {
      const v = await get("removed");
      const list: RemovedEntry[] = v ? JSON.parse(v) : [];
      const count = list.filter(
        (r: RemovedEntry) => r.removedBy === body.user && r.date === body.dateStr
      ).length;
      return NextResponse.json({ data: count });
    }
    if (op === "getSpins") {
      const v = await get("spins");
      const list = v ? JSON.parse(v) : [];
      return NextResponse.json({ data: list });
    }
    if (op === "addSpin") {
      const v = await get("spins");
      const list = v ? JSON.parse(v) : [];
      list.push({
        user: body.user,
        city: body.city,
        date: body.dateStr,
        points: body.points ?? 1,
        timestamp: new Date().toISOString(),
      });
      await set("spins", list);
      return NextResponse.json({ ok: true });
    }
    if (op === "hasUserSpunToday") {
      const v = await get("spins");
      const list = v ? JSON.parse(v) : [];
      const found = list.some(
        (s: { user: string; date: string }) =>
          s.user === body.user && s.date === body.dateStr
      );
      return NextResponse.json({ data: found });
    }
    if (op === "getRemainingCities") {
      const [citiesV, removedV] = await Promise.all([get("cities"), get("removed")]);
      const cities: CityEntry[] = citiesV ? JSON.parse(citiesV) : [];
      const removed: RemovedEntry[] = removedV ? JSON.parse(removedV) : [];
      const set = new Set(removed.map((r: RemovedEntry) => `${r.city}|${r.country ?? ""}`));
      const remaining = cities.filter((c) => !set.has(`${c.city}|${c.country ?? ""}`));
      return NextResponse.json({ data: remaining });
    }
    if (op === "getConfig") {
      const v = await get("config");
      return NextResponse.json({ data: v ? JSON.parse(v) : {} });
    }
    if (op === "setConfig") {
      const currentV = await get("config");
      const current: GameConfig = currentV ? JSON.parse(currentV) : {};
      await set("config", { ...current, ...body.updates });
      return NextResponse.json({ ok: true });
    }
    if (op === "setWinner") {
      const currentV = await get("config");
      const current: GameConfig = currentV ? JSON.parse(currentV) : {};
      await set("config", { ...current, winnerLocked: true, winnerCity: body.city });
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: "Unknown op" }, { status: 400 });
}
