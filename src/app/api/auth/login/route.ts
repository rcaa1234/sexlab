import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  createSession,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "請輸入帳號和密碼" },
      { status: 400 }
    );
  }

  // 查詢管理員
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) {
    return NextResponse.json(
      { error: "帳號或密碼錯誤" },
      { status: 401 }
    );
  }

  // 檢查帳號是否啟用
  if (!admin.isActive) {
    return NextResponse.json(
      { error: "此帳號已被停用" },
      { status: 403 }
    );
  }

  // Google-only 用戶沒有密碼
  if (!admin.passwordHash) {
    return NextResponse.json(
      { error: "此帳號使用 Google 登入，請點擊「使用 Google 登入」" },
      { status: 400 }
    );
  }

  // 驗證密碼
  const isValid = await verifyPassword(password, admin.passwordHash);

  if (!isValid) {
    return NextResponse.json(
      { error: "帳號或密碼錯誤" },
      { status: 401 }
    );
  }

  // 建立 session
  const token = await createSession(admin.id, admin.role);

  const response = NextResponse.json({
    success: true,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

  return response;
}
