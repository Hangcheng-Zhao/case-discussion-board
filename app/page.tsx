"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface CaseRow {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
}

export default function HomePage() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [newId, setNewId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("instructor_email");
    if (stored) {
      setEmail(stored);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (email) {
      loadCases(email);
    }
  }, [email]);

  const loadCases = async (forEmail: string) => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("case_config")
      .select("id, title, created_at, created_by")
      .eq("created_by", forEmail)
      .order("created_at", { ascending: false });
    setCases(data ?? []);
    setLoading(false);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    localStorage.setItem("instructor_email", trimmed);
    setEmail(trimmed);
  };

  const handleSwitch = () => {
    localStorage.removeItem("instructor_email");
    setEmail(null);
    setEmailInput("");
    setCases([]);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const slug = newId.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) return;
    setCreating(true);

    const supabase = createClient();
    await supabase.from("case_config").insert({
      id: slug,
      title: newTitle.trim() || "New Case",
      created_by: email,
    });

    setNewId("");
    setNewTitle("");
    setCreating(false);
    loadCases(email);
  };

  const handleDelete = async (caseId: string, caseTitle: string) => {
    if (!email) return;
    if (!window.confirm(`Delete case "${caseTitle}"? All responses will be permanently deleted.`)) return;
    setDeleting(caseId);

    const supabase = createClient();
    await supabase.from("responses").delete().eq("case_id", caseId);
    await supabase.from("case_config").delete().eq("id", caseId);

    setDeleting(null);
    loadCases(email);
  };

  // Email prompt screen
  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <form
          onSubmit={handleEmailSubmit}
          className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Case Discussion Board
          </h1>
          <p className="text-gray-500 mb-6">
            Enter your email to get started
          </p>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@school.edu"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            required
          />
          <button
            type="submit"
            disabled={!emailInput.trim()}
            className="w-full px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Case Discussion Board
          </h1>
          <div className="text-sm text-gray-500">
            {email}{" "}
            <button
              onClick={handleSwitch}
              className="text-blue-600 hover:underline ml-1"
            >
              Switch
            </button>
          </div>
        </div>
        <p className="text-gray-500 mb-8">
          Create and manage classroom discussion cases
        </p>

        {/* Create new case */}
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Create New Case
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="Case ID (e.g. skims)"
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Case title"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newId.trim() || creating}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {creating ? "..." : "Create"}
            </button>
          </div>
        </form>

        {/* Case list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <p className="text-center text-gray-400 py-12">
            No cases yet. Create one above.
          </p>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-900">{c.title}</h3>
                  <p className="text-sm text-gray-400">/{c.id}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/c/${c.id}/setup`}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Setup
                  </Link>
                  <Link
                    href={`/c/${c.id}`}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Student
                  </Link>
                  <Link
                    href={`/c/${c.id}/board`}
                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    Board
                  </Link>
                  <Link
                    href={`/c/${c.id}/instructor`}
                    className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                  >
                    Instructor
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id, c.title)}
                    disabled={deleting === c.id}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-40"
                    title="Delete case"
                  >
                    {deleting === c.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
