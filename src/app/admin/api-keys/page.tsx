"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Copy, Check } from "lucide-react";

interface ApiKey {
  id: number;
  name: string;
  prefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  // 建立後顯示完整 key 的彈窗
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch {
      console.error("Failed to fetch API keys");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewKey(data.key);
        setName("");
        fetchKeys();
      } else {
        alert(data.error || "建立失敗");
      }
    } catch {
      alert("建立失敗");
    }
    setCreating(false);
  };

  const handleDisable = async (id: number) => {
    if (!confirm("確定要停用此 API Key 嗎？停用後無法恢復。")) return;
    try {
      await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
      fetchKeys();
    } catch {
      alert("停用失敗");
    }
  };

  const handleCopy = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Key 管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理用於 API 存取的金鑰
          </p>
        </div>
      </div>

      {/* 建立新 Key */}
      <div className="border border-border rounded-lg p-4 mb-6">
        <h2 className="text-sm font-medium text-foreground mb-3">建立新的 API Key</h2>
        <div className="flex gap-3">
          <Input
            placeholder="API Key 名稱（例：AI Agent 用）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="max-w-md"
          />
          <Button onClick={handleCreate} disabled={creating || !name.trim()} className="gap-2">
            <Plus className="h-4 w-4" />
            建立
          </Button>
        </div>
      </div>

      {/* Key 列表 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">載入中...</div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">尚未建立任何 API Key</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">名稱</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">前綴</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">狀態</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">建立時間</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">最後使用</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{key.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                    {key.prefix}...
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={key.isActive ? "default" : "secondary"}>
                      {key.isActive ? "啟用" : "已停用"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(key.createdAt).toLocaleDateString("zh-TW")}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleDateString("zh-TW")
                      : "從未使用"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      {key.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDisable(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 建立成功彈窗 */}
      <Dialog open={!!newKey} onOpenChange={(open) => { if (!open) { setNewKey(null); setCopied(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key 已建立</DialogTitle>
            <DialogDescription>
              請立即複製此 Key，關閉後將無法再次查看。
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-3 font-mono text-sm break-all select-all">
            {newKey}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "已複製" : "複製"}
            </Button>
            <Button onClick={() => { setNewKey(null); setCopied(false); }}>
              確認已複製，關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
