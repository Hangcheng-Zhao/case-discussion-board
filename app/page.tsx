"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface CaseRow {
  id: string;
  title: string;
  created_at: string;
}

export default function HomePage() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [newId, setNewId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("case_config")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });
    setCases(data ?? []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newId.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) return;
    setCreating(true);

    const supabase = createClient();
    await supabase.from("case_config").insert({
      id: slug,
      title: newTitle.trim() || "New Case",
    });

    setNewId("");
    setNewTitle("");
    setCreating(false);
    loadCases();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Case Discussion Board
        </h1>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
