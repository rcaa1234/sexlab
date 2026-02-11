import { Header, Footer } from "@/components/layout";
import { ArticleCard, Article } from "@/components/blog";
import { getPosts, getCategories } from "@/lib/wordpress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

// 示範用的假資料（當 WordPress API 無法連線時使用）
const mockArticles: Article[] = [
  {
    id: 1,
    slug: "exploring-g-spot",
    title: "探索 G 點高潮：完整指南與實用技巧",
    excerpt: "G 點是許多人好奇但又不太了解的區域。這篇文章將帶你深入了解 G 點的位置、刺激方式，以及如何達到更強烈的高潮體驗。",
    category: { name: "愛愛小知識", slug: "knowledge" },
    tags: [{ name: "高潮", slug: "orgasm" }, { name: "G點", slug: "g-spot" }],
    date: "2024年1月15日",
    readingTime: 8,
  },
  {
    id: 2,
    slug: "best-vibrators-2024",
    title: "2024 年最推薦的按摩棒評測",
    excerpt: "我們實測了市面上最熱門的 10 款按摩棒，從震動模式、材質安全性到實際使用體驗，為你找出最適合的選擇。",
    category: { name: "愛愛小道具", slug: "toys" },
    tags: [{ name: "按摩棒", slug: "vibrator" }, { name: "評測", slug: "review" }],
    date: "2024年1月10日",
    readingTime: 12,
  },
  {
    id: 3,
    slug: "foreplay-guide",
    title: "前戲的藝術：讓愛愛更有感覺的秘訣",
    excerpt: "好的前戲是美好性愛的關鍵。學習如何透過觸摸、親吻和言語，為你和伴侶創造更深層的連結與快感。",
    category: { name: "愛愛小知識", slug: "knowledge" },
    tags: [{ name: "前戲", slug: "foreplay" }, { name: "技巧", slug: "tips" }],
    date: "2024年1月8日",
    readingTime: 6,
  },
  {
    id: 4,
    slug: "bdsm-beginners",
    title: "BDSM 入門：安全探索情趣新世界",
    excerpt: "對 BDSM 感到好奇？這篇文章將介紹基礎概念、安全原則，以及如何與伴侶溝通，讓你安心探索這個刺激的領域。",
    category: { name: "愛愛小知識", slug: "knowledge" },
    tags: [{ name: "BDSM", slug: "bdsm" }, { name: "入門", slug: "beginner" }],
    date: "2024年1月5日",
    readingTime: 10,
  },
  {
    id: 5,
    slug: "lubricant-guide",
    title: "潤滑液選購指南：水性、矽性、油性怎麼選？",
    excerpt: "潤滑液是提升性愛體驗的好幫手，但市面上種類繁多。了解不同類型的特性，找到最適合你的那一款。",
    category: { name: "愛愛小道具", slug: "toys" },
    tags: [{ name: "潤滑液", slug: "lubricant" }, { name: "選購", slug: "guide" }],
    date: "2024年1月3日",
    readingTime: 7,
  },
];

export default async function HomePage() {
  let articles: Article[] = mockArticles;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  // 嘗試從 WordPress 取得資料
  try {
    const [postsData, categoriesData] = await Promise.all([
      getPosts({ perPage: 10 }),
      getCategories(),
    ]);

    if (postsData.posts.length > 0) {
      articles = postsData.posts;
    }
    categories = categoriesData;
  } catch (error) {
    console.log("Using mock data - WordPress API unavailable");
  }

  const featuredArticle = articles[0];
  const recentArticles = articles.slice(1, 7);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                探索愛的知識
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                讓每一次親密<br />
                <span className="text-primary">都更加美好</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                愛愛實驗室提供專業的性知識、情趣用品評測與親密關係指南，
                讓你的愛愛生活更精彩、更安全、更有感覺。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/category/knowledge">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    開始探索
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                    關於我們
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && (
          <section className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">精選文章</h2>
            </div>
            <ArticleCard article={featuredArticle} featured />
          </section>
        )}

        {/* Recent Articles */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">最新文章</h2>
            <Link href="/posts">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">文章分類</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "愛愛小知識", slug: "knowledge", description: "性知識、技巧與健康資訊", icon: "📚" },
              { name: "愛愛小道具", slug: "toys", description: "情趣用品評測與推薦", icon: "🎁" },
              { name: "愛愛小創作", slug: "creative", description: "創意內容與故事分享", icon: "✨" },
            ].map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}>
                <div className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="text-4xl mb-4 block">{cat.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="container mx-auto px-4 py-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 p-8 md:p-12">
            <div className="relative z-10 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                訂閱愛愛實驗室
              </h2>
              <p className="text-muted-foreground mb-6">
                訂閱我們的電子報，每週獲得最新的性知識文章、產品評測和獨家內容。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="輸入你的 Email"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                  訂閱
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
