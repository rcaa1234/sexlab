import { getCategories, getPosts } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sexlab.com.tw";

export async function GET() {
  let categoriesSection = "";
  let articlesSection = "";

  try {
    const categories = await getCategories();
    categoriesSection = categories
      .map(
        (cat: { name: string; slug: string; _count: { posts: number } }) =>
          `- ${cat.name} (${cat._count.posts} 篇): ${siteUrl}/category/${cat.slug}`
      )
      .join("\n");
  } catch {
    categoriesSection = `- 愛愛小知識: ${siteUrl}/category/knowledge
- 愛愛小道具: ${siteUrl}/category/toys
- 愛愛小創作: ${siteUrl}/category/creative`;
  }

  try {
    const { posts } = await getPosts({ perPage: 20 });
    articlesSection = posts
      .map(
        (post) =>
          `- ${post.title}: ${siteUrl}/post/${post.slug}`
      )
      .join("\n");
  } catch {
    articlesSection = "（目前無法取得文章列表）";
  }

  const content = `# 愛愛實驗室
> 愛愛實驗室提供專業的性知識、情趣用品評測與親密關係指南，讓你的愛愛生活更精彩。

## 網站資訊
- 網站: ${siteUrl}
- RSS: ${siteUrl}/feed.xml
- Sitemap: ${siteUrl}/sitemap.xml

## 文章分類
${categoriesSection}

## 最新文章
${articlesSection}

## 頁面
- 首頁: ${siteUrl}
- 關於我們: ${siteUrl}/about
- 聯絡我們: ${siteUrl}/contact
- 隱私權政策: ${siteUrl}/privacy
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
