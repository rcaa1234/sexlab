import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 延遲初始化：避免 build 時因無資料庫連線而失敗
let prisma: PrismaClient | null = null;
try {
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch (e) {
  console.log("Database unavailable, using mock data.", e instanceof Error ? e.message : e);
}

export { prisma };

// 文章相關操作
export async function getPosts(params?: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}) {
  if (!prisma) throw new Error("Database not available");

  const page = params?.page || 1;
  const perPage = params?.perPage || 10;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {
    status: "published",
  };

  if (params?.categorySlug) {
    where.category = { slug: params.categorySlug };
  }

  if (params?.tagSlug) {
    where.tags = {
      some: {
        tag: { slug: params.tagSlug },
      },
    };
  }

  if (params?.search) {
    where.OR = [
      { title: { contains: params.search } },
      { content: { contains: params.search } },
      { excerpt: { contains: params.search } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { publishedAt: "desc" },
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map(transformPost),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
  };
}

export async function getPost(slug: string) {
  if (!prisma) throw new Error("Database not available");

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) return null;
  return transformPost(post);
}

export async function getCategories() {
  if (!prisma) throw new Error("Database not available");

  return prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

export async function getCategory(slug: string) {
  if (!prisma) throw new Error("Database not available");

  return prisma.category.findUnique({
    where: { slug },
  });
}

export async function getTags() {
  if (!prisma) throw new Error("Database not available");

  return prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

export async function searchPosts(query: string, page = 1, perPage = 10) {
  return getPosts({ search: query, page, perPage });
}

// 轉換後的文章型別
export interface TransformedPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  summary: string;
  content: string;
  featuredImage?: string;
  category: { name: string; slug: string };
  tags: { name: string; slug: string }[];
  faqJson: { question: string; answer: string }[] | null;
  date: string;
  isoDate: string;
  updatedAt: string;
  readingTime: number;
}

// 轉換資料格式
export function transformPost(post: Record<string, unknown>): TransformedPost {
  const tags = post.tags as Array<{ tag: { name: string; slug: string } }> | undefined;
  const category = post.category as { name: string; slug: string } | null;
  const publishedAt = post.publishedAt as Date | null;
  const updatedAtDate = post.updatedAt as Date | null;

  return {
    id: post.id as number,
    slug: post.slug as string,
    title: post.title as string,
    excerpt: (post.excerpt as string) || "",
    summary: (post.summary as string) || "",
    content: post.content as string,
    featuredImage: (post.featuredImage as string) || undefined,
    category: category || { name: "未分類", slug: "uncategorized" },
    tags: tags?.map((pt) => ({
      name: pt.tag.name,
      slug: pt.tag.slug,
    })) || [],
    faqJson: (post.faqJson as { question: string; answer: string }[]) || null,
    date: publishedAt
      ? new Date(publishedAt).toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
    isoDate: publishedAt ? new Date(publishedAt).toISOString() : "",
    updatedAt: updatedAtDate ? new Date(updatedAtDate).toISOString() : "",
    readingTime: (post.readingTime as number) || 5,
  };
}

export type { PrismaClient };
