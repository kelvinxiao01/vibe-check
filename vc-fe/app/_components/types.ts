export type Tone = "blunt" | "supportive" | "playful" | "analytical";

export const TONES: { id: Tone; label: string }[] = [
  { id: "blunt", label: "Blunt" },
  { id: "supportive", label: "Supportive" },
  { id: "playful", label: "Playful" },
  { id: "analytical", label: "Analytical" },
];

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
};

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
