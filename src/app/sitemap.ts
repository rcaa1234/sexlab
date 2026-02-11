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
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // 分類頁面（靜態）
  const categoryPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/category/knowledge`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/category/toys`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/category/creative`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // 文章頁面（從資料庫動態取得）
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const { getPosts } = await import("@/lib/db");
    const { posts } = await getPosts({ perPage: 100 });
    postPages = posts.map((post: { slug: string; updatedAt: string }) => ({
      url: `${siteUrl}/post/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Build time — 資料庫不可用
  }

  return [...staticPages, ...categoryPages, ...postPages];
}
