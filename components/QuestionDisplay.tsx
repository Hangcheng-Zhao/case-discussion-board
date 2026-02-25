"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { classifySentiment } from "@/lib/sentiment";
import { ConfigStep } from "@/lib/config/defaults";
import PollVote from "./PollVote";

interface QuestionDisplayProps {
  step: ConfigStep;
  studentName: string;
  hasSubmitted: boolean;
  onSubmitted: () => void;
  caseId: string;
  sessionId: string;
  sentimentPositive: string[];
  sentimentNegative: string[];
}

export default function QuestionDisplay({
  step,
  studentName,
  hasSubmitted,
  onSubmitted,
  caseId,
  sessionId,
  sentimentPositive,
  sentimentNegative,
}: QuestionDisplayProps) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);

    const payload: Record<string, unknown> = {
      case_id: caseId,
      session_id: sessionId,
      step: step.id,
      student_name: studentName,
      answer: answer.trim(),
    };

    if (step.type === "sentiment") {
      payload.sentiment = classifySentiment(answer.trim(), sentimentPositive, sentimentNegative);
    }

    await supabase.from("responses").insert(payload);
    setAnswer("");
    setSubmitting(false);
    onSubmitted();
  };

  const handlePollSubmit = async (choice: string) => {
    setSubmitting(true);
    await supabase.from("responses").insert({
      case_id: caseId,
      session_id: sessionId,
      step: step.id,
      student_name: studentName,
      poll_choice: choice,
    });
    setSubmitting(false);
    onSubmitted();
  };

  if (hasSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">&#10003;</div>
        <p className="text-green-800 font-medium">Response submitted!</p>
        <p className="text-green-600 text-sm mt-1">Waiting for the next question...</p>
      </div>
    );
  }

  if (step.type === "poll") {
    return (
      <PollVote
        step={{ id: step.id, pasture: step.topic, question: step.question, type: step.type, pollOptions: step.pollOptions }}
        onVote={handlePollSubmit}
        disabled={submitting}
      />
    );
  }

  return (
    <form onSubmit={handleTextSubmit} className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">{step.topic}</p>
        <h2 className="text-xl font-bold text-gray-900">{step.question}</h2>
      </div>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={step.type === "sentiment" ? 'e.g. "addictive", "creative", "entertaining"...' : "Type your answer..."}
        rows={step.type === "sentiment" ? 2 : 3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        autoFocus
      />
      <button
        type="submit"
        disabled={!answer.trim() || submitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
