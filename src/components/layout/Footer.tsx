import Link from "next/link";
import { Heart, Mail, Instagram, Facebook } from "lucide-react";

const footerLinks = {
  categories: [
    { label: "愛愛小知識", href: "/category/knowledge" },
    { label: "愛愛小道具", href: "/category/toys" },
    { label: "愛愛小創作", href: "/category/creative" },
  ],
  about: [
    { label: "關於我們", href: "/about" },
    { label: "聯絡我們", href: "/contact" },
    { label: "隱私權政策", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">
                愛愛<span className="text-primary">實驗室</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              愛愛實驗室致力於提供專業、正確的性知識與情趣生活資訊，
              讓每個人都能擁有健康、愉悅的親密關係。
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@sexlab.com.tw"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">文章分類</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">關於</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-border/40">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 愛愛實驗室. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
