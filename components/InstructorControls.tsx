"use client";

import { SessionConfig, Response } from "@/lib/types";
import { ConfigStep } from "@/lib/config/defaults";

interface InstructorControlsProps {
  config: SessionConfig;
  responses: Response[];
  steps: ConfigStep[];
  onAdvance: () => void;
  onGoBack: () => void;
  onReveal: () => void;
  onToggleMode: () => void;
  onReset: () => void;
}

export default function InstructorControls({
  config,
  responses,
  steps,
  onAdvance,
  onGoBack,
  onReveal,
  onToggleMode,
  onReset,
}: InstructorControlsProps) {
  const currentStep = steps[config.current_step];
  const stepResponses = responses.filter(
    (r) => r.step === config.current_step
  );

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
        <div>
          <p className="text-sm text-gray-500">Current Step</p>
          <p className="text-lg font-bold text-gray-900">
            {config.current_step} / {steps.length - 1}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Display Mode</p>
          <p className="text-lg font-bold text-gray-900 capitalize">
            {config.display_mode}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Revealed Up To</p>
          <p className="text-lg font-bold text-gray-900">
            Step {config.revealed_step}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Responses (this step)</p>
          <p className="text-lg font-bold text-gray-900">
            {stepResponses.length}
          </p>
        </div>
      </div>

      {/* Current question */}
      {currentStep && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            {currentStep.topic} — Step {currentStep.id}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {currentStep.question}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Type: {currentStep.type}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoBack}
          disabled={config.current_step <= 0}
          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Previous Step
        </button>
        <button
          onClick={onAdvance}
          disabled={config.current_step >= steps.length - 1}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next Step
        </button>
        <button
          onClick={onReveal}
          disabled={config.revealed_step >= config.current_step}
          className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Reveal on Board (Step {config.revealed_step + 1})
        </button>
        <button
          onClick={onToggleMode}
          className={`px-4 py-3 rounded-lg font-medium transition-colors ${
            config.display_mode === "live"
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          Switch to{" "}
          {config.display_mode === "controlled" ? "Live" : "Controlled"} Mode
        </button>
      </div>

      {/* Responses preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-900 mb-3">
          Responses for Step {config.current_step} ({stepResponses.length})
        </h3>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {stepResponses.length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              No responses yet...
            </p>
          ) : (
            stepResponses.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 rounded-lg px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-700">
                  {r.student_name}:
                </span>{" "}
                <span className="text-gray-600">
                  {r.answer || r.poll_choice}
                </span>
                {r.sentiment && (
                  <span className="ml-2 text-xs text-gray-400">
                    [{r.sentiment}]
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reset */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
        >
          Reset Session (Clear All Data)
        </button>
      </div>
    </div>
  );
}
