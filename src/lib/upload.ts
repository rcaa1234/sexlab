import path from "path";

/**
 * 持久化上傳目錄
 *
 * Zeabur Volume 掛載路徑：在 Zeabur Dashboard 設定 Volume 掛載到 /data
 * 環境變數 UPLOAD_DIR 可自訂，預設 /data/uploads
 *
 * 本地開發時 fallback 到 public/uploads
 */
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  (process.env.NODE_ENV === "production"
    ? "/data/uploads"
    : path.join(process.cwd(), "public", "uploads"));

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
