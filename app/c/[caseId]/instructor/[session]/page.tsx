"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SessionConfig, Response } from "@/lib/types";
import { useCaseConfig } from "@/lib/config/CaseConfigContext";
import InstructorControls from "@/components/InstructorControls";

export default function InstructorPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const sessionId = (params.session as string).toUpperCase();
  const { title, sessions, steps } = useCaseConfig();

  const validIds = sessions.map((s) => s.id);
  const sessionLabel = sessions.find((s) => s.id === sessionId)?.label ?? sessionId;

  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  if (validIds.length > 0 && !validIds.includes(sessionId)) {
    notFound();
  }

  useEffect(() => {
    const supabase = supabaseRef.current;

    const fetchAll = async () => {
      try {
        const [configRes, responsesRes] = await Promise.all([
          supabase.from("session_config").select("*").eq("case_id", caseId).eq("session_id", sessionId).single(),
          supabase
            .from("responses")
            .select("*")
            .eq("case_id", caseId)
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true }),
        ]);
        if (configRes.error) {
          setError(`Config error: ${configRes.error.message}`);
          return;
        }
        if (configRes.data) setConfig(configRes.data);
        if (responsesRes.data) setResponses(responsesRes.data);
      } catch (e) {
        setError(`Fetch error: ${String(e)}`);
      }
    };

    fetchAll();

    const configChannel = supabase
      .channel(`instructor_config_${caseId}_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_config",
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          const row = payload.new as SessionConfig;
          if (row.session_id === sessionId) setConfig(row);
        }
      )
      .subscribe();

    const responsesChannel = supabase
      .channel(`instructor_responses_${caseId}_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          const row = payload.new as Response;
          if (row.session_id === sessionId) {
            setResponses((prev) => [...prev, row]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, [caseId, sessionId]);

  const updateConfig = async (updates: Partial<SessionConfig>) => {
    if (!config) return;
    await supabaseRef.current
      .from("session_config")
      .update(updates)
      .eq("case_id", caseId)
      .eq("session_id", sessionId);
  };

  const handleAdvance = () => {
    if (!config || config.current_step >= steps.length - 1) return;
    updateConfig({ current_step: config.current_step + 1 });
  };

  const handleGoBack = () => {
    if (!config || config.current_step <= 0) return;
    updateConfig({ current_step: config.current_step - 1 });
  };

  const handleReveal = () => {
    if (!config || config.revealed_step >= config.current_step) return;
    updateConfig({ revealed_step: config.revealed_step + 1 });
  };

  const handleToggleMode = () => {
    if (!config) return;
    updateConfig({
      display_mode: config.display_mode === "controlled" ? "live" : "controlled",
    });
  };

  const handleReset = async () => {
    if (!confirm("Reset this session? This will delete all responses for this section.")) return;
    await supabaseRef.current
      .from("responses")
      .delete()
      .eq("case_id", caseId)
      .eq("session_id", sessionId);
    await updateConfig({
      current_step: 0,
      revealed_step: -1,
      display_mode: "controlled",
    });
    setResponses([]);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <h2 className="text-red-800 font-bold mb-2">Connection Error</h2>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Instructor Control Panel</h1>
          <p className="text-sm text-gray-500">{title} — {sessionLabel}</p>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 mt-4">
        <InstructorControls
          config={config}
          responses={responses}
          steps={steps}
          onAdvance={handleAdvance}
          onGoBack={handleGoBack}
          onReveal={handleReveal}
          onToggleMode={handleToggleMode}
          onReset={handleReset}
        />
      </main>
    </div>
  );
}
