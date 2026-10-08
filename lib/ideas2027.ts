export type IdeasUser = "erik" | "benno";

export type Idea2027 = {
  id: string;
  text: string;
  author: IdeasUser;
  createdAt: string;
  ratings: { erik?: number; benno?: number };
};

export const IDEAS_PASSWORDS: Record<IdeasUser, string> = {
  erik: process.env.IDEAS_PASSWORD_ERIK || "Erik",
  benno: process.env.IDEAS_PASSWORD_BENNO || "Wenstra",
};

export function isIdeasUser(v: unknown): v is IdeasUser {
  return v === "erik" || v === "benno";
}

export function validateIdeasLogin(user: unknown, password: unknown): IdeasUser | null {
  if (!isIdeasUser(user) || typeof password !== "string") return null;
  if (password === IDEAS_PASSWORDS[user]) return user;
  return null;
}

export function clampRating(n: unknown): number | null {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  const r = Math.round(v);
  if (r < 1 || r > 10) return null;
  return r;
}

export function averageRating(idea: Idea2027): number | null {
  const vals = [idea.ratings.erik, idea.ratings.benno].filter(
    (n): n is number => typeof n === "number",
  );
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function sortIdeas(ideas: Idea2027[]): Idea2027[] {
  return [...ideas].sort((a, b) => {
    const aa = averageRating(a);
    const bb = averageRating(b);
    if (aa == null && bb == null) return b.createdAt.localeCompare(a.createdAt);
    if (aa == null) return 1;
    if (bb == null) return -1;
    if (bb !== aa) return bb - aa;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function newIdeaId(): string {
  return `idea_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
