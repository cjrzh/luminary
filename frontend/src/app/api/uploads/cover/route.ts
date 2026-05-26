import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function extensionFromType(contentType: string | null) {
  if (!contentType) return null;
  return ALLOWED_TYPES.get(contentType.split(";")[0].trim().toLowerCase()) ?? null;
}

function extensionFromUrl(url: string) {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) return null;
  return extension === ".jpeg" ? ".jpg" : extension;
}

async function saveCover(buffer: Buffer, extension: string) {
  if (buffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "covers");
  await mkdir(uploadDir, { recursive: true });

  const filename = randomUUID() + extension;
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  return NextResponse.json({ path: "/uploads/covers/" + filename });
}

async function uploadFromFile(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image file provided" }, { status: 400 });
  }

  const extension = extensionFromType(file.type) ?? extensionFromUrl(file.name);
  if (!extension) {
    return NextResponse.json({ error: "Only jpg, png, webp, and gif images are supported" }, { status: 400 });
  }

  return saveCover(Buffer.from(await file.arrayBuffer()), extension);
}

async function uploadFromUrl(request: NextRequest) {
  const body = (await request.json()) as { url?: string };
  const sourceUrl = body.url?.trim();

  if (!sourceUrl) {
    return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Only http and https image URLs are supported" }, { status: 400 });
  }

  const response = await fetch(parsedUrl, {
    headers: {
      Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,*/*;q=0.8",
      Referer: parsedUrl.hostname.includes("doubanio.com") ? "https://movie.douban.com/" : parsedUrl.origin,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch image URL" }, { status: 400 });
  }

  const extension = extensionFromType(response.headers.get("content-type")) ?? extensionFromUrl(sourceUrl);
  if (!extension) {
    return NextResponse.json({ error: "Only jpg, png, webp, and gif image URLs are supported" }, { status: 400 });
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
  }

  return saveCover(Buffer.from(await response.arrayBuffer()), extension);
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return uploadFromUrl(request);
  }

  return uploadFromFile(request);
}
