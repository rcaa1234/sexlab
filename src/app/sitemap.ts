import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sexlab.com.tw";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 靜態頁面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/feed.xml`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.3,
    },
  ];

  // 分類頁面（從 DB 動態取得）
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const { getCategories } = await import("@/lib/db");
    const categories = await getCategories();
    categoryPages = categories.map((cat: { slug: string }) => ({
      url: `${siteUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // fallback 靜態分類
    categoryPages = ["knowledge", "toys", "creative"].map((slug) => ({
      url: `${siteUrl}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  // 文章頁面（分頁取完所有文章）
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const { getPosts } = await import("@/lib/db");
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const { posts, totalPages } = await getPosts({ page, perPage });
      postPages.push(
        ...posts.map((post: { slug: string; updatedAt: string }) => ({
          url: `${siteUrl}/post/${post.slug}`,
          lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
      );
      hasMore = page < totalPages;
      page++;
    }
  } catch {
    // Build time — 資料庫不可用
  }

  return [...staticPages, ...categoryPages, ...postPages];
}
