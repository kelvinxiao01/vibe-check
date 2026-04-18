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
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        Send a message, attach a dating-app screenshot, or hit the mic.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-foreground text-background"
                : "bg-black/5 dark:bg-white/10"
            }`}
          >
            {msg.imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={msg.imagePreview}
                alt="attached"
                className="mb-2 max-h-64 rounded-lg"
              />
            )}
            {msg.content}
          </div>
        </div>
      ))}
      {pending && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-black/5 px-4 py-2.5 text-sm text-zinc-500 dark:bg-white/10">
            thinking…
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
