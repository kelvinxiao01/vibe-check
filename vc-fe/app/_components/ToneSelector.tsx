"use client";

import { TONES, type Tone } from "./types";

type Props = {
  value: Tone;
  onChange: (tone: Tone) => void;
  disabled?: boolean;
};

export function ToneSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {TONES.map(({ id, label }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "border border-[var(--border)] bg-white/45 text-[var(--muted)] hover:bg-white/70"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
