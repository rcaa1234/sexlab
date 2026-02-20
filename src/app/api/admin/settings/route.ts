import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - 取得設定值
export async function GET(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "資料庫無法連線" }, { status: 503 });
  }

  const key = request.nextUrl.searchParams.get("key");

  try {
    if (key) {
      const setting = await prisma.siteSetting.findUnique({ where: { key } });
      return NextResponse.json({ value: setting?.value ?? "" });
    }

    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json({ settings: map });
  } catch {
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}

// PUT - 更新設定值（upsert）
export async function PUT(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "資料庫無法連線" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "缺少 key" }, { status: 400 });
    }

    if (value === "" || value === null) {
      // 清空則刪除
      await prisma.siteSetting.deleteMany({ where: { key } });
      return NextResponse.json({ success: true });
    }

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
