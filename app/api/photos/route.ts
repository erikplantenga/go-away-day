import { NextRequest, NextResponse } from "next/server";
import { getPhotos, uploadPhoto, deletePhoto, isStorageConfigured } from "@/lib/firebase-storage";

export const dynamic = "force-dynamic";

const PASSWORDS: Record<string, string> = {
  erik: "Erik",
  benno: "Wenstra",
};

function checkPass(who: string, password: unknown) {
  return typeof password === "string" && password === PASSWORDS[who];
}

export async function GET(req: NextRequest) {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ error: "Geen foto's op static export" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const uploader = filter === "erik" || filter === "benno" ? filter : undefined;

  const photos = await getPhotos(uploader);
  return NextResponse.json({
    photos,
    storageReady: isStorageConfigured(),
  });
}

export async function POST(req: NextRequest) {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ error: "Geen foto's op static export" }, { status: 503 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json({ error: "Storage niet geconfigureerd" }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const op = formData.get("op") as string;

    if (op === "upload") {
      const who = formData.get("who") as string;
      const password = formData.get("password") as string;
      const day = formData.get("day") as string;
      const caption = formData.get("caption") as string;
      const file = formData.get("file") as File | null;

      if (!who || !["erik", "benno"].includes(who)) {
        return NextResponse.json({ error: "Wie ben je?" }, { status: 400 });
      }
      if (!checkPass(who, password)) {
        return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
      }
      if (!file) {
        return NextResponse.json({ error: "Geen foto" }, { status: 400 });
      }
      if (!day) {
        return NextResponse.json({ error: "Welke dag?" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const contentType = file.type || "image/jpeg";

      try {
        const photo = await uploadPhoto(
          buffer,
          contentType,
          who as "erik" | "benno",
          day,
          caption || "",
        );
        return NextResponse.json({ photo });
      } catch (uploadErr) {
        console.error("Upload error:", uploadErr);
        const msg = uploadErr instanceof Error ? uploadErr.message : "Upload mislukt";
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    if (op === "delete") {
      const who = formData.get("who") as string;
      const password = formData.get("password") as string;
      const id = formData.get("id") as string;

      if (!who || !["erik", "benno"].includes(who)) {
        return NextResponse.json({ error: "Wie ben je?" }, { status: 400 });
      }
      if (!checkPass(who, password)) {
        return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
      }
      if (!id) {
        return NextResponse.json({ error: "Geen foto ID" }, { status: 400 });
      }

      const success = await deletePhoto(id);
      if (!success) {
        return NextResponse.json({ error: "Verwijderen mislukt" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
  } catch (err) {
    console.error("Photo API error:", err);
    const msg = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: `Fout: ${msg}` }, { status: 500 });
  }
}
