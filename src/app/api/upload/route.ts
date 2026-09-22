import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image exceeds 5MB." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base = (file.name.replace(/\.[^.]+$/, "") || "image")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const filename = `${base || "image"}-${Date.now()}.jpg`;

  // Optimize: auto-orient, cap width, compress. Keeps uploads fast + consistent.
  let output: Buffer;
  try {
    output = await sharp(bytes)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Could not process image." }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), output);

  const url = `/uploads/${filename}`;
  await prisma.media.create({ data: { url, filename } });

  return NextResponse.json({ url, filename });
}
