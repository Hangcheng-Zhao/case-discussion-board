"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCaseConfig } from "@/lib/config/CaseConfigContext";

export default function BoardPickerPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const { sessions } = useCaseConfig();

  return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Board Plan</h1>
        <p className="text-gray-400 mb-6">Select a session to view</p>
        <div className="flex gap-4">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/c/${caseId}/board/${s.id}`}
              className="px-8 py-4 bg-gray-800 border border-gray-600 rounded-xl text-lg font-medium hover:bg-gray-700 hover:border-gray-500 transition-colors"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
