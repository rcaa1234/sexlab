import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPost, getPosts, type TransformedPost } from "@/lib/db";
import { Calendar, Clock, ArrowLeft, Share2, Heart, ChevronDown } from "lucide-react";
import { ArticleCard } from "@/components/blog";
import { ArticleJsonLd } from "@/components/seo/JsonLd";

// 每 60 秒重新生成頁面（ISR）
export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sexlab.com.tw";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// 生成靜態頁面
export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ perPage: 100 });
    return posts.map((post: TransformedPost) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

// 動態生成 SEO metadata
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
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
  } catch {
    return { title: "找不到文章" };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // 從資料庫取得文章
  let article: TransformedPost | null = null;
  let relatedArticles: TransformedPost[] = [];

  try {
    article = await getPost(slug);
    if (article) {
      const { posts } = await getPosts({ perPage: 4 });
      relatedArticles = posts
        .filter((p: TransformedPost) => p.slug !== slug)
        .slice(0, 3);
    }
  } catch {
    console.log("Database unavailable, using mock data");
  }

  // 找不到文章 → 404
  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* JSON-LD 結構化資料 */}
      <ArticleJsonLd
        title={article.title}
        description={article.summary || article.excerpt}
        url={`${siteUrl}/post/${article.slug}`}
        image={article.featuredImage || undefined}
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
                    {article.faqJson.map((faq: { question: string; answer: string }, index: number) => (
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
              {relatedArticles.map((related: TransformedPost) => (
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
