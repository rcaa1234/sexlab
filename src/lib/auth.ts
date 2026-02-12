import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-in-production"
);

export const SESSION_COOKIE_NAME = "admin-session";

export interface SessionPayload extends JWTPayload {
  sub: string;
  role: string;
}

// 建立 JWT session token
export async function createSession(
  adminId: number,
  role: string
): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(adminId))
    .setIssuer("sexlab-blog")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// 驗證 JWT session token
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "sexlab-blog",
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

// 密碼雜湊
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 密碼驗證
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session cookie 設定
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 天
  };
}
