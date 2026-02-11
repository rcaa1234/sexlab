// 資料層統一從 Prisma 讀取，不再依賴 WP REST API

export {
  getPosts,
  getPost,
  getCategories,
  getCategory,
  getTags,
  searchPosts,
  transformPost,
} from "./db";

// 分類對應
export const categoryMap: Record<string, string> = {
  knowledge: "愛愛小知識",
  toys: "愛愛小道具",
  creative: "愛愛小創作",
};
