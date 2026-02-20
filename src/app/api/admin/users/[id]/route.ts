import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth";

// PATCH - 啟用/停用用戶、變更角色
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const targetId = parseInt(id);

  // 不能修改自己
  if (targetId === currentAdmin.id) {
    return NextResponse.json({ error: "不能修改自己的帳號" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }
    if (body.role === "admin" || body.role === "editor") {
      data.role = body.role;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "無有效欄位" }, { status: 400 });
    }

    const updated = await prisma.admin.update({
      where: { id: targetId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
