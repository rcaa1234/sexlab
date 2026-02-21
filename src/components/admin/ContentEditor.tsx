"use client";

import { useRef, useCallback } from "react";
import ImageUploader from "./ImageUploader";

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ContentEditor({ value, onChange }: ContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertImage = useCallback((url: string) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const tag = `<img src="${url}" alt="" loading="lazy" />`;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);

    onChange(before + tag + after);

    // 還原游標到插入點後方
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + tag.length;
      ta.setSelectionRange(pos, pos);
    });
  }, [value, onChange]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-foreground">內容 * (HTML)</label>
        <ImageUploader compact onUploadComplete={insertImage} />
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="<h2>標題</h2><p>內容...</p>"
        rows={20}
        className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-sm resize-y"
      />
    </div>
  );
}
