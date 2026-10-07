import { NextRequest, NextResponse } from "next/server";
import {
  getPhotos,
  savePhotoMeta,
  updatePhotoMeta,
  deletePhoto,
  signUpload,
  isCloudinaryConfigured,
  testCloudinary,
  addPhotoLike,
  removePhotoLike,
  findDuplicates,
  photoExistsByUrl,
  type PhotoMeta,
} from "@/lib/cloudinary-storage";

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

  if (searchParams.get("test") === "1") {
    const result = await testCloudinary();
    return NextResponse.json(result);
  }

  if (searchParams.get("duplicates") === "1") {
    const result = await findDuplicates();
    return NextResponse.json(result);
  }

  const filter = searchParams.get("filter");
  const uploader = filter === "erik" || filter === "benno" ? filter : undefined;

  const photos = await getPhotos(uploader);
  return NextResponse.json({
    photos,
    storageReady: isCloudinaryConfigured(),
  });
}

export async function POST(req: NextRequest) {
  if (process.env.GITHUB_PAGES === "true") {
    return NextResponse.json({ error: "Geen foto's op static export" }, { status: 503 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // JSON ops: sign / save / delete
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>;
      const op = body.op as string;

      // Public like - no auth needed
      if (op === "add-like") {
        const photoId = body.photoId as string;
        if (!photoId) return NextResponse.json({ error: "Geen foto ID" }, { status: 400 });
        const newCount = await addPhotoLike(photoId);
        if (newCount === null) return NextResponse.json({ error: "Like opslaan mislukt" }, { status: 500 });
        return NextResponse.json({ success: true, likeCount: newCount });
      }

      if (op === "remove-like") {
        const photoId = body.photoId as string;
        if (!photoId) return NextResponse.json({ error: "Geen foto ID" }, { status: 400 });
        const newCount = await removePhotoLike(photoId);
        if (newCount === null) return NextResponse.json({ error: "Unlike mislukt" }, { status: 500 });
        return NextResponse.json({ success: true, likeCount: newCount });
      }

      // Auth required for other operations
      const who = body.who as string;
      const password = body.password as string;

      if (!who || !["erik", "benno"].includes(who)) {
        return NextResponse.json({ error: "Wie ben je?" }, { status: 400 });
      }
      if (!checkPass(who, password)) {
        return NextResponse.json({ error: "Verkeerd wachtwoord" }, { status: 401 });
      }

      if (op === "sign") {
        if (!isCloudinaryConfigured()) {
          const test = await testCloudinary();
          return NextResponse.json(
            { error: test.message || "Cloudinary niet geconfigureerd" },
            { status: 503 },
          );
        }
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const signed = signUpload(id);
        return NextResponse.json({ ...signed, who });
      }

      if (op === "save") {
        const photo = body.photo as PhotoMeta | undefined;
        if (!photo?.id || !photo.fullUrl || !photo.thumbUrl) {
          return NextResponse.json({ error: "Foto-data incompleet" }, { status: 400 });
        }
        
        // Check for duplicate
        const exists = await photoExistsByUrl(photo.fullUrl);
        if (exists) {
          return NextResponse.json({ error: "Deze foto bestaat al" }, { status: 409 });
        }
        
        const meta: PhotoMeta = {
          id: photo.id,
          uploader: who as "erik" | "benno",
          day: String(photo.day || ""),
          caption: String(photo.caption || ""),
          uploadedAt: new Date().toISOString(),
          thumbUrl: photo.thumbUrl,
          fullUrl: photo.fullUrl,
        };
        if (photo.location) {
          meta.location = String(photo.location);
        }
        if (photo.isVideo) {
          meta.isVideo = true;
        }
        await savePhotoMeta(meta);
        return NextResponse.json({ photo: meta });
      }

      if (op === "delete") {
        const id = body.id as string;
        if (!id) return NextResponse.json({ error: "Geen foto ID" }, { status: 400 });
        const success = await deletePhoto(id);
        if (!success) return NextResponse.json({ error: "Verwijderen mislukt" }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      if (op === "update") {
        const id = body.id as string;
        const updates = body.updates as { day?: string; caption?: string } | undefined;
        if (!id) return NextResponse.json({ error: "Geen foto ID" }, { status: 400 });
        if (!updates) return NextResponse.json({ error: "Geen updates" }, { status: 400 });
        const success = await updatePhotoMeta(id, updates);
        if (!success) return NextResponse.json({ error: "Bijwerken mislukt" }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      if (op === "sign-video") {
        if (!isCloudinaryConfigured()) {
          const test = await testCloudinary();
          return NextResponse.json(
            { error: test.message || "Cloudinary niet geconfigureerd" },
            { status: 503 },
          );
        }
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const signed = signUpload(id, "video");
        return NextResponse.json({ ...signed, who });
      }

      return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
    }

    return NextResponse.json({ error: "Gebruik JSON" }, { status: 400 });
  } catch (err) {
    console.error("Photo API error:", err);
    const msg = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: `Fout: ${msg}` }, { status: 500 });
  }
}
