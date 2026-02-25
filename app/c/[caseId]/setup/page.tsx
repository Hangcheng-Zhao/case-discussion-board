"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CaseConfig,
  ConfigSession,
  ConfigStep,
  ConfigTopic,
  DEFAULT_CONFIG,
  COLOR_NAMES,
  COLOR_MAP,
} from "@/lib/config/defaults";
import { StepType } from "@/lib/types";
import { fetchCaseConfig } from "@/lib/config/fetchConfig";

const STEP_TYPES: StepType[] = ["text", "sentiment", "poll"];

export default function SetupPage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const [config, setConfig] = useState<CaseConfig>({ ...DEFAULT_CONFIG, id: caseId });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseConfig(caseId).then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, [caseId]);

  const update = <K extends keyof CaseConfig>(key: K, val: CaseConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  /* ---- sessions ---- */
  const addSession = () => update("sessions", [...config.sessions, { id: "", label: "" }]);
  const removeSession = (i: number) => update("sessions", config.sessions.filter((_, idx) => idx !== i));
  const updateSession = (i: number, field: keyof ConfigSession, val: string) =>
    update("sessions", config.sessions.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));

  /* ---- topics ---- */
  const addTopic = () => update("topics", [...config.topics, { name: "", stepIds: [], color: "blue" }]);
  const removeTopic = (i: number) => update("topics", config.topics.filter((_, idx) => idx !== i));
  const updateTopic = (i: number, field: keyof ConfigTopic, val: unknown) =>
    update("topics", config.topics.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));

  /* ---- steps ---- */
  const addStep = () =>
    update("steps", [...config.steps, { id: config.steps.length, topic: config.topics[0]?.name ?? "", question: "", type: "text" as StepType }]);
  const removeStep = (i: number) =>
    update("steps", config.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, id: idx })));
  const updateStep = (i: number, field: string, val: unknown) =>
    update("steps", config.steps.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));

  /* ---- save ---- */
  const handleSave = async () => {
    setSaving(true);

    const indexedSteps = config.steps.map((s, i) => ({ ...s, id: i }));
    const computedTopics = config.topics.map((t) => ({
      ...t,
      stepIds: indexedSteps.filter((s) => s.topic === t.name).map((s) => s.id),
    }));

    const payload = {
      id: caseId,
      title: config.title,
      board_title: config.board_title,
      description: config.description,
      sessions: config.sessions,
      steps: indexedSteps,
      topics: computedTopics,
      sentiment_positive: config.sentiment_positive,
      sentiment_negative: config.sentiment_negative,
    };

    const supabase = createClient();
    await supabase.from("case_config").upsert(payload);

    // Reconcile session_config rows
    const { data: existingRows } = await supabase
      .from("session_config")
      .select("session_id")
      .eq("case_id", caseId);

    const existingIds = new Set((existingRows ?? []).map((r) => r.session_id));

    const toInsert = config.sessions
      .filter((s) => s.id && !existingIds.has(s.id))
      .map((s) => ({ case_id: caseId, session_id: s.id }));

    if (toInsert.length > 0) {
      await supabase.from("session_config").insert(toInsert);
    }

    setConfig((prev) => ({ ...prev, steps: indexedSteps, topics: computedTopics }));
    setSaving(false);
    setSaved(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const topicNames = config.topics.map((t) => t.name).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Case Setup</h1>
            <p className="text-sm text-gray-500">/{caseId}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-8 pb-20">
        {/* Case Details */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Case Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={config.title} onChange={(e) => update("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. The Meteoric Rise of Skims" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board Title</label>
              <input type="text" value={config.board_title} onChange={(e) => update("board_title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={config.description} onChange={(e) => update("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        {/* Sessions */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Sessions</h2>
            <button onClick={addSession} className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">+ Add Session</button>
          </div>
          <div className="space-y-3">
            {config.sessions.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="text" value={s.id} onChange={(e) => updateSession(i, "id", e.target.value.toUpperCase())}
                  placeholder="ID (e.g. A)" className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
                <input type="text" value={s.label} onChange={(e) => updateSession(i, "label", e.target.value)}
                  placeholder="Label (e.g. Section A)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => removeSession(i)} className="text-red-400 hover:text-red-600 text-lg px-2">&times;</button>
              </div>
            ))}
          </div>
        </section>

        {/* Board Topics */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Board Topics</h2>
            <button onClick={addTopic} className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">+ Add Topic</button>
          </div>
          <p className="text-xs text-gray-400 mb-3">Topics group questions into panels on the board. Step IDs are auto-computed on save.</p>
          <div className="space-y-3">
            {config.topics.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="text" value={t.name} onChange={(e) => updateTopic(i, "name", e.target.value)}
                  placeholder="Topic name" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={t.color} onChange={(e) => updateTopic(i, "color", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {COLOR_NAMES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <span className={`w-6 h-6 rounded-full ${COLOR_MAP[t.color]?.bg ?? "bg-gray-400"}`} />
                <button onClick={() => removeTopic(i)} className="text-red-400 hover:text-red-600 text-lg px-2">&times;</button>
              </div>
            ))}
          </div>
        </section>

        {/* Discussion Questions */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Discussion Questions</h2>
            <button onClick={addStep} className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">+ Add Question</button>
          </div>
          <div className="space-y-4">
            {config.steps.map((step, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Question {i}</span>
                  <button onClick={() => removeStep(i)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                </div>
                <input type="text" value={step.question} onChange={(e) => updateStep(i, "question", e.target.value)}
                  placeholder="Question text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex gap-3">
                  <select value={step.topic} onChange={(e) => updateStep(i, "topic", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select topic...</option>
                    {topicNames.map((n) => (<option key={n} value={n}>{n}</option>))}
                  </select>
                  <select value={step.type} onChange={(e) => updateStep(i, "type", e.target.value as StepType)}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STEP_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                {step.type === "poll" && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Poll options (one per line)</label>
                    <textarea value={(step.pollOptions ?? []).join("\n")}
                      onChange={(e) => updateStep(i, "pollOptions", e.target.value.split("\n").filter((l) => l.trim()))}
                      rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      placeholder={"Option A\nOption B\nOption C"} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sentiment Keywords */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sentiment Keywords</h2>
          <p className="text-xs text-gray-400 mb-3">Comma-separated keywords for auto-classifying sentiment responses.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Positive keywords</label>
              <textarea value={config.sentiment_positive.join(", ")}
                onChange={(e) => update("sentiment_positive", e.target.value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">Negative keywords</label>
              <textarea value={config.sentiment_negative.join(", ")}
                onChange={(e) => update("sentiment_negative", e.target.value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none" />
            </div>
          </div>
        </section>

        <div className="text-center">
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : saved ? "Saved!" : "Save Configuration"}
          </button>
          {saved && <p className="text-green-600 text-sm mt-2">Configuration saved successfully. Changes are live.</p>}
        </div>
      </main>
    </div>
  );
}
