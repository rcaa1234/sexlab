"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ role?: string; avatar?: string; name?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold text-foreground">
              管理後台
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                文章列表
              </Link>
              <Link href="/admin/posts/new" className="text-muted-foreground hover:text-foreground transition-colors">
                新增文章
              </Link>
              <Link href="/admin/api-keys" className="text-muted-foreground hover:text-foreground transition-colors">
                API Keys
              </Link>
              {isAdmin && (
                <>
                  <Link href="/admin/users" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    使用者
                  </Link>
                  <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Settings className="h-3.5 w-3.5" />
                    設定
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user?.avatar && (
              <img src={user.avatar} alt="" className="h-7 w-7 rounded-full" />
            )}
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              回到前台
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground gap-1.5">
              <LogOut className="h-4 w-4" />
              登出
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
