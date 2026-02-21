import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { UPLOAD_DIR, EXT_TO_CONTENT_TYPE } from "@/lib/upload";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;

  // 防止路徑遍歷攻擊
  const filename = segments.join("/");
  if (filename.includes("..") || filename.startsWith("/")) {
    return new Response("Forbidden", { status: 403 });
  }

  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const buffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = EXT_TO_CONTENT_TYPE[ext] || "application/octet-stream";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
