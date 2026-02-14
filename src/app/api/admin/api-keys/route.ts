import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createApiKey } from "@/lib/auth";

// GET - 列出所有 API Key（不含 key 本身）
export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: "資料庫無法連線" }, { status: 503 });
  }

  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        prefix: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ keys });
  } catch {
    return NextResponse.json({ error: "查詢失敗" }, { status: 500 });
  }
}

// POST - 建立新 API Key（回傳完整 key，僅此一次）
export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json({ error: "資料庫無法連線" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "請提供 API Key 名稱" },
        { status: 400 }
      );
    }

    // 建立 DB 記錄（先拿到 id）
    const record = await prisma.apiKey.create({
      data: {
        name: name.trim(),
        prefix: "pending",
        createdById: 1, // 從 middleware 通過的就是 admin
      },
    });

    // 簽發 JWT
    const key = await createApiKey(record.id, name.trim());

    // 更新 prefix（取 key 的前 8 碼）
    const prefix = key.slice(0, 8);
    await prisma.apiKey.update({
      where: { id: record.id },
      data: { prefix },
    });

    return NextResponse.json({
      id: record.id,
      name: record.name,
      prefix,
      key, // 完整 key，僅此一次
    });
  } catch {
    return NextResponse.json({ error: "建立失敗" }, { status: 500 });
  }
}
