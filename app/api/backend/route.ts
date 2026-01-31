import { NextResponse } from "next/server";

// Static export (GitHub Pages): geen server, geen imports van Firebase/Redis
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ ok: false });
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return NextResponse.json({ ok: true });
  const { isFirebaseAdminConfigured } = await import("@/lib/firebase-admin");
  if (isFirebaseAdminConfigured()) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false }, { status: 404 });
}
