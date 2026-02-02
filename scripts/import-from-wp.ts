/**
 * WordPress 文章匯入腳本
 * 從 WordPress REST API 抓取所有文章並存入 MySQL 資料庫
 *
 * 使用方式: npx tsx scripts/import-from-wp.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WP_API_URL = "https://sexlab.com.tw/wp-json/wp/v2";

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

interface WPCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
}

interface WPTag {
  id: number;
  slug: string;
  name: string;
}

// 清理 HTML
function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\[&hellip;\]/g, "...")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

// 計算閱讀時間
function calculateReadingTime(content: string): number {
  const text = cleanHtml(content);
  const wordCount = text.length;
  return Math.max(1, Math.ceil(wordCount / 400));
}

// 抓取所有分類
async function fetchCategories(): Promise<WPCategory[]> {
  console.log("📁 正在抓取分類...");
  const res = await fetch(`${WP_API_URL}/categories?per_page=100`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const categories = await res.json();
  console.log(`   找到 ${categories.length} 個分類`);
  return categories;
}

// 抓取所有標籤
async function fetchTags(): Promise<WPTag[]> {
  console.log("🏷️  正在抓取標籤...");
  const res = await fetch(`${WP_API_URL}/tags?per_page=100`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  const tags = await res.json();
  console.log(`   找到 ${tags.length} 個標籤`);
  return tags;
}

// 抓取所有文章（分頁）
async function fetchAllPosts(): Promise<WPPost[]> {
  console.log("📝 正在抓取文章...");
  const allPosts: WPPost[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${WP_API_URL}/posts?_embed=true&per_page=100&page=${page}`
    );

    if (!res.ok) {
      if (res.status === 400) {
        hasMore = false;
        continue;
      }
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const posts: WPPost[] = await res.json();
    if (posts.length === 0) {
      hasMore = false;
    } else {
      allPosts.push(...posts);
      console.log(`   第 ${page} 頁: ${posts.length} 篇文章`);
      page++;
    }
  }

  console.log(`   總共 ${allPosts.length} 篇文章`);
  return allPosts;
}

// 主要匯入函數
async function importFromWordPress() {
  console.log("🚀 開始從 WordPress 匯入資料...\n");

  try {
    // 1. 抓取所有資料
    const [categories, tags, posts] = await Promise.all([
      fetchCategories(),
      fetchTags(),
      fetchAllPosts(),
    ]);

    console.log("\n📥 開始寫入資料庫...\n");

    // 2. 匯入分類
    console.log("📁 匯入分類...");
    for (const cat of categories) {
      await prisma.category.upsert({
        where: { wpId: cat.id },
        update: {
          slug: cat.slug,
          name: cat.name,
          description: cat.description || null,
        },
        create: {
          wpId: cat.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description || null,
        },
      });
    }
    console.log(`   ✅ ${categories.length} 個分類匯入完成`);

    // 3. 匯入標籤
    console.log("🏷️  匯入標籤...");
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { wpId: tag.id },
        update: {
          slug: tag.slug,
          name: tag.name,
        },
        create: {
          wpId: tag.id,
          slug: tag.slug,
          name: tag.name,
        },
      });
    }
    console.log(`   ✅ ${tags.length} 個標籤匯入完成`);

    // 4. 匯入文章
    console.log("📝 匯入文章...");
    for (const post of posts) {
      const featuredImage =
        post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

      // 找到對應的分類
      const categoryWpId = post.categories[0];
      const category = categoryWpId
        ? await prisma.category.findUnique({ where: { wpId: categoryWpId } })
        : null;

      // 建立或更新文章
      const savedPost = await prisma.post.upsert({
        where: { wpId: post.id },
        update: {
          slug: post.slug,
          title: post.title.rendered,
          excerpt: cleanHtml(post.excerpt.rendered),
          content: post.content.rendered,
          featuredImage,
          readingTime: calculateReadingTime(post.content.rendered),
          publishedAt: new Date(post.date),
          categoryId: category?.id || null,
        },
        create: {
          wpId: post.id,
          slug: post.slug,
          title: post.title.rendered,
          excerpt: cleanHtml(post.excerpt.rendered),
          content: post.content.rendered,
          featuredImage,
          status: "published",
          readingTime: calculateReadingTime(post.content.rendered),
          publishedAt: new Date(post.date),
          categoryId: category?.id || null,
        },
      });

      // 處理標籤關聯
      if (post.tags && post.tags.length > 0) {
        // 先刪除舊的關聯
        await prisma.postTag.deleteMany({
          where: { postId: savedPost.id },
        });

        // 建立新的關聯
        for (const tagWpId of post.tags) {
          const tag = await prisma.tag.findUnique({ where: { wpId: tagWpId } });
          if (tag) {
            await prisma.postTag.create({
              data: {
                postId: savedPost.id,
                tagId: tag.id,
              },
            });
          }
        }
      }

      console.log(`   ✅ ${post.title.rendered.substring(0, 30)}...`);
    }

    console.log(`\n🎉 匯入完成！`);
    console.log(`   - ${categories.length} 個分類`);
    console.log(`   - ${tags.length} 個標籤`);
    console.log(`   - ${posts.length} 篇文章`);
  } catch (error) {
    console.error("❌ 匯入失敗:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行
importFromWordPress();
