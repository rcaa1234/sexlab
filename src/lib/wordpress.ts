// WordPress REST API 整合

const WP_API_URL = process.env.WORDPRESS_API_URL || "https://sexlab.com.tw/wp-json/wp/v2";

export interface WPPost {
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
    "wp:term"?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// 分類對應（根據你的 WordPress 分類）
export const categoryMap: Record<string, string> = {
  "knowledge": "愛愛小知識",
  "toys": "愛愛小道具",
  "creative": "愛愛小創作",
};

// 取得所有文章
export async function getPosts(params?: {
  page?: number;
  perPage?: number;
  category?: number;
  tag?: number;
  search?: string;
}) {
  const searchParams = new URLSearchParams({
    _embed: "true",
    per_page: String(params?.perPage || 10),
    page: String(params?.page || 1),
  });

  if (params?.category) {
    searchParams.set("categories", String(params.category));
  }
  if (params?.tag) {
    searchParams.set("tags", String(params.tag));
  }
  if (params?.search) {
    searchParams.set("search", params.search);
  }

  const res = await fetch(`${WP_API_URL}/posts?${searchParams}`, {
    next: { revalidate: 300 }, // 5 分鐘快取
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
  const total = parseInt(res.headers.get("X-WP-Total") || "0");
  const posts: WPPost[] = await res.json();

  return { posts, totalPages, total };
}

// 取得單篇文章
export async function getPost(slug: string): Promise<WPPost | null> {
  const res = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed=true`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return null;
  }

  const posts: WPPost[] = await res.json();
  return posts[0] || null;
}

// 取得所有分類
export async function getCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API_URL}/categories?per_page=100`, {
    next: { revalidate: 3600 }, // 1 小時快取
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

// 取得單一分類
export async function getCategory(slug: string): Promise<WPCategory | null> {
  const res = await fetch(`${WP_API_URL}/categories?slug=${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return null;
  }

  const categories: WPCategory[] = await res.json();
  return categories[0] || null;
}

// 取得所有標籤
export async function getTags(): Promise<WPTag[]> {
  const res = await fetch(`${WP_API_URL}/tags?per_page=100`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

// 搜尋文章
export async function searchPosts(query: string, page = 1, perPage = 10) {
  return getPosts({ search: query, page, perPage });
}

// 將 WordPress 文章轉換為前端格式
export function transformPost(post: WPPost) {
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const categories = post._embedded?.["wp:term"]?.[0] || [];
  const tags = post._embedded?.["wp:term"]?.[1] || [];

  // 計算閱讀時間（大約每分鐘 400 字）
  const wordCount = post.content.rendered.replace(/<[^>]*>/g, "").length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 400));

  // 清理 excerpt
  const excerpt = post.excerpt.rendered
    .replace(/<[^>]*>/g, "")
    .replace(/\[&hellip;\]/g, "...")
    .trim();

  return {
    id: post.id,
    slug: post.slug,
    title: post.title.rendered,
    excerpt,
    content: post.content.rendered,
    featuredImage,
    category: categories[0] || { id: 0, name: "未分類", slug: "uncategorized" },
    tags: tags.map((t) => ({ name: t.name, slug: t.slug })),
    date: new Date(post.date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readingTime,
  };
}
