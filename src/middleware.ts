import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-in-production"
);
const SESSION_COOKIE = "admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // 保護寫入 API（POST, PUT, DELETE）
  if (
    pathname.startsWith("/api/posts") ||
    pathname.startsWith("/api/categories")
  ) {
    if (request.method === "GET") {
      return NextResponse.next();
    }

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/posts/:path*", "/api/categories/:path*"],
};
