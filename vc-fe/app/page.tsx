import { ChatShell } from "./_components/ChatShell";

const readinessCards = [
  {
    label: "Profile strength",
    value: "82%",
    note: "Photos and bio are landing well; prompt answers still read a little safe.",
  },
  {
    label: "Reply momentum",
    value: "4.6h",
    note: "Average time between your last reply and theirs across active chats.",
  },
  {
    label: "First-date conversion",
    value: "31%",
    note: "Strong enough to scale. Best lift likely comes from sharper call-to-action messages.",
  },
];

const coachingFeed = [
  {
    title: "Sharpen your opener pattern",
    body: "Your strongest openers lead with a specific observation, then pivot into a playful question. Keep that rhythm.",
  },
  {
    title: "Audit your screenshot flow",
    body: "Use the coach panel to upload a conversation screenshot and get line-by-line feedback before you send the next reply.",
  },
  {
    title: "Voice sessions are best for rehearsals",
    body: "Practice the actual message you want to send out loud, then tighten it down into a text version.",
  },
];

const activeTracks = [
  "Conversation rescue",
  "Profile rewrite",
  "Date planning",
  "Confidence practice",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section
        data-panel
        className="relative overflow-hidden rounded-[2rem] px-6 py-6 sm:px-8 sm:py-8"
      >
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(31,122,90,0.16),transparent_58%)] lg:block" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-white/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
              Vibe Check Dashboard
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              A coaching webapp for better matches, cleaner conversations, and faster course-correction.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Keep your profile quality, reply timing, and live coaching in one place so the app feels like a product, not just a chat box.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[30rem] lg:grid-cols-1">
            <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
              <div className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Focus this week
              </div>
              <div className="mt-2 text-lg font-semibold">
                Turn more warm chats into date plans.
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4">
              <div className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Best workflow
              </div>
              <div className="mt-2 text-lg font-semibold">
                Screenshot review, then message polish, then voice rehearsal.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            {readinessCards.map((card) => (
              <article
                key={card.label}
                data-panel
                className="rounded-[1.6rem] px-5 py-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  {card.label}
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {card.note}
                </p>
              </article>
            ))}
          </div>

          <div
            data-panel
            className="rounded-[1.8rem] px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Coaching priorities
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  Where the app should guide the user next
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                These are lightweight placeholder insights for now, but they create the right dashboard shape for future backend data.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {coachingFeed.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4"
                >
                  <h3 className="text-lg font-semibold tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <div
            data-panel
            className="rounded-[1.8rem] px-5 py-5 sm:px-6 sm:py-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Active tracks
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  Coaching lanes
                </h2>
              </div>
              <div className="rounded-full bg-[rgba(31,122,90,0.12)] px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                Live
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {activeTracks.map((track, index) => (
                <div
                  key={track}
                  className="flex items-center justify-between rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      Track {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{track}</p>
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--warm)]" />
                </div>
              ))}
            </div>
          </div>

          <ChatShell />
        </aside>
      </section>
    </main>
  );
}
