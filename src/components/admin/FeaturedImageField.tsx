"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface FeaturedImageFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export default function FeaturedImageField({ value, onChange }: FeaturedImageFieldProps) {
  const [showManual, setShowManual] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">精選圖片</label>

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="精選圖片預覽" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <ImageUploader onUploadComplete={onChange} />
      )}

      <button
        type="button"
        onClick={() => setShowManual(!showManual)}
        className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showManual ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        手動輸入網址
      </button>

      {showManual && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="mt-1"
        />
      )}
    </div>
  );
}
