import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { ArticleCard, Article } from "@/components/blog";
import { Button } from "@/components/ui/button";
import { getPosts } from "@/lib/wordpress";
import { ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const categoryInfo: Record<string, { name: string; description: string; icon: string }> = {
  knowledge: {
    name: "愛愛小知識",
    description: "探索性知識、技巧與健康資訊，讓你更了解自己和伴侶的身體。",
    icon: "📚",
  },
  toys: {
    name: "愛愛小道具",
    description: "情趣用品的專業評測與推薦，幫你找到最適合的產品。",
    icon: "🎁",
  },
  creative: {
    name: "愛愛小創作",
    description: "創意內容、故事分享與靈感啟發，豐富你的親密生活。",
    icon: "✨",
  },
};

// 每 60 秒重新生成頁面（ISR）
export const revalidate = 60;

// 生成靜態頁面
export async function generateStaticParams() {
  return Object.keys(categoryInfo).map((slug) => ({ slug }));
}

// 動態生成 SEO metadata
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const info = categoryInfo[slug];

  if (!info) {
    return { title: "分類不存在" };
  }

  return {
    title: info.name,
    description: info.description,
    openGraph: {
      title: `${info.name} | 愛愛實驗室`,
      description: info.description,
    },
  };
}

// 示範資料
const mockArticlesByCategory: Record<string, Article[]> = {
  knowledge: [
    {
      id: 1,
      slug: "exploring-g-spot",
      title: "探索 G 點高潮：完整指南與實用技巧",
      excerpt: "G 點是許多人好奇但又不太了解的區域。這篇文章將帶你深入了解 G 點的位置、刺激方式，以及如何達到更強烈的高潮體驗。",
      category: { name: "愛愛小知識", slug: "knowledge" },
      date: "2024年1月15日",
      readingTime: 8,
    },
    {
      id: 3,
      slug: "foreplay-guide",
      title: "前戲的藝術：讓愛愛更有感覺的秘訣",
      excerpt: "好的前戲是美好性愛的關鍵。學習如何透過觸摸、親吻和言語，為你和伴侶創造更深層的連結與快感。",
      category: { name: "愛愛小知識", slug: "knowledge" },
      date: "2024年1月8日",
      readingTime: 6,
    },
    {
      id: 4,
      slug: "bdsm-beginners",
      title: "BDSM 入門：安全探索情趣新世界",
      excerpt: "對 BDSM 感到好奇？這篇文章將介紹基礎概念、安全原則，以及如何與伴侶溝通，讓你安心探索這個刺激的領域。",
      category: { name: "愛愛小知識", slug: "knowledge" },
      date: "2024年1月5日",
      readingTime: 10,
    },
  ],
  toys: [
    {
      id: 2,
      slug: "best-vibrators-2024",
      title: "2024 年最推薦的按摩棒評測",
      excerpt: "我們實測了市面上最熱門的 10 款按摩棒，從震動模式、材質安全性到實際使用體驗，為你找出最適合的選擇。",
      category: { name: "愛愛小道具", slug: "toys" },
      date: "2024年1月10日",
      readingTime: 12,
    },
    {
      id: 5,
      slug: "lubricant-guide",
      title: "潤滑液選購指南：水性、矽性、油性怎麼選？",
      excerpt: "潤滑液是提升性愛體驗的好幫手，但市面上種類繁多。了解不同類型的特性，找到最適合你的那一款。",
      category: { name: "愛愛小道具", slug: "toys" },
      date: "2024年1月3日",
      readingTime: 7,
    },
  ],
  creative: [
    {
      id: 6,
      slug: "romantic-ideas",
      title: "10 個浪漫的約會夜點子",
      excerpt: "想要為平淡的日常增添一些火花？這裡有 10 個創意點子，讓你和伴侶度過難忘的親密時光。",
      category: { name: "愛愛小創作", slug: "creative" },
      date: "2024年1月1日",
      readingTime: 5,
    },
  ],
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const info = categoryInfo[slug];

  if (!info) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">分類不存在</h1>
            <Link href="/">
              <Button>返回首頁</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 從資料庫取得資料
  let articles: Article[] = mockArticlesByCategory[slug] || [];

  try {
    const { posts } = await getPosts({ categorySlug: slug, perPage: 20 });
    if (posts.length > 0) {
      articles = posts;
    }
  } catch (error) {
    console.log("Using mock data - database unavailable");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Category Header */}
        <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首頁
              </Button>
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{info.icon}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {info.name}
              </h1>
            </div>

            <p className="text-lg text-muted-foreground max-w-2xl">
              {info.description}
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              共 {articles.length} 篇文章
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="container mx-auto px-4 py-12">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">此分類尚無文章</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
