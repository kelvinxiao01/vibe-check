"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "./types";

type Props = {
  messages: ChatMessage[];
  pending: boolean;
};

export function MessageList({ messages, pending }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  if (messages.length === 0 && !pending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div className="rounded-full bg-[rgba(31,122,90,0.1)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-strong)]">
          Ready for review
        </div>
        <div className="max-w-sm">
          <p className="text-lg font-semibold tracking-[-0.03em]">
            Drop in a message, a screenshot, or start a voice rehearsal.
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The coach will help tighten your tone, spot weak moments, and give you a clearer next move.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-[var(--accent-strong)] text-white"
                : "border border-[var(--border)] bg-[var(--surface-strong)]"
            }`}
          >
            {msg.imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={msg.imagePreview}
                alt="attached"
                className="mb-3 max-h-64 rounded-xl"
              />
            )}
            {msg.content}
          </div>
        </div>
      ))}
      {pending && (
        <div className="flex justify-start">
          <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Coach is thinking
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
