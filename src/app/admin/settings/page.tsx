"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, CheckCircle2, XCircle } from "lucide-react";

export default function SettingsPage() {
  const [ga4Id, setGa4Id] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings?key=ga4_measurement_id")
      .then((res) => res.json())
      .then((data) => setGa4Id(data.value || ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "ga4_measurement_id", value: ga4Id.trim() }),
      });

      if (!res.ok) throw new Error();
      setMessage({ type: "success", text: "GA4 設定已儲存" });
    } catch {
      setMessage({ type: "error", text: "儲存失敗，請稍後再試" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">網站設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>Google Analytics 4</CardTitle>
          <CardDescription>
            輸入 GA4 Measurement ID 以啟用網站追蹤分析。留空則停用。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Measurement ID
            </label>
            <Input
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="max-w-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              格式：G- 開頭，可在 Google Analytics 管理介面取得
            </p>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 text-sm ${
                message.type === "success" ? "text-green-600" : "text-destructive"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {message.text}
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "儲存中..." : "儲存"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
