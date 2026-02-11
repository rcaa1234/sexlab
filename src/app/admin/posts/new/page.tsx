"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Eye } from "lucide-react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    summary: "",
    content: "",
    featuredImage: "",
    categoryId: "",
    status: "draft",
    faqJson: "[]",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // 自動生成 slug
  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, ""),
    }));
  };

  const handleSubmit = async (publishStatus: string) => {
    if (!form.title || !form.slug || !form.content) {
      alert("標題、slug 和內容為必填");
      return;
    }

    setSaving(true);
    try {
      let parsedFaq;
      try {
        parsedFaq = JSON.parse(form.faqJson);
      } catch {
        alert("FAQ JSON 格式錯誤");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          status: publishStatus,
          categoryId: form.categoryId ? parseInt(form.categoryId) : null,
          faqJson: parsedFaq.length > 0 ? parsedFaq : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "儲存失敗");
        setSaving(false);
        return;
      }

      router.push("/admin");
    } catch {
      alert("儲存失敗");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">新增文章</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            存為草稿
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={saving}>
            <Eye className="h-4 w-4 mr-2" />
            發布
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* 標題 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">標題 *</label>
          <Input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="文章標題"
            className="text-lg"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Slug *</label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="url-slug"
          />
          <p className="text-xs text-muted-foreground mt-1">網址路徑：/post/{form.slug || "..."}</p>
        </div>

        {/* 分類 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">分類</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
          >
            <option value="">未分類</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* 摘要 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">摘要</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="文章摘要（顯示在列表頁）"
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground resize-y"
          />
        </div>

        {/* Summary (SEO) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">SEO 摘要</label>
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="用於搜尋引擎的描述（meta description）"
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground resize-y"
          />
        </div>

        {/* 精選圖片 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">精選圖片網址</label>
          <Input
            value={form.featuredImage}
            onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* 內容 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">內容 * (HTML)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="<h2>標題</h2><p>內容...</p>"
            rows={20}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-sm resize-y"
          />
        </div>

        {/* FAQ JSON */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">FAQ (JSON 格式)</label>
          <textarea
            value={form.faqJson}
            onChange={(e) => setForm({ ...form, faqJson: e.target.value })}
            placeholder={'[{"question": "問題?", "answer": "答案"}]'}
            rows={6}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-sm resize-y"
          />
          <p className="text-xs text-muted-foreground mt-1">
            格式：[{`{"question": "問題?", "answer": "回答"}`}]
          </p>
        </div>
      </div>
    </div>
  );
}
