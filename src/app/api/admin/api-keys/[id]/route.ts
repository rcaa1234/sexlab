import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// DELETE - 停用 API Key（設 isActive=false）
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!prisma) {
    return NextResponse.json({ error: "資料庫無法連線" }, { status: 503 });
  }

  try {
    const { id } = await params;
    const keyId = parseInt(id, 10);

    if (isNaN(keyId)) {
      return NextResponse.json({ error: "無效的 ID" }, { status: 400 });
    }

    const existing = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "找不到此 API Key" }, { status: 404 });
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "操作失敗" }, { status: 500 });
  }
}
