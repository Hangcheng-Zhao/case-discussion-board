"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SessionConfig, Response } from "@/lib/types";
import { useCaseConfig } from "@/lib/config/CaseConfigContext";
import { COLOR_MAP } from "@/lib/config/defaults";
import BoardStep from "@/components/BoardStep";

export default function BoardPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const sessionId = (params.session as string).toUpperCase();
  const { board_title, sessions, steps, topics } = useCaseConfig();

  const validIds = sessions.map((s) => s.id);
  const sessionLabel = sessions.find((s) => s.id === sessionId)?.label ?? sessionId;

  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [connected, setConnected] = useState(false);
  const [focusedQuadrant, setFocusedQuadrant] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  if (validIds.length > 0 && !validIds.includes(sessionId)) {
    notFound();
  }

  useEffect(() => {
    const supabase = supabaseRef.current;

    const fetchAll = async () => {
      const [configRes, responsesRes] = await Promise.all([
        supabase.from("session_config").select("*").eq("case_id", caseId).eq("session_id", sessionId).single(),
        supabase
          .from("responses")
          .select("*")
          .eq("case_id", caseId)
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true }),
      ]);
      if (configRes.data) setConfig(configRes.data);
      if (responsesRes.data) setResponses(responsesRes.data);
    };

    fetchAll();

    const configChannel = supabase
      .channel(`board_config_${caseId}_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_config",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as SessionConfig;
          if (row.case_id === caseId) setConfig(row);
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    const responsesChannel = supabase
      .channel(`board_responses_${caseId}_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setResponses((prev) => [...prev, payload.new as Response]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "responses",
        },
        () => {
          supabase
            .from("responses")
            .select("*")
            .eq("case_id", caseId)
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true })
            .then(({ data }) => {
              if (data) setResponses(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [caseId, sessionId]);

  const visibleStepIds = new Set<number>();
  if (config) {
    if (config.display_mode === "live") {
      for (let i = 0; i <= config.current_step; i++) visibleStepIds.add(i);
    } else {
      for (let i = 0; i <= config.revealed_step; i++) visibleStepIds.add(i);
    }
  }

  const isTopicVisible = (stepIds: number[]) =>
    stepIds.some((s) => visibleStepIds.has(s));

  const stepsById = Object.fromEntries(steps.map((s) => [s.id, s]));

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      <header className="border-b border-gray-700 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{board_title}</h1>
            <p className="text-gray-500 text-xs">Board Plan — {sessionLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            {config && (
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
                Step {config.current_step}/{steps.length - 1}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                connected ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
              {connected ? "Live" : "..."}
            </span>
          </div>
        </div>
      </header>

      <main
        className={`flex-1 p-4 min-h-0 ${
          focusedQuadrant
            ? ""
            : topics.length <= 2
            ? "grid grid-cols-2 grid-rows-1 gap-4"
            : topics.length <= 4
            ? "grid grid-cols-2 grid-rows-2 gap-4"
            : "grid grid-cols-3 grid-rows-2 gap-4"
        }`}
      >
        {topics.map((topic) => {
          const colors = COLOR_MAP[topic.color] ?? COLOR_MAP.blue;
          const visible = isTopicVisible(topic.stepIds);
          const visibleSteps = topic.stepIds.filter((s) => visibleStepIds.has(s));
          const isFocused = focusedQuadrant === topic.name;
          const isHidden = focusedQuadrant && !isFocused;

          if (isHidden) return null;

          return (
            <div
              key={topic.name}
              onClick={() => setFocusedQuadrant(isFocused ? null : topic.name)}
              className={`rounded-xl border-2 flex flex-col min-h-0 transition-all duration-700 cursor-pointer ${
                isFocused ? "h-full" : ""
              } ${visible ? `${colors.border} bg-gray-800/60` : "border-gray-700/30 bg-gray-800/20"}`}
            >
              <div
                className={`px-4 py-2 rounded-t-xl border-b border-gray-700/50 shrink-0 flex items-center justify-between ${
                  visible ? colors.headerBg : "bg-gray-800/30"
                }`}
              >
                <div>
                  <h2 className={`font-bold ${isFocused ? "text-2xl" : "text-lg"} ${visible ? "text-white" : "text-gray-600"}`}>
                    {topic.name}
                  </h2>
                </div>
                {isFocused && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFocusedQuadrant(null); }}
                    className="text-gray-400 hover:text-white text-sm bg-gray-700/60 hover:bg-gray-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    Back to grid
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
                {!visible ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-700 text-sm italic">Waiting...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {visibleSteps.map((stepId) => {
                      const step = stepsById[stepId];
                      if (!step) return null;
                      return (
                        <BoardStep
                          key={step.id}
                          step={{ id: step.id, pasture: step.topic, question: step.question, type: step.type, pollOptions: step.pollOptions }}
                          responses={responses}
                          isActive={config ? step.id === config.current_step : false}
                          compact={!isFocused}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
