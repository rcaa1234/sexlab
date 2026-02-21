import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Instagram, Facebook } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sexlab.com.tw";

export const metadata: Metadata = {
  title: "聯絡我們",
  description: "與愛愛實驗室團隊聯繫，歡迎合作提案、投稿與讀者回饋。",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">聯絡我們</h1>
            <p className="text-lg text-muted-foreground">歡迎與我們聯繫，我們很樂意聽到你的聲音。</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="grid gap-6">
              <div className="p-6 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">電子郵件</h2>
                </div>
                <p className="text-muted-foreground mb-2">一般合作與投稿請來信：</p>
                <a href="mailto:contact@sexlab.com.tw" className="text-primary hover:underline">
                  contact@sexlab.com.tw
                </a>
              </div>

              <div className="p-6 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <Instagram className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Instagram</h2>
                </div>
                <p className="text-muted-foreground mb-2">追蹤我們獲取最新內容：</p>
                <a href="https://www.instagram.com/sexlab.tw" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @sexlab.tw
                </a>
              </div>

              <div className="p-6 rounded-xl border border-border/50 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <Facebook className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Facebook</h2>
                </div>
                <p className="text-muted-foreground mb-2">加入我們的社群：</p>
                <a href="https://www.facebook.com/sexlab.tw" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  愛愛實驗室
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
