import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function GET() {
  if (url && token) return NextResponse.json({ ok: true });
  if (isFirebaseAdminConfigured()) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false }, { status: 404 });
}
