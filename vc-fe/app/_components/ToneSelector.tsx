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
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "bg-foreground text-background"
                : "border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
