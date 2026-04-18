"use client";

import { useEffect, useMemo, useRef } from "react";
import { TokenSource, type TokenSourceResponseObject } from "livekit-client";
import {
  BarVisualizer,
  RoomAudioRenderer,
  SessionProvider,
  useAgent,
  useSession,
  VoiceAssistantControlBar,
} from "@livekit/components-react";
import { BACKEND_URL, type Tone } from "./types";

type Props = {
  tone: Tone;
  onClose: () => void;
};

export function VoicePanel({ tone, onClose }: Props) {
  const tokenSource = useMemo(
    () =>
      TokenSource.literal(
        async (): Promise<TokenSourceResponseObject> => {
          const res = await fetch(`${BACKEND_URL}/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tone }),
          });
          if (!res.ok) throw new Error(`token fetch failed: ${res.status}`);
          return res.json();
        },
      ),
    [tone],
  );

  const session = useSession(tokenSource);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    if (session.connectionState !== "disconnected") return;
    startedRef.current = true;
    session.start().catch((err) => {
      console.error("session start failed", err);
      startedRef.current = false;
    });
  }, [session]);

  useEffect(() => {
    return () => {
      session.end().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SessionProvider session={session}>
      <div
        data-lk-theme="default"
        className="flex flex-col items-center gap-4 border-b border-[var(--border)] bg-[rgba(31,122,90,0.06)] px-5 py-6"
      >
        <VoiceStatus />
        <VoiceAssistantControlBar />
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]"
        >
          End voice session
        </button>
        <RoomAudioRenderer />
      </div>
    </SessionProvider>
  );
}

function VoiceStatus() {
  const agent = useAgent();
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        {agent.state}
      </div>
      <div className="h-16 w-full">
        <BarVisualizer
          state={agent.state}
          track={agent.microphoneTrack}
          barCount={7}
        />
      </div>
    </div>
  );
}
