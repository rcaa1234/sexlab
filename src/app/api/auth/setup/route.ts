import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  createSession,
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
} from "@/lib/auth";

// GET - 檢查是否需要初始設定
export async function GET() {
  if (!prisma) {
    // 資料庫不可用時，視為需要設定（讓使用者看到表單，提交時再報錯）
    return NextResponse.json({ needSetup: true });
  }

  try {
    const count = await prisma.admin.count();
    return NextResponse.json({ needSetup: count === 0 });
  } catch {
    // admins 資料表可能尚未建立，視為需要設定
    return NextResponse.json({ needSetup: true });
  }
}

// POST - 建立第一個管理員帳號
export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  // 如果已有管理員，拒絕建立
  const count = await prisma.admin.count();
  if (count > 0) {
    return NextResponse.json(
      { error: "已完成初始設定，無法再次使用此功能" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "請填寫 Email 和密碼" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "密碼長度至少需要 8 個字元" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: {
      email,
      passwordHash,
      name: name || "管理員",
      role: "admin",
      isActive: true,
    },
  });

  // 建立後自動登入
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
