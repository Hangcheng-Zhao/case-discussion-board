"use client";

interface SentimentBadgeProps {
  sentiment: "positive" | "negative" | "neutral";
}

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const styles = {
    positive: "bg-green-900/50 text-green-300",
    negative: "bg-red-900/50 text-red-300",
    neutral: "bg-gray-600/50 text-gray-300",
  };

  const labels = {
    positive: "👍",
    negative: "👎",
    neutral: "😐",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[sentiment]}`}
    >
      {labels[sentiment]}
    </span>
  );
}
