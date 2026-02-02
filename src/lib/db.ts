import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 文章相關操作
export async function getPosts(params?: {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}) {
  const page = params?.page || 1;
  const perPage = params?.perPage || 10;
  const skip = (page - 1) * perPage;

  const where: any = {
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
  return prisma.category.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

export async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

export async function getTags() {
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

// 轉換資料格式
function transformPost(post: any) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content,
    featuredImage: post.featuredImage,
    category: post.category || { name: "未分類", slug: "uncategorized" },
    tags: post.tags?.map((pt: any) => ({
      name: pt.tag.name,
      slug: pt.tag.slug,
    })) || [],
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("zh-TW", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "",
    readingTime: post.readingTime || 5,
  };
}

export type { PrismaClient };
