import { NextResponse } from "next/server";
import { gatherLiveUpdates, SEED_BRIEFING } from "@/lib/maltaUpdates";

export const revalidate = 3600;

export async function GET() {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json(SEED_BRIEFING);
  }
  try {
    const briefing = await gatherLiveUpdates();
    return NextResponse.json(briefing);
  } catch {
    return NextResponse.json(SEED_BRIEFING);
  }
}
