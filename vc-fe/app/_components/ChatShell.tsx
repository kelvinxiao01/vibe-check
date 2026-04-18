"use client";

import { useState } from "react";
import { AnalysisReport } from "./AnalysisReport";
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
  const [reportOpen, setReportOpen] = useState(false);

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
    <div className="flex h-dvh flex-col">
      <header className="flex flex-col gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">Dating Coach</h1>
          <ToneSelector value={tone} onChange={setTone} disabled={voiceOpen} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            title="Generate analysis report"
          >
            Analysis report
          </button>
          <button
            type="button"
            onClick={() => setVoiceOpen((v) => !v)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              voiceOpen
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            }`}
          >
            {voiceOpen ? "Stop voice" : "🎙 Start voice"}
          </button>
        </div>
      </header>
      {voiceOpen && (
        <VoicePanel tone={tone} onClose={() => setVoiceOpen(false)} />
      )}
      <MessageList messages={messages} pending={pending} />
      <MessageInput onSend={sendMessage} disabled={pending} />
      {reportOpen && (
        <AnalysisReport
          payload={{ tone, messages }}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
