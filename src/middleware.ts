import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-in-production"
);
const SESSION_COOKIE = "admin-session";

// 統一認證：session cookie / Authorization: Bearer / x-api-key
async function verifyAnyAuth(request: NextRequest): Promise<boolean> {
  // 1. Session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, JWT_SECRET, { issuer: "sexlab-blog" });
      return true;
    } catch {
      // 繼續檢查其他方式
    }
  }

  const agentKey = process.env.AGENT_API_KEY;
  if (agentKey) {
    // 2. x-api-key header
    if (request.headers.get("x-api-key") === agentKey) {
      return true;
    }
    // 3. Authorization: Bearer
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ") && authHeader.slice(7) === agentKey) {
      return true;
    }
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 設定頁面與登入頁面：不需認證
  if (pathname === "/admin/setup") {
    return NextResponse.next();
  }

  // 登入頁面：已登入則導向後台首頁
  if (pathname === "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET, { issuer: "sexlab-blog" });
        return NextResponse.redirect(new URL("/admin", request.url));
      } catch {
        // token 無效，讓使用者看到登入頁
      }
    }
    return NextResponse.next();
  }

  // 保護後台頁面
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET, { issuer: "sexlab-blog" });
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 保護管理 API（/api/admin/*）— 支援 cookie、Bearer token、x-api-key
  if (pathname.startsWith("/api/admin")) {
    if (await verifyAnyAuth(request)) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  // 保護寫入 API（POST, PUT, DELETE）
  if (
    pathname.startsWith("/api/posts") ||
    pathname.startsWith("/api/categories")
  ) {
    if (request.method === "GET") {
      return NextResponse.next();
    }

    if (await verifyAnyAuth(request)) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/posts/:path*", "/api/categories/:path*", "/api/admin/:path*"],
};
