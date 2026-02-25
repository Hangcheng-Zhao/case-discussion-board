"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCaseConfig } from "@/lib/config/CaseConfigContext";

export default function InstructorPickerPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const { sessions } = useCaseConfig();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Instructor Control Panel
        </h1>
        <p className="text-gray-500 mb-6">Select a session to manage</p>
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/c/${caseId}/instructor/${s.id}`}
              className="block w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
