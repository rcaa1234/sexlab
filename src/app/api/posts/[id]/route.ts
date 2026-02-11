import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  if (!prisma) return NextResponse.json({ error: "Database not available" }, { status: 503 });
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PUT /api/posts/[id] - 更新文章
export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!prisma) return NextResponse.json({ error: "Database not available" }, { status: 503 });
  const { id } = await params;
  const body = await request.json();
  const { title, slug, content, excerpt, summary, faqJson, featuredImage, status, categoryId, tagIds, readingTime } = body;

  const postId = parseInt(id);
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // 如果改了 slug，檢查是否重複
  if (slug && slug !== existing.slug) {
    const slugExists = await prisma.post.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json({ error: "slug 已存在" }, { status: 409 });
    }
  }

  // 更新標籤關聯
  if (tagIds !== undefined) {
    await prisma.postTag.deleteMany({ where: { postId } });
  }

  const wasPublished = existing.status === "published";
  const isPublishing = status === "published" && !wasPublished;

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(summary !== undefined && { summary }),
      ...(faqJson !== undefined && { faqJson }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(status !== undefined && { status }),
      ...(categoryId !== undefined && { categoryId }),
      ...(readingTime !== undefined && { readingTime }),
      ...(isPublishing && { publishedAt: new Date() }),
      ...(tagIds !== undefined && tagIds.length > 0 && {
        tags: { create: tagIds.map((tagId: number) => ({ tagId })) },
      }),
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(post);
}

// DELETE /api/posts/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  if (!prisma) return NextResponse.json({ error: "Database not available" }, { status: 503 });
  const { id } = await params;
  const postId = parseInt(id);

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}
