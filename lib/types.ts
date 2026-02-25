export type StepType = "sentiment" | "text" | "poll";

export interface Step {
  id: number;
  pasture: string;
  question: string;
  type: StepType;
  pollOptions?: string[];
}

export interface SessionConfig {
  case_id: string;
  session_id: string;
  current_step: number;
  display_mode: "controlled" | "live";
  revealed_step: number;
}

export interface Response {
  id: number;
  session_id: string;
  step: number;
  student_name: string;
  answer: string | null;
  sentiment: "positive" | "negative" | "neutral" | null;
  poll_choice: string | null;
  created_at: string;
}
