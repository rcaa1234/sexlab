import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "缺少檔案，請在 form-data 中附加 file 欄位" },
        { status: 400 }
      );
    }

    // 檢查檔案類型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `不支援的檔案類型：${file.type}` },
        { status: 400 }
      );
    }

    // 檢查檔案大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "檔案大小超過 10MB 上限" },
        { status: 400 }
      );
    }

    // 產生檔名：timestamp-random.ext
    const ext = path.extname(file.name) || mimeToExt(file.type);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    // 確保 uploads 目錄存在
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 寫入檔案
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadDir, filename), buffer);

    // 回傳完整 URL
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = `${siteUrl}/uploads/${filename}`;

    return NextResponse.json({ success: true, url, filename });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "上傳失敗" }, { status: 500 });
  }
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
  };
  return map[mime] || ".bin";
}
