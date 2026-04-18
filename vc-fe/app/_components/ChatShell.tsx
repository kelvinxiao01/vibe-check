"use client";

import { useState } from "react";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { ToneSelector } from "./ToneSelector";
import { VoicePanel } from "./VoicePanel";
import { BACKEND_URL, type ChatMessage, type Tone } from "./types";

export function ChatShell() {
  const [tone, setTone] = useState<Tone>("blunt");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  async function sendMessage(text: string, image: File | null) {
    const previewUrl = image ? URL.createObjectURL(image) : undefined;
    const userMsg: ChatMessage = {
      role: "user",
      content: text || (image ? "(screenshot)" : ""),
      imagePreview: previewUrl,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setPending(true);

    try {
      const form = new FormData();
      form.append(
        "messages",
        JSON.stringify(
          nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ),
      );
      form.append("tone", tone);
      if (image) form.append("image", image);

      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "request failed"}`,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      data-panel
      className="flex min-h-[44rem] flex-col overflow-hidden rounded-[1.8rem]"
    >
      <header className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                Coach console
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                Ask for rewrites, screenshot reads, or strategy help
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setVoiceOpen((v) => !v)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                voiceOpen
                  ? "bg-[var(--accent-strong)] text-white"
                  : "border border-[var(--border)] bg-white/50 hover:bg-white/70"
              }`}
            >
              {voiceOpen ? "Stop voice mode" : "Start voice mode"}
            </button>
          </div>
          <ToneSelector value={tone} onChange={setTone} disabled={voiceOpen} />
        </div>
      </header>
      {voiceOpen && (
        <VoicePanel tone={tone} onClose={() => setVoiceOpen(false)} />
      )}
      <MessageList messages={messages} pending={pending} />
      <MessageInput onSend={sendMessage} disabled={pending} />
    </section>
  );
}
