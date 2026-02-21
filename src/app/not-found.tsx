import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-8xl font-bold text-primary/20 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-4">找不到此頁面</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            你要找的頁面可能已被移除、名稱已變更，或暫時無法使用。
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Home className="h-4 w-4" />
              返回首頁
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
