"use client";

import { useState } from "react";

interface StudentFormProps {
  onNameSet: (name: string) => void;
  sessionLabel?: string;
  title?: string;
}

export default function StudentForm({ onNameSet, sessionLabel, title }: StudentFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("student_name", trimmed);
    onNameSet(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {title ?? "Case Discussion"}
        </h1>
        {sessionLabel && (
          <p className="text-sm font-medium text-blue-600 mb-1">{sessionLabel}</p>
        )}
        <p className="text-gray-500 mb-6">Enter your name to participate</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Join Discussion
        </button>
      </form>
    </div>
  );
}
