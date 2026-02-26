"use client";

import { Response } from "@/lib/types";
import { useMemo } from "react";

interface WordCloudProps {
  responses: Response[];
  showSentiment?: boolean;
  positiveKeywords?: string[];
  negativeKeywords?: string[];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

const COLORS = [
  "text-blue-300",
  "text-green-300",
  "text-yellow-300",
  "text-pink-300",
  "text-purple-300",
  "text-cyan-300",
  "text-orange-300",
  "text-teal-300",
  "text-indigo-300",
  "text-rose-300",
];

const SENTIMENT_COLORS = {
  positive: "text-green-400",
  negative: "text-red-400",
  neutral: "text-gray-400",
};

const SIZES = [
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
];

interface WordItem {
  key: string;
  text: string;
  count: number;
  studentNames: string[];
  sentiment: "positive" | "negative" | "neutral" | null;
  size: string;
  color: string;
  rotation: number;
  delay: number;
}

function WordBubble({ word }: { word: WordItem }) {
  const tooltip = word.count > 1
    ? `${word.count}× — ${word.studentNames.join(", ")}`
    : `— ${word.studentNames[0]}`;
  return (
    <span
      className={`${word.size} ${word.color} font-medium inline-block transition-all duration-500 hover:scale-110 cursor-default`}
      style={{
        transform: `rotate(${word.rotation}deg)`,
        animationDelay: `${word.delay}s`,
      }}
      title={tooltip}
    >
      {word.text}
    </span>
  );
}

export default function WordCloud({ responses, showSentiment, positiveKeywords, negativeKeywords }: WordCloudProps) {
  const words = useMemo(() => {
    // Aggregate duplicates (case-insensitive)
    const grouped = new Map<string, {
      text: string;
      count: number;
      studentNames: string[];
      sentiment: "positive" | "negative" | "neutral" | null;
    }>();

    for (const r of responses) {
      const raw = r.answer || r.poll_choice || "";
      if (!raw.trim()) continue;

      // For sentiment questions, split by commas / "and" into individual words
      const phrases = showSentiment
        ? raw.split(/[,\/]|\band\b/i).map((s) => s.trim()).filter(Boolean)
        : [raw.trim()];

      for (const phrase of phrases) {
        const key = phrase.toLowerCase();
        if (!key) continue;

        // Re-classify each individual phrase
        let sentiment = r.sentiment;
        if (showSentiment && positiveKeywords && negativeKeywords) {
          const lower = key;
          let pos = 0, neg = 0;
          for (const kw of positiveKeywords) { if (lower.includes(kw)) pos++; }
          for (const kw of negativeKeywords) { if (lower.includes(kw)) neg++; }
          sentiment = pos > neg ? "positive" : neg > pos ? "negative" : "neutral";
        }

        const existing = grouped.get(key);
        if (existing) {
          existing.count++;
          if (!existing.studentNames.includes(r.student_name)) {
            existing.studentNames.push(r.student_name);
          }
        } else {
          grouped.set(key, {
            text: phrase,
            count: 1,
            studentNames: [r.student_name],
            sentiment,
          });
        }
      }
    }

    // Find max count for size scaling
    const maxCount = Math.max(1, ...Array.from(grouped.values()).map((g) => g.count));

    let i = 0;
    return Array.from(grouped.entries()).map(([key, g]) => {
      const hash = hashString(key);
      const colorIndex = hash % COLORS.length;
      const rotation = ((hash % 3) - 1) * 3;

      // Scale size: 1 occurrence = smallest, maxCount = largest
      const sizeIndex = maxCount === 1
        ? 0
        : Math.round(((g.count - 1) / (maxCount - 1)) * (SIZES.length - 1));

      return {
        key,
        text: g.text,
        count: g.count,
        studentNames: g.studentNames,
        sentiment: g.sentiment,
        size: SIZES[sizeIndex],
        color: showSentiment && g.sentiment
          ? SENTIMENT_COLORS[g.sentiment]
          : COLORS[colorIndex],
        rotation,
        delay: i++ * 0.05,
      };
    });
  }, [responses, showSentiment]);

  if (responses.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic text-center py-4">
        Waiting for responses...
      </p>
    );
  }

  // When sentiment mode is on, split into columns
  if (showSentiment) {
    const positive = words.filter((w) => w.sentiment === "positive");
    const negative = words.filter((w) => w.sentiment === "negative");
    const neutral = words.filter((w) => w.sentiment === "neutral" || !w.sentiment);

    return (
      <div className="grid grid-cols-2 gap-4 py-3">
        {/* Positive column */}
        <div className="border border-green-800/40 rounded-lg p-3 bg-green-950/20">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-800/30">
            <span className="text-green-400 text-lg">+</span>
            <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">
              Positive
            </span>
            <span className="text-green-600 text-xs ml-auto">
              {positive.reduce((s, w) => s + w.count, 0)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {positive.map((word) => (
              <WordBubble key={word.key} word={word} />
            ))}
            {positive.length === 0 && (
              <p className="text-green-800 text-xs italic">No positive responses yet</p>
            )}
          </div>
        </div>

        {/* Negative column */}
        <div className="border border-red-800/40 rounded-lg p-3 bg-red-950/20">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-red-800/30">
            <span className="text-red-400 text-lg">−</span>
            <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">
              Negative
            </span>
            <span className="text-red-600 text-xs ml-auto">
              {negative.reduce((s, w) => s + w.count, 0)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {negative.map((word) => (
              <WordBubble key={word.key} word={word} />
            ))}
            {negative.length === 0 && (
              <p className="text-red-800 text-xs italic">No negative responses yet</p>
            )}
          </div>
        </div>

        {/* Neutral row spanning both columns */}
        {neutral.length > 0 && (
          <div className="col-span-2 border border-gray-700/40 rounded-lg p-3 bg-gray-900/20">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700/30">
              <span className="text-gray-400 text-lg">~</span>
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Neutral
              </span>
              <span className="text-gray-600 text-xs ml-auto">
                {neutral.reduce((s, w) => s + w.count, 0)}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              {neutral.map((word) => (
                <WordBubble key={word.key} word={word} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-3">
      {words.map((word) => (
        <WordBubble key={word.key} word={word} />
      ))}
    </div>
  );
}
