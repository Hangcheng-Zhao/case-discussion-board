import { createClient } from "@/lib/supabase/client";
import { CaseConfig, DEFAULT_CONFIG } from "./defaults";

export async function fetchCaseConfig(caseId: string): Promise<CaseConfig> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("case_config")
      .select("*")
      .eq("id", caseId)
      .single();

    if (error || !data) return { ...DEFAULT_CONFIG, id: caseId };

    return {
      id: data.id,
      title: data.title ?? DEFAULT_CONFIG.title,
      board_title: data.board_title ?? DEFAULT_CONFIG.board_title,
      description: data.description ?? DEFAULT_CONFIG.description,
      sessions: data.sessions ?? DEFAULT_CONFIG.sessions,
      steps: data.steps ?? DEFAULT_CONFIG.steps,
      topics: data.topics ?? DEFAULT_CONFIG.topics,
      sentiment_positive: data.sentiment_positive ?? DEFAULT_CONFIG.sentiment_positive,
      sentiment_negative: data.sentiment_negative ?? DEFAULT_CONFIG.sentiment_negative,
    };
  } catch {
    return { ...DEFAULT_CONFIG, id: caseId };
  }
}
