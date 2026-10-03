import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const user = formData.get("user") as string | null;
    const day = formData.get("day") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file || !user) {
      return NextResponse.json({ error: "File and user required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads", user);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${safeFileName}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const url = `/uploads/${user}/${fileName}`;

    const entry = {
      id: `${timestamp}`,
      user,
      fileName: file.name,
      fileType: file.type,
      url,
      uploadedAt: new Date().toISOString(),
      day: day || undefined,
      caption: caption || undefined,
    };

    const metaPath = join(process.cwd(), "public", "uploads", "metadata.json");
    let metadata: typeof entry[] = [];
    
    try {
      if (existsSync(metaPath)) {
        const { readFile } = await import("fs/promises");
        const raw = await readFile(metaPath, "utf-8");
        metadata = JSON.parse(raw);
      }
    } catch {
      metadata = [];
    }

    metadata.unshift(entry);
    await writeFile(metaPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const metaPath = join(process.cwd(), "public", "uploads", "metadata.json");
    
    if (!existsSync(metaPath)) {
      return NextResponse.json([]);
    }

    const { readFile } = await import("fs/promises");
    const raw = await readFile(metaPath, "utf-8");
    const metadata = JSON.parse(raw);

    return NextResponse.json(metadata);
  } catch {
    return NextResponse.json([]);
  }
}
