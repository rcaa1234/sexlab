import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sexlab.com.tw";

export const metadata: Metadata = {
  title: "關於我們",
  description: "愛愛實驗室致力於提供專業、正確的性知識與情趣生活資訊，讓每個人都能擁有健康、愉悅的親密關係。",
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首頁
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">關於愛愛實驗室</h1>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto prose prose-lg prose-rose">
            <p className="text-lg text-muted-foreground leading-relaxed">
              愛愛實驗室是一個專注於性知識教育與情趣生活分享的平台。我們相信，正確的性知識是每個人都應該擁有的基本權利。
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">我們的使命</h2>
            <p className="text-foreground/80 leading-relaxed">
              打破華人社會對「性」的禁忌與迷思，以科學、專業、輕鬆的角度，提供正確的性知識與情趣生活資訊，幫助每個人建立健康、愉悅的親密關係。
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">我們提供什麼</h2>
            <ul className="space-y-3 text-foreground/80">
              <li><strong>愛愛小知識</strong> — 專業的性知識文章，涵蓋技巧、健康與關係經營</li>
              <li><strong>愛愛小道具</strong> — 情趣用品的真實評測與選購建議</li>
              <li><strong>愛愛小創作</strong> — 創意內容與故事，為親密生活帶來更多靈感</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">聯絡我們</h2>
            <p className="text-foreground/80 leading-relaxed">
              如果你有任何問題、合作提案或投稿意願，歡迎透過以下方式聯繫我們：
            </p>
            <ul className="space-y-2 text-foreground/80">
              <li>Email：<a href="mailto:contact@sexlab.com.tw" className="text-primary hover:underline">contact@sexlab.com.tw</a></li>
              <li>Instagram：<a href="https://www.instagram.com/sexlab.tw" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@sexlab.tw</a></li>
              <li>Facebook：<a href="https://www.facebook.com/sexlab.tw" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">愛愛實驗室</a></li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
