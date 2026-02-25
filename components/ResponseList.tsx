"use client";

import { Response } from "@/lib/types";
import SentimentBadge from "./SentimentBadge";

interface ResponseListProps {
  responses: Response[];
  showSentiment?: boolean;
}

export default function ResponseList({
  responses,
  showSentiment,
}: ResponseListProps) {
  if (responses.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">No responses yet...</p>
    );
  }

  if (showSentiment) {
    const groups = {
      positive: responses.filter((r) => r.sentiment === "positive"),
      neutral: responses.filter((r) => r.sentiment === "neutral"),
      negative: responses.filter((r) => r.sentiment === "negative"),
    };

    return (
      <div className="grid grid-cols-3 gap-4">
        {(["positive", "neutral", "negative"] as const).map((sent) => (
          <div key={sent}>
            <h4
              className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                sent === "positive"
                  ? "text-green-400"
                  : sent === "negative"
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {sent === "positive"
                ? "👍 Positive"
                : sent === "negative"
                ? "👎 Negative"
                : "😐 Neutral"}{" "}
              ({groups[sent].length})
            </h4>
            <div className="space-y-2">
              {groups[sent].map((r) => (
                <div
                  key={r.id}
                  className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm"
                >
                  <p className="text-gray-200">{r.answer}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    — {r.student_name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {responses.map((r) => (
        <div
          key={r.id}
          className="bg-gray-700/50 rounded-lg px-4 py-3 flex items-start gap-3"
        >
          <div className="flex-1">
            <p className="text-gray-200 text-sm">{r.answer || r.poll_choice}</p>
            <p className="text-gray-500 text-xs mt-1">— {r.student_name}</p>
          </div>
          {r.sentiment && <SentimentBadge sentiment={r.sentiment} />}
        </div>
      ))}
    </div>
  );
}
