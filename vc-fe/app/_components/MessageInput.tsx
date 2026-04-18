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
    <div className="border-t border-[var(--border)] bg-[var(--surface-strong)] px-5 py-4 sm:px-6">
      {previewUrl && (
        <div className="mb-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="preview"
            className="h-16 w-16 rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={() => pickImage(null)}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]"
          >
            Remove image
          </button>
        </div>
      )}
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="shrink-0 rounded-full border border-[var(--border)] bg-white/65 p-3 text-sm hover:bg-white disabled:opacity-50"
          aria-label="Attach image"
          title="Attach image"
        >
          +
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
          rows={3}
          placeholder="Ask about a conversation, a match, or your strategy…"
          className="min-h-[5.5rem] flex-1 resize-none rounded-[1.4rem] border border-[var(--border)] bg-white/75 px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[rgba(31,122,90,0.25)] disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !image)}
          className="shrink-0 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
