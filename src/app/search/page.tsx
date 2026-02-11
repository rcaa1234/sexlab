"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { ArticleCard, Article } from "@/components/blog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2 } from "lucide-react";

// 示範用標籤
const popularTags = [
  "高潮", "前戲", "G點", "按摩棒", "潤滑液", "BDSM", "情趣用品", "技巧"
];

// 示範用文章（實際會從 API 取得）
const mockArticles: Article[] = [
  {
    id: 1,
    slug: "exploring-g-spot",
    title: "探索 G 點高潮：完整指南與實用技巧",
    excerpt: "G 點是許多人好奇但又不太了解的區域。這篇文章將帶你深入了解 G 點的位置、刺激方式。",
    category: { name: "愛愛小知識", slug: "knowledge" },
    date: "2024年1月15日",
    readingTime: 8,
  },
  {
    id: 2,
    slug: "best-vibrators-2024",
    title: "2024 年最推薦的按摩棒評測",
    excerpt: "我們實測了市面上最熱門的 10 款按摩棒，從震動模式、材質安全性到實際使用體驗。",
    category: { name: "愛愛小道具", slug: "toys" },
    date: "2024年1月10日",
    readingTime: 12,
  },
  {
    id: 3,
    slug: "foreplay-guide",
    title: "前戲的藝術：讓愛愛更有感覺的秘訣",
    excerpt: "好的前戲是美好性愛的關鍵。學習如何透過觸摸、親吻和言語，創造更深層的連結。",
    category: { name: "愛愛小知識", slug: "knowledge" },
    date: "2024年1月8日",
    readingTime: 6,
  },
  {
    id: 4,
    slug: "bdsm-beginners",
    title: "BDSM 入門：安全探索情趣新世界",
    excerpt: "對 BDSM 感到好奇？這篇文章將介紹基礎概念、安全原則，以及如何與伴侶溝通。",
    category: { name: "愛愛小知識", slug: "knowledge" },
    date: "2024年1月5日",
    readingTime: 10,
  },
  {
    id: 5,
    slug: "lubricant-guide",
    title: "潤滑液選購指南：水性、矽性、油性怎麼選？",
    excerpt: "潤滑液是提升性愛體驗的好幫手，但市面上種類繁多。了解不同類型的特性。",
    category: { name: "愛愛小道具", slug: "toys" },
    date: "2024年1月3日",
    readingTime: 7,
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.posts.length > 0) {
          setResults(data.posts);
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.log("Search API failed, using mock data");
    }

    const filtered = mockArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    performSearch(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
    performSearch(tag);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    router.push("/search");
  };

  return (
    <main className="flex-1">
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            搜尋文章
          </h1>

          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="輸入關鍵字搜尋..."
                className="pl-12 pr-12 py-6 text-lg bg-card border-border focus:border-primary"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">熱門搜尋：</p>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">搜尋中...</span>
          </div>
        ) : hasSearched ? (
          <>
            <p className="text-muted-foreground mb-8">
              找到 <span className="text-foreground font-medium">{results.length}</span> 篇關於「
              <span className="text-primary">{initialQuery}</span>」的文章
            </p>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">沒有找到相關文章</p>
                <p className="text-muted-foreground mb-6">試試其他關鍵字或瀏覽熱門標籤</p>
                <Button variant="outline" onClick={clearSearch}>
                  清除搜尋
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">輸入關鍵字開始搜尋</p>
          </div>
        )}
      </section>
    </main>
  );
}

function SearchLoading() {
  return (
    <main className="flex-1">
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="h-10 w-48 bg-muted animate-pulse rounded mb-6" />
          <div className="h-14 max-w-2xl bg-muted animate-pulse rounded" />
        </div>
      </section>
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
