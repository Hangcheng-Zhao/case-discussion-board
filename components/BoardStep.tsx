"use client";

import { Step, Response } from "@/lib/types";
import WordCloud from "./WordCloud";
import PollDisplay from "./PollDisplay";

interface BoardStepProps {
  step: Step;
  responses: Response[];
  isActive: boolean;
  compact?: boolean;
}

export default function BoardStep({ step, responses, isActive, compact }: BoardStepProps) {
  const stepResponses = responses.filter((r) => r.step === step.id);

  return (
    <div
      className={`transition-all duration-500 ${
        isActive
          ? "ring-1 ring-blue-500/50"
          : ""
      }`}
    >
      <div className={compact ? "py-2" : "py-3"}>
        <div className="flex items-baseline justify-between mb-1">
          <h4 className={`font-semibold text-gray-200 ${compact ? "text-base" : "text-xl"}`}>
            {step.question}
          </h4>
          {stepResponses.length > 0 && (
            <span className="text-xs text-gray-500 ml-2 shrink-0">
              {stepResponses.length}
            </span>
          )}
        </div>

        {step.type === "poll" && step.pollOptions ? (
          <PollDisplay responses={stepResponses} options={step.pollOptions} />
        ) : (
          <WordCloud
            responses={stepResponses}
            showSentiment={step.type === "sentiment"}
          />
        )}
      </div>
    </div>
  );
}
