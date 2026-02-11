"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  category: { name: string; slug: string } | null;
}

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${p}&perPage=20`);
      const data = await res.json();
      setPosts(data.posts);
      setTotal(data.total);
    } catch {
      console.error("Failed to fetch posts");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm("確定要刪除這篇文章嗎？")) return;
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      fetchPosts(page);
    } catch {
      alert("刪除失敗");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">文章管理</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {total} 篇文章</p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            新增文章
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">載入中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">尚無文章</p>
          <Link href="/admin/posts/new">
            <Button>建立第一篇文章</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">標題</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">分類</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">狀態</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">日期</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{post.title}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">/{post.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {post.category?.name || "未分類"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status === "published" ? "已發布" : "草稿"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString("zh-TW")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/post/${post.slug}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            上一頁
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            第 {page} 頁
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page * 20 >= total}
            onClick={() => setPage(page + 1)}
          >
            下一頁
          </Button>
        </div>
      )}
    </div>
  );
}
