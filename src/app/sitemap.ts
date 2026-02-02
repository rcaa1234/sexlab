import { MetadataRoute } from "next";
import { getPosts, getCategories } from "@/lib/wordpress";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sexlab.com.tw";

  // 靜態頁面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // 分類頁面
  const categoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/category/knowledge`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/toys`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/creative`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 文章頁面（從 WordPress 動態取得）
  let postPages: MetadataRoute.Sitemap = [];

  try {
    const { posts } = await getPosts({ perPage: 100 });
    postPages = posts.map((post) => ({
      url: `${baseUrl}/post/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.log("Could not fetch posts for sitemap");
  }

  return [...staticPages, ...categoryPages, ...postPages];
}
