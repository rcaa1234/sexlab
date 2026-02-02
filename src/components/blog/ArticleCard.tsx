import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  category: {
    name: string;
    slug: string;
  };
  tags?: { name: string; slug: string }[];
  date: string;
  readingTime?: number;
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  if (featured) {
    return (
      <Link href={`/post/${article.slug}`}>
        <Card className="group overflow-hidden border-border/50 bg-card card-hover">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
              {article.featuredImage ? (
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-6xl opacity-20">💕</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent md:hidden" />
            </div>

            {/* Content */}
            <CardContent className="p-6 md:p-8 flex flex-col justify-center">
              <Badge
                variant="secondary"
                className="w-fit mb-4 bg-primary/10 text-primary hover:bg-primary/20"
              >
                {article.category.name}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {article.date}
                </span>
                {article.readingTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {article.readingTime} 分鐘
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                閱讀更多 <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/post/${article.slug}`}>
      <Card className="group h-full overflow-hidden border-border/50 bg-card card-hover">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-4xl opacity-20">💕</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90"
            >
              {article.category.name}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {article.date}
            </span>
            {article.readingTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.readingTime} 分鐘
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
