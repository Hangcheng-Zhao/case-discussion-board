"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SessionConfig } from "@/lib/types";
import { useCaseConfig } from "@/lib/config/CaseConfigContext";
import StudentForm from "@/components/StudentForm";
import QuestionDisplay from "@/components/QuestionDisplay";

export default function StudentPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const sessionId = (params.session as string).toUpperCase();
  const { title, sessions, steps, sentiment_positive, sentiment_negative } = useCaseConfig();

  const validIds = sessions.map((s) => s.id);
  const sessionLabel = sessions.find((s) => s.id === sessionId)?.label ?? sessionId;

  const [studentName, setStudentName] = useState<string | null>(null);
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [submittedSteps, setSubmittedSteps] = useState<Set<number>>(new Set());
  const supabaseRef = useRef(createClient());

  if (validIds.length > 0 && !validIds.includes(sessionId)) {
    notFound();
  }

  useEffect(() => {
    const saved = localStorage.getItem(`student_name_${caseId}_${sessionId}`);
    if (saved) setStudentName(saved);
  }, [caseId, sessionId]);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const fetchConfig = async () => {
      const { data } = await supabase
        .from("session_config")
        .select("*")
        .eq("case_id", caseId)
        .eq("session_id", sessionId)
        .single();
      if (data) setConfig(data);
    };

    fetchConfig();

    const channel = supabase
      .channel(`session_config_${caseId}_${sessionId}`)
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, sessionId]);

  const checkSubmitted = useCallback(async () => {
    if (!studentName) return;
    const { data } = await supabaseRef.current
      .from("responses")
      .select("step")
      .eq("case_id", caseId)
      .eq("session_id", sessionId)
      .eq("student_name", studentName);
    if (data) {
      setSubmittedSteps(new Set(data.map((r) => r.step)));
    }
  }, [studentName, caseId, sessionId]);

  useEffect(() => {
    checkSubmitted();
  }, [checkSubmitted]);

  const handleNameSet = (name: string) => {
    localStorage.setItem(`student_name_${caseId}_${sessionId}`, name);
    setStudentName(name);
  };

  const handleSubmitted = () => {
    if (config) {
      setSubmittedSteps((prev) => new Set([...prev, config.current_step]));
    }
  };

  const handleChangeName = () => {
    localStorage.removeItem(`student_name_${caseId}_${sessionId}`);
    setStudentName(null);
    setSubmittedSteps(new Set());
  };

  if (!studentName) {
    return <StudentForm onNameSet={handleNameSet} sessionLabel={sessionLabel} title={title} />;
  }

  const currentStep = config ? steps[config.current_step] : null;
  const hasSubmitted = config ? submittedSteps.has(config.current_step) : false;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500">
              {sessionLabel} — Hi, {studentName}
            </p>
          </div>
          <button
            onClick={handleChangeName}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Change name
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 mt-4">
        {!config ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Connecting...</p>
          </div>
        ) : !currentStep ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Discussion hasn&apos;t started yet.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Waiting for instructor...
            </p>
          </div>
        ) : (
          <QuestionDisplay
            step={currentStep}
            studentName={studentName}
            hasSubmitted={hasSubmitted}
            onSubmitted={handleSubmitted}
            caseId={caseId}
            sessionId={sessionId}
            sentimentPositive={sentiment_positive}
            sentimentNegative={sentiment_negative}
          />
        )}
      </main>
    </div>
  );
}
