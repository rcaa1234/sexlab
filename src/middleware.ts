import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-in-production"
);
const SESSION_COOKIE = "admin-session";

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

  // 保護管理 API（/api/admin/*）
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }
    try {
      await jwtVerify(token, JWT_SECRET, { issuer: "sexlab-blog" });
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }
  }

  // 保護寫入 API（POST, PUT, DELETE）
  if (
    pathname.startsWith("/api/posts") ||
    pathname.startsWith("/api/categories")
  ) {
    if (request.method === "GET") {
      return NextResponse.next();
    }

    // 1. 檢查 session cookie
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (sessionToken) {
      try {
        await jwtVerify(sessionToken, JWT_SECRET, { issuer: "sexlab-blog" });
        return NextResponse.next();
      } catch {
        // cookie 無效，繼續檢查 Bearer token
      }
    }

    // 2. 檢查 Authorization: Bearer <token>（環境變數 AGENT_API_KEY）
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const bearerToken = authHeader.slice(7);
      if (bearerToken === process.env.AGENT_API_KEY) {
        return NextResponse.next();
      }
    }

    // 3. 都沒有 → 401
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/posts/:path*", "/api/categories/:path*", "/api/admin/:path*"],
};
