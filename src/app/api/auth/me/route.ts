import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const payload = await verifySession(token);

  if (!payload?.sub) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: parseInt(payload.sub) },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      googleId: true,
      avatar: true,
    },
  });

  if (!admin || !admin.isActive) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  return NextResponse.json({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    googleId: admin.googleId,
    avatar: admin.avatar,
  });
}
