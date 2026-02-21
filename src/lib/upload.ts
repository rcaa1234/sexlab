import path from "path";

/**
 * 持久化上傳目錄
 *
 * Zeabur Volume 掛載到 /app/public/uploads
 * 預設 path = process.cwd()/public/uploads（容器內即 /app/public/uploads）
 * 可透過 UPLOAD_DIR 環境變數覆寫
 *
 * 圖片透過 /uploads/[...path] route handler serve（Next.js standalone 不會自動 serve runtime 寫入的 public/ 檔案）
 */
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  path.join(process.cwd(), "public", "uploads");

/** MIME type → file extension mapping */
export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

/** File extension → Content-Type mapping */
export const EXT_TO_CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};
