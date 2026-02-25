"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { CaseConfig, DEFAULT_CONFIG } from "./defaults";
import { fetchCaseConfig } from "./fetchConfig";

const CaseConfigContext = createContext<CaseConfig>(DEFAULT_CONFIG);

export function useCaseConfig() {
  return useContext(CaseConfigContext);
}

export function CaseConfigProvider({ caseId, children }: { caseId: string; children: ReactNode }) {
  const [config, setConfig] = useState<CaseConfig>({ ...DEFAULT_CONFIG, id: caseId });

  useEffect(() => {
    fetchCaseConfig(caseId).then(setConfig);

    const supabase = createClient();
    const channel = supabase
      .channel(`case_config_${caseId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "case_config", filter: `id=eq.${caseId}` },
        () => {
          fetchCaseConfig(caseId).then(setConfig);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);

  return (
    <CaseConfigContext.Provider value={config}>
      {children}
    </CaseConfigContext.Provider>
  );
}
