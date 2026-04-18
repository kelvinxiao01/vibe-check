"use client";

import { useRef, useState } from "react";

type Props = {
  onSend: (text: string, image: File | null) => Promise<void> | void;
  disabled?: boolean;
};

export function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickImage(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && !image) return;
    const snapshotText = trimmed;
    const snapshotImage = image;
    setText("");
    pickImage(null);
    await onSend(snapshotText, snapshotImage);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="border-t border-black/10 bg-background px-4 py-3 dark:border-white/10">
      {previewUrl && (
        <div className="mb-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="preview"
            className="h-14 w-14 rounded-md object-cover"
          />
          <button
            type="button"
            onClick={() => pickImage(null)}
            className="text-xs text-zinc-500 underline"
          >
            remove
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="shrink-0 rounded-full border border-black/10 p-2 text-sm hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
          aria-label="Attach image"
          title="Attach image"
        >
          📎
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Ask about a conversation, a match, or your strategy…"
          className="flex-1 resize-none rounded-2xl border border-black/10 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 dark:border-white/15"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !image)}
          className="shrink-0 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
