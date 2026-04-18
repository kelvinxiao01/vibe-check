import type { ChatMessage, Tone } from "./types";

export type ReportPayload = {
  tone: Tone;
  messages: ChatMessage[];
};

export type ReportData = {
  archetype: string;
  summary: string;
  scores: { label: string; value: number }[];
  investment: { you: number; them: number; description: string };
  keyPatterns: string[];
  risks: string[];
  rewrite: { original: string; improved: string; why: string };
  nextSteps: { label: string; text: string }[];
  trajectory: {
    title: string;
    confidence: string;
    drivers: string[];
    improve: string[];
  };
  tarot: { card: string; meaning: string; prediction: string };
  meta?: {
    memoryItems: number;
    currentUserMessages: number;
    memorySamples: string[];
  };
};

export const SCORE_COLORS: Record<string, string> = {
  "Interest Level": "bg-emerald-600",
  Reciprocity: "bg-amber-600",
  Intrigue: "bg-orange-500",
  "Emotional Balance": "bg-rose-600",
};

export const DEFAULT_SCORE_COLOR = "bg-zinc-500";
