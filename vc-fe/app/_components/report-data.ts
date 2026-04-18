import type { ChatMessage, Tone } from "./types";

export type ReportPayload = {
  tone: Tone;
  messages: ChatMessage[];
};

export type ReportData = {
  archetype: string;
  summary: string;
  scores: { label: string; value: number; color: string }[];
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
};

const FALLBACK_MESSAGES: ChatMessage[] = [
  {
    role: "user",
    content:
      "I really like them but I feel like I might be coming on too strong. They keep replying short.",
  },
  {
    role: "assistant",
    content:
      "That usually points to an energy mismatch. Try slowing your pace and matching their message length.",
  },
];

export function buildReport(payload?: Partial<ReportPayload>): ReportData {
  const tone = payload?.tone ?? "supportive";
  const messages =
    payload?.messages && payload.messages.length > 0
      ? payload.messages
      : FALLBACK_MESSAGES;

  const userMessages = messages.filter((message) => message.role === "user");
  const assistantMessages = messages.filter(
    (message) => message.role === "assistant",
  );
  const userText = userMessages.map((message) => message.content).join(" ");
  const totalUserLength = userMessages.reduce(
    (sum, message) => sum + message.content.length,
    0,
  );
  const totalAssistantLength = assistantMessages.reduce(
    (sum, message) => sum + message.content.length,
    0,
  );

  const exclamations = (userText.match(/!/g) ?? []).length;
  const questions = (userText.match(/\?/g) ?? []).length;
  const futurePlans = (
    userText.match(/\b(date|trip|travel|future|weekend|together|visit)\b/gi) ??
    []
  ).length;
  const concernWords = (
    userText.match(
      /\b(anxious|worried|confused|overthink|strong|too much|clingy|double text)\b/gi,
    ) ?? []
  ).length;
  const emojiCount = (
    userText.match(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,
    ) ?? []
  ).length;

  const youShare = Math.max(
    30,
    Math.min(
      82,
      Math.round(
        (totalUserLength / Math.max(totalUserLength + totalAssistantLength, 1)) *
          100,
      ),
    ),
  );
  const themShare = 100 - youShare;
  const intrigue = clamp(8 - futurePlans - Math.floor(concernWords / 2), 2, 9);
  const reciprocity = clamp(10 - Math.floor((youShare - 50) / 8), 2, 9);
  const emotionalBalance = clamp(
    9 - exclamations - futurePlans - Math.floor(concernWords / 2),
    2,
    9,
  );
  const interestLevel = clamp(
    5 + Math.min(questions, 2) + Math.min(emojiCount, 2),
    4,
    9,
  );

  const highEnergy = exclamations >= 2 || emojiCount >= 2 || youShare >= 65;
  const lowBalance = emotionalBalance <= 4 || reciprocity <= 4;
  const archetype = highEnergy
    ? "High Energy Over-Investor"
    : lowBalance
      ? "Uneven Pursuer"
      : "Warm But Recoverable";

  const summary = highEnergy
    ? "You are carrying most of the emotional momentum right now. The energy is warm and sincere, but it risks reading as over-invested if the other person is staying shorter, flatter, or more reactive."
    : "The chat has potential, but the pacing feels slightly uneven. A little more restraint and tighter message sizing would make your interest land with more confidence.";

  const firstUserMessage =
    userMessages[userMessages.length - 1]?.content ??
    "I really want to hang out soon and I hope I'm not being too much.";
  const softenedRewrite = rewriteMessage(firstUserMessage);

  const description =
    youShare >= 65
      ? "You are doing most of the driving. Your messages are longer and more emotionally loaded, which can create pressure if the other person is still warming up."
      : "The conversation is closer to balanced, but you still have room to leave more space and let curiosity build.";

  const risks = [
    "Overwhelming the other person with more energy than they are giving back.",
    "Accidentally turning anxiety into extra follow-ups or over-explaining.",
    "Reducing intrigue by trying to secure certainty too early.",
  ];

  const keyPatterns = [
    youShare >= 65
      ? "You are carrying a bigger share of the conversation than they are."
      : "Your side still sets the pace a bit more than theirs.",
    futurePlans > 0
      ? "You are leaning toward future pacing or plan-making before the vibe is fully settled."
      : "Your concern sounds more about interpretation than logistics, which is fixable.",
    questions === 0
      ? "There may be more explaining than inviting, which lowers back-and-forth energy."
      : "Questions are helping, but the overall tone still benefits from more restraint.",
    concernWords > 0
      ? "Your wording hints at self-monitoring, which can leak nervous energy into the chat."
      : "The main opportunity is less about content and more about timing and compression.",
  ];

  const nextSteps = [
    {
      label: "Balanced",
      text: "Match their message length and tone for the next one or two turns so the chat can breathe.",
    },
    {
      label: "Pull-Back",
      text: "Avoid stacking more reassurance, compliments, or future plans until they re-engage with clearer effort.",
    },
    {
      label: "Direct",
      text: "Send one clean reply, then let silence do some work instead of trying to rescue the vibe in real time.",
    },
  ];

  const trajectoryTitle =
    reciprocity <= 4 ? "At Risk Of Fading" : "Still Recoverable";
  const confidence =
    reciprocity <= 4 ? "72% confidence" : "58% confidence";

  const tarotCard =
    tone === "playful"
      ? "The Fool"
      : tone === "analytical"
        ? "Justice"
        : tone === "blunt"
          ? "The Tower"
          : "The Star";

  return {
    archetype,
    summary,
    scores: [
      { label: "Interest Level", value: interestLevel, color: "bg-emerald-600" },
      { label: "Reciprocity", value: reciprocity, color: "bg-amber-600" },
      { label: "Intrigue", value: intrigue, color: "bg-orange-500" },
      {
        label: "Emotional Balance",
        value: emotionalBalance,
        color: "bg-rose-600",
      },
    ],
    investment: {
      you: youShare,
      them: themShare,
      description,
    },
    keyPatterns,
    risks,
    rewrite: {
      original: firstUserMessage,
      improved: softenedRewrite,
      why: "This version keeps the interest but removes pressure, urgency, and any trace of chasing energy.",
    },
    nextSteps,
    trajectory: {
      title: trajectoryTitle,
      confidence,
      drivers: [
        "Your side is investing more emotional energy than theirs.",
        "The pacing may be too eager for the current level of reciprocity.",
        "Your strongest move now is restraint, not more convincing.",
      ],
      improve: [
        "Let the next reply be shorter and easier to answer.",
        "Leave room for them to initiate or add substance.",
        "Keep plans local, light, and low-pressure until consistency improves.",
      ],
    },
    tarot: {
      card: tarotCard,
      meaning:
        tarotCard === "The Tower"
          ? "A signal to stop forcing structure and let weak dynamics reveal themselves fast."
          : tarotCard === "Justice"
            ? "A reminder that the energy should feel mutual, not argued into balance."
            : tarotCard === "The Fool"
              ? "A playful nudge to stay curious without sprinting toward certainty."
              : "A soft sign that steadier pacing gives this connection its best chance.",
      prediction:
        "If you slow the pace and stop over-explaining, the vibe gets clearer within the next few exchanges.",
    },
  };
}

function rewriteMessage(message: string) {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "That sounds fun. We should do something low-key soon.";
  }

  let improved = cleaned
    .replace(/\bI really\b/gi, "I")
    .replace(/\bso much\b/gi, "")
    .replace(/\bhope\b/gi, "think")
    .replace(/!+/g, ".")
    .replace(/\?+/g, "?");

  if (!/[.?!]$/.test(improved)) {
    improved = `${improved}.`;
  }

  if (improved.length > 120) {
    improved = `${improved.slice(0, 117).trimEnd()}...`;
  }

  return improved;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
