import { MetadataRoute } from "next";
import { getPosts, getCategories } from "@/lib/db";

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

  // 分類頁面
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    categoryPages = categories.map((cat) => ({
      url: `${siteUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    categoryPages = [
      { url: `${siteUrl}/category/knowledge`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${siteUrl}/category/toys`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${siteUrl}/category/creative`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ];
  }

  // 文章頁面（從資料庫動態取得）
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await getPosts({ perPage: 100 });
    postPages = posts.map((post) => ({
      url: `${siteUrl}/post/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    console.log("Could not fetch posts for sitemap");
  }

  return [...staticPages, ...categoryPages, ...postPages];
}
