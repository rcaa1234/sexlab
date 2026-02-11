import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
            </nav>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            回到前台
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
