import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sexlab.com.tw";

export const metadata: Metadata = {
  title: "隱私權政策",
  description: "愛愛實驗室的隱私權政策，說明我們如何收集、使用與保護您的個人資料。",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">隱私權政策</h1>
            <p className="text-lg text-muted-foreground">最後更新日期：2025 年 2 月</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto prose prose-lg prose-rose">
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">一、資料收集</h2>
            <p className="text-foreground/80 leading-relaxed">
              愛愛實驗室（以下簡稱「本站」）可能透過以下方式收集您的資料：
            </p>
            <ul className="space-y-2 text-foreground/80">
              <li>您主動提供的資訊（如電子郵件訂閱）</li>
              <li>瀏覽器自動傳送的資訊（如 IP 位址、瀏覽器類型）</li>
              <li>透過 Cookie 和分析工具收集的匿名使用數據</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">二、資料使用</h2>
            <p className="text-foreground/80 leading-relaxed">
              我們收集的資料僅用於以下目的：
            </p>
            <ul className="space-y-2 text-foreground/80">
              <li>改善網站內容與使用者體驗</li>
              <li>發送您訂閱的電子報或通知</li>
              <li>分析網站流量與使用趨勢</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">三、Cookie 使用</h2>
            <p className="text-foreground/80 leading-relaxed">
              本站使用 Cookie 來提供更好的瀏覽體驗。我們使用 Google Analytics 來分析網站使用狀況。您可以在瀏覽器設定中選擇停用 Cookie。
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">四、第三方服務</h2>
            <p className="text-foreground/80 leading-relaxed">
              本站可能包含第三方網站的連結。當您離開本站前往其他網站時，請注意該網站有其自身的隱私權政策，本站不對其內容負責。
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">五、資料保護</h2>
            <p className="text-foreground/80 leading-relaxed">
              我們採取合理的技術與管理措施來保護您的個人資料安全。但請注意，網路傳輸無法保證百分之百安全。
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">六、聯絡方式</h2>
            <p className="text-foreground/80 leading-relaxed">
              如果您對本隱私權政策有任何疑問，請透過 <a href="mailto:contact@sexlab.com.tw" className="text-primary hover:underline">contact@sexlab.com.tw</a> 與我們聯繫。
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
