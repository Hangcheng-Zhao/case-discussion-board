"use client";

import { Step } from "@/lib/types";

interface PollVoteProps {
  step: Step;
  onVote: (choice: string) => void;
  disabled: boolean;
}

export default function PollVote({ step, onVote, disabled }: PollVoteProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
          {step.pasture}
        </p>
        <h2 className="text-xl font-bold text-gray-900">{step.question}</h2>
      </div>

      <div className="space-y-3">
        {step.pollOptions?.map((option) => (
          <button
            key={option}
            onClick={() => onVote(option)}
            disabled={disabled}
            className="w-full text-left px-5 py-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-900 font-medium disabled:opacity-40"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
