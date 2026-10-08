import { NextRequest, NextResponse } from "next/server";
import {
  averageRating,
  clampRating,
  newIdeaId,
  sortIdeas,
  validateIdeasLogin,
  type Idea2027,
} from "@/lib/ideas2027";

export const dynamic = "force-dynamic";

async function storage() {
  const fb = await import("@/lib/firebase-admin");
  if (fb.isFirebaseAdminConfigured()) {
    return {
      list: () => fb.listIdeas2027(),
      add: (idea: Idea2027) => fb.addIdea2027(idea),
      rate: (id: string, user: "erik" | "benno", rating: number) =>
        fb.rateIdea2027(id, user, rating),
      update: (id: string, text: string) => fb.updateIdea2027(id, text),
    };
  }

  const { getRedis } = await import("@/lib/upstash-server");
  const redis = getRedis();
  const KEY = "ideas2027";

  if (redis) {
    return {
      list: async () => {
        const v = await redis.get(KEY);
        const ideas = (typeof v === "string" ? JSON.parse(v) : v) as Idea2027[] | null;
        return sortIdeas(Array.isArray(ideas) ? ideas : []);
      },
      add: async (idea: Idea2027) => {
        const v = await redis.get(KEY);
        const ideas = (typeof v === "string" ? JSON.parse(v) : v) as Idea2027[] | null;
        const list = Array.isArray(ideas) ? ideas : [];
        list.unshift(idea);
        await redis.set(KEY, list);
        return idea;
      },
      rate: async (id: string, user: "erik" | "benno", rating: number) => {
        const v = await redis.get(KEY);
        const ideas = (typeof v === "string" ? JSON.parse(v) : v) as Idea2027[] | null;
        const list = Array.isArray(ideas) ? ideas : [];
        const idea = list.find((i) => i.id === id);
        if (!idea) return null;
        idea.ratings = { ...idea.ratings, [user]: rating };
        await redis.set(KEY, list);
        return idea;
      },
      update: async (id: string, text: string) => {
        const v = await redis.get(KEY);
        const ideas = (typeof v === "string" ? JSON.parse(v) : v) as Idea2027[] | null;
        const list = Array.isArray(ideas) ? ideas : [];
        const idea = list.find((i) => i.id === id);
        if (!idea) return null;
        idea.text = text;
        await redis.set(KEY, list);
        return idea;
      },
    };
  }

  // Local memory via firebase-admin helpers (ideasMem)
  return {
    list: () => fb.listIdeas2027(),
    add: (idea: Idea2027) => fb.addIdea2027(idea),
    rate: (id: string, user: "erik" | "benno", rating: number) =>
      fb.rateIdea2027(id, user, rating),
    update: (id: string, text: string) => fb.updateIdea2027(id, text),
  };
}

export async function POST(req: NextRequest) {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ error: "No storage" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const op = body.op as string;
    const user = validateIdeasLogin(body.user, body.password);
    if (!user) {
      return NextResponse.json({ error: "Ongeldig wachtwoord" }, { status: 401 });
    }

    const store = await storage();

    if (op === "list") {
      const ideas = await store.list();
      return NextResponse.json({
        data: ideas.map((i) => ({
          ...i,
          average: averageRating(i),
        })),
      });
    }

    if (op === "add") {
      const text = String(body.text ?? "").trim();
      if (text.length < 2) {
        return NextResponse.json({ error: "Idee is te kort" }, { status: 400 });
      }
      if (text.length > 500) {
        return NextResponse.json({ error: "Idee is te lang (max 500)" }, { status: 400 });
      }
      const idea: Idea2027 = {
        id: newIdeaId(),
        text,
        author: user,
        createdAt: new Date().toISOString(),
        ratings: {},
      };
      await store.add(idea);
      return NextResponse.json({ data: { ...idea, average: null } });
    }

    if (op === "rate") {
      const rating = clampRating(body.rating);
      if (rating == null) {
        return NextResponse.json({ error: "Rating moet 1–10 zijn" }, { status: 400 });
      }
      const id = String(body.id ?? "");
      if (!id) {
        return NextResponse.json({ error: "Geen idee" }, { status: 400 });
      }
      const updated = await store.rate(id, user, rating);
      if (!updated) {
        return NextResponse.json({ error: "Idee niet gevonden" }, { status: 404 });
      }
      return NextResponse.json({
        data: { ...updated, average: averageRating(updated) },
      });
    }

    if (op === "edit") {
      const text = String(body.text ?? "").trim();
      if (text.length < 2) {
        return NextResponse.json({ error: "Idee is te kort" }, { status: 400 });
      }
      if (text.length > 500) {
        return NextResponse.json({ error: "Idee is te lang (max 500)" }, { status: 400 });
      }
      const id = String(body.id ?? "");
      if (!id) {
        return NextResponse.json({ error: "Geen idee" }, { status: 400 });
      }
      const existing = (await store.list()).find((i) => i.id === id);
      if (!existing) {
        return NextResponse.json({ error: "Idee niet gevonden" }, { status: 404 });
      }
      // Alleen eigen ideeën bewerken
      if (existing.author !== user) {
        return NextResponse.json({ error: "Alleen je eigen idee bewerken" }, { status: 403 });
      }
      const updated = await store.update(id, text);
      if (!updated) {
        return NextResponse.json({ error: "Idee niet gevonden" }, { status: 404 });
      }
      return NextResponse.json({
        data: { ...updated, average: averageRating(updated) },
      });
    }

    return NextResponse.json({ error: "Unknown op" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 },
    );
  }
}
