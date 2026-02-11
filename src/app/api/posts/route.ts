import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/posts - 取得文章列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "20");
  const status = searchParams.get("status") || undefined;
  const skip = (page - 1) * perPage;

  const where: any = {};
  if (status) where.status = status;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  });
}

// POST /api/posts - 新增文章
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, slug, content, excerpt, summary, faqJson, featuredImage, status, categoryId, tagIds, readingTime } = body;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: "title, slug, content 為必填" }, { status: 400 });
  }

  // 檢查 slug 是否重複
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "slug 已存在" }, { status: 409 });
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || "",
      summary: summary || "",
      faqJson: faqJson || undefined,
      featuredImage: featuredImage || null,
      status: status || "draft",
      categoryId: categoryId || null,
      readingTime: readingTime || null,
      publishedAt: status === "published" ? new Date() : null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: number) => ({ tagId })) }
        : undefined,
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
