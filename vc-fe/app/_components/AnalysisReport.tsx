"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  buildReport,
  type ReportData,
  type ReportPayload,
} from "./report-data";

const CARD_CLASS =
  "rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]";

export function AnalysisReport() {
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem("vibe-check-report");
    if (!raw) {
      setReport(buildReport());
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ReportPayload>;
      setReport(buildReport(parsed));
    } catch {
      setReport(buildReport());
    }
  }, []);

  if (!report) {
    return null;
  }

  return (
    <main className="min-h-dvh bg-[#f6f3ee] px-4 py-6 text-zinc-900">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3 px-1">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← Back
          </Link>
          <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Analysis Report
          </div>
        </header>

        <section className={CARD_CLASS}>
          <div className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {report.archetype}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
            Perception Summary
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            {report.summary}
          </p>
        </section>

        <section className={CARD_CLASS}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Signal Scores
          </h2>
          <div className="mt-5 space-y-4">
            {report.scores.map((score) => (
              <div key={score.label}>
                <div className="mb-1 flex items-center justify-between text-sm font-medium">
                  <span>{score.label}</span>
                  <span>{score.value}/10</span>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-200">
                  <div
                    className={`h-full rounded-full ${score.color}`}
                    style={{ width: `${score.value * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={CARD_CLASS}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Investment Balance
          </h2>
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
            <span>You · {report.investment.you}%</span>
            <span>{report.investment.them}% · Them</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full bg-zinc-700"
              style={{ width: `${report.investment.you}%` }}
            />
          </div>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            {report.investment.description}
          </p>
        </section>

        <InfoListCard title="Key Patterns" items={report.keyPatterns} />
        <InfoListCard title="Risks" items={report.risks} bulletColor="bg-rose-400" />

        <section className={CARD_CLASS}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Rewrite A Message
          </h2>
          <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Original
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {report.rewrite.original}
            </p>
          </div>
          <div className="mt-3 rounded-2xl border border-black/8 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Improved
            </div>
            <p className="mt-2 text-base leading-7">{report.rewrite.improved}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-500">
            <span className="font-semibold text-zinc-700">Why:</span>{" "}
            {report.rewrite.why}
          </p>
        </section>

        <section className={CARD_CLASS}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
            What To Do Next
          </h2>
          <div className="mt-4 space-y-3">
            {report.nextSteps.map((step) => (
              <article
                key={step.label}
                className="rounded-2xl border border-black/8 bg-white p-4"
              >
                <div className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  {step.label}
                </div>
                <p className="mt-3 text-base leading-7">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={CARD_CLASS}>
          <div className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
            Long-Term Trajectory
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold">
              {report.trajectory.title}
            </div>
            <div className="text-sm text-zinc-500">
              {report.trajectory.confidence}
            </div>
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Key Drivers
            </h3>
            <ul className="mt-3 space-y-2 text-base leading-7 text-zinc-600">
              {report.trajectory.drivers.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
              What Would Improve The Odds
            </h3>
            <ul className="mt-3 space-y-2 text-base leading-7 text-zinc-600">
              {report.trajectory.improve.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-[28px] bg-gradient-to-br from-[#1f1726] via-[#2e1a2a] to-[#4a2133] p-6 text-white shadow-[0_18px_40px_rgba(37,18,35,0.28)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">
            Tarot-ish Vibe Forecast
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                {report.tarot.card}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                {report.tarot.meaning}
              </p>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
              Playful
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-white/8 p-4 text-base leading-7 text-white/90">
            {report.tarot.prediction}
          </p>
        </section>
      </div>
    </main>
  );
}

function InfoListCard({
  title,
  items,
  bulletColor = "bg-zinc-400",
}: {
  title: string;
  items: string[];
  bulletColor?: string;
}) {
  return (
    <section className={CARD_CLASS}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </h2>
      <ul className="mt-4 space-y-3 text-base leading-7 text-zinc-600">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className={`mt-3 h-1.5 w-1.5 rounded-full ${bulletColor}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
