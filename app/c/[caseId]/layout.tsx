"use client";

import { useParams } from "next/navigation";
import { CaseConfigProvider } from "@/lib/config/CaseConfigContext";

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const caseId = params.caseId as string;

  return <CaseConfigProvider caseId={caseId}>{children}</CaseConfigProvider>;
}
