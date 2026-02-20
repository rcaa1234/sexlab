import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth";

// GET - 列出所有使用者（僅 admin 角色可存取）
export async function GET(_request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "資料庫無法連線" }, { status: 503 });
  }

  // 驗證是否為 admin 角色
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const payload = await verifySession(token);
  if (!payload?.sub) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const currentAdmin = await prisma.admin.findUnique({
    where: { id: parseInt(payload.sub) },
  });

  if (!currentAdmin || currentAdmin.role !== "admin") {
    return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
  }

  try {
    const users = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        googleId: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}
