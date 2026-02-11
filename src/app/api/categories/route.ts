import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/categories
export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

// POST /api/categories
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, slug, description, icon } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "name, slug 為必填" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "slug 已存在" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { name, slug, description: description || "", icon: icon || null },
  });

  return NextResponse.json(category, { status: 201 });
}
