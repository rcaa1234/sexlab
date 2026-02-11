import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPost, getPosts } from "@/lib/db";
import { Calendar, Clock, ArrowLeft, Share2, Heart, ChevronDown } from "lucide-react";
import { ArticleCard } from "@/components/blog";
import { ArticleJsonLd } from "@/components/seo/JsonLd";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sexlab.com.tw";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// 生成靜態頁面
export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ perPage: 100 });
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

// 動態生成 SEO metadata
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPost(slug);

  if (!article) {
    return { title: "找不到文章" };
  }

  return {
    title: article.title,
    description: article.summary || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.summary || article.excerpt,
      type: "article",
      url: `${siteUrl}/post/${article.slug}`,
      images: article.featuredImage ? [article.featuredImage] : [],
      publishedTime: article.isoDate,
      modifiedTime: article.updatedAt,
    },
    alternates: {
      canonical: `${siteUrl}/post/${article.slug}`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // 從資料庫取得文章
  let article;
  let relatedArticles: Awaited<ReturnType<typeof getPosts>>["posts"] = [];

  try {
    article = await getPost(slug);
    if (article) {
      const { posts } = await getPosts({ perPage: 4 });
      relatedArticles = posts
        .filter((p) => p.slug !== slug)
        .slice(0, 3);
    }
  } catch (error) {
    console.log("Database unavailable, using mock data");
  }

  // 如果沒有文章，使用假資料展示
  if (!article) {
    article = {
      id: 1,
      slug: slug,
      title: "探索 G 點高潮：完整指南與實用技巧",
      excerpt: "G 點是許多人好奇但又不太了解的區域。",
      summary: "",
      content: `
        <h2>什麼是 G 點？</h2>
        <p>G 點（Gräfenberg spot）是位於陰道前壁的一個敏感區域，得名於德國婦產科醫生 Ernst Gräfenberg。這個區域大約在陰道入口內側 2-3 公分處，觸感略為粗糙，與周圍平滑的陰道壁形成對比。</p>

        <h2>如何找到 G 點？</h2>
        <p>找到 G 點需要一些探索和耐心。以下是一些建議：</p>
        <ul>
          <li>首先確保身心放鬆</li>
          <li>使用充足的潤滑液</li>
          <li>將手指插入陰道，指腹朝向腹部方向</li>
          <li>輕輕用「來」的手勢按壓前壁</li>
          <li>注意任何特別敏感的區域</li>
        </ul>

        <h2>刺激技巧</h2>
        <p>找到 G 點後，可以嘗試以下刺激方式：</p>
        <ol>
          <li><strong>輕柔按壓</strong>：用指腹輕輕按壓該區域</li>
          <li><strong>畫圈動作</strong>：以小圓圈方式按摩</li>
          <li><strong>來回摩擦</strong>：前後輕柔地滑動</li>
          <li><strong>配合其他刺激</strong>：同時刺激陰蒂可能帶來更強烈的快感</li>
        </ol>

        <h2>重要提醒</h2>
        <p>每個人的身體都是獨特的，G 點的位置、大小和敏感度因人而異。有些人可能不容易找到或對 G 點刺激沒有特別強烈的反應，這都是完全正常的。</p>
        <p>探索自己的身體是一個過程，重要的是享受這個過程，而不是追求特定的結果。與伴侶溝通、保持開放的心態，才是獲得美好性體驗的關鍵。</p>
      `,
      featuredImage: undefined,
      category: { name: "愛愛小知識", slug: "knowledge" },
      tags: [
        { name: "高潮", slug: "orgasm" },
        { name: "G點", slug: "g-spot" },
        { name: "技巧", slug: "tips" },
      ],
      faqJson: null as { question: string; answer: string }[] | null,
      date: "2024年1月15日",
      isoDate: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
      readingTime: 8,
    };
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* JSON-LD 結構化資料 */}
      <ArticleJsonLd
        title={article.title}
        description={article.summary || article.excerpt}
        url={`${siteUrl}/post/${article.slug}`}
        image={article.featuredImage}
        datePublished={article.isoDate}
        dateModified={article.updatedAt}
        faq={article.faqJson}
      />

      <main className="flex-1">
        {/* Article Header */}
        <article>
          <header className="border-b border-border/40">
            <div className="container mx-auto px-4 py-12 md:py-16">
              <div className="max-w-3xl mx-auto">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回首頁
                  </Button>
                </Link>

                <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                  {article.category.name}
                </Badge>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {article.date}
                  </span>
                  {article.readingTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {article.readingTime} 分鐘閱讀
                    </span>
                  )}
                </div>

                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag: { name: string; slug: string }) => (
                      <Link key={tag.slug} href={`/tag/${tag.slug}`}>
                        <Badge variant="secondary" className="hover:bg-primary/20">
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="relative w-full aspect-[21/9] bg-muted">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <div
                className="prose prose-lg prose-rose max-w-none
                  prose-headings:text-foreground prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-rose-light
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-ul:my-6 prose-ol:my-6
                  prose-li:text-foreground/90 prose-li:my-2
                  prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                  prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-card prose-pre:border prose-pre:border-border
                  prose-img:rounded-xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* FAQ 區塊 */}
              {article.faqJson && article.faqJson.length > 0 && (
                <section className="mt-12 pt-8 border-t border-border/40">
                  <h2 className="text-2xl font-bold text-foreground mb-6">常見問題</h2>
                  <div className="space-y-4">
                    {article.faqJson.map((faq, index) => (
                      <details
                        key={index}
                        className="group rounded-lg border border-border/50 bg-card"
                      >
                        <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-foreground font-medium hover:text-primary transition-colors">
                          <span>{faq.question}</span>
                          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="px-6 pb-4 text-foreground/80 leading-relaxed">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Share & Actions */}
              <div className="mt-12 pt-8 border-t border-border/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">覺得有幫助嗎？</span>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Heart className="h-4 w-4" />
                      喜歡
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    分享文章
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="container mx-auto px-4 py-12 border-t border-border/40">
            <h2 className="text-2xl font-bold text-foreground mb-8">相關文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
