"use client";

import { Response } from "@/lib/types";

interface PollDisplayProps {
  responses: Response[];
  options: string[];
}

export default function PollDisplay({ responses, options }: PollDisplayProps) {
  const total = responses.length;

  const counts = options.map((opt) => ({
    label: opt,
    count: responses.filter((r) => r.poll_choice === opt).length,
  }));

  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-gray-400 font-medium">
          {total} vote{total !== 1 ? "s" : ""}
        </span>
      </div>
      {counts.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

        return (
          <div key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-200 font-medium">{item.label}</span>
              <span className="text-gray-400">
                {item.count} ({pct}%)
              </span>
            </div>
            <div className="h-8 bg-gray-700 rounded-lg overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-lg transition-all duration-700 ease-out"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
