import { StepType } from "@/lib/types";

/* ---------- interfaces -------------------------------------------------- */

export interface ConfigSession {
  id: string;
  label: string;
}

export interface ConfigStep {
  id: number;
  topic: string;
  question: string;
  type: StepType;
  pollOptions?: string[];
}

export interface ConfigTopic {
  name: string;
  stepIds: number[];
  color: string; // key into COLOR_MAP
}

export interface CaseConfig {
  id: string;
  title: string;
  board_title: string;
  description: string;
  sessions: ConfigSession[];
  steps: ConfigStep[];
  topics: ConfigTopic[];
  sentiment_positive: string[];
  sentiment_negative: string[];
}

/* ---------- colour palette ---------------------------------------------- */

export const COLOR_MAP: Record<string, { bg: string; border: string; headerBg: string }> = {
  purple: { bg: "bg-purple-600", border: "border-purple-500", headerBg: "bg-purple-900/40" },
  blue:   { bg: "bg-blue-600",   border: "border-blue-500",   headerBg: "bg-blue-900/40" },
  green:  { bg: "bg-green-600",  border: "border-green-500",  headerBg: "bg-green-900/40" },
  orange: { bg: "bg-orange-500", border: "border-orange-500", headerBg: "bg-orange-900/40" },
  red:    { bg: "bg-red-600",    border: "border-red-500",    headerBg: "bg-red-900/40" },
  teal:   { bg: "bg-teal-600",   border: "border-teal-500",   headerBg: "bg-teal-900/40" },
  pink:   { bg: "bg-pink-600",   border: "border-pink-500",   headerBg: "bg-pink-900/40" },
  yellow: { bg: "bg-yellow-500", border: "border-yellow-500", headerBg: "bg-yellow-900/40" },
  indigo: { bg: "bg-indigo-600", border: "border-indigo-500", headerBg: "bg-indigo-900/40" },
  cyan:   { bg: "bg-cyan-600",   border: "border-cyan-500",   headerBg: "bg-cyan-900/40" },
};

export const COLOR_NAMES = Object.keys(COLOR_MAP);

/* ---------- default config ---------------------------------------------- */

const DEFAULT_POSITIVE = [
  "creative","creativity","inclusive","diverse","diversity",
  "entertaining","entertainment","fun","engaging","engage",
  "discovery","discover","innovative","innovation",
  "empowering","empower","expression","expressive",
  "community","connect","connection","accessible",
  "opportunity","opportunities","democratiz","enabling",
  "inspiring","inspiration","educational","learning",
  "viral","popular","growth","amazing","powerful",
  "platform for","marketplace","e-commerce","commerce",
  "free","easy","cool","great","good","love","best",
  "revolutionary","transformative","disruptive",
];

const DEFAULT_NEGATIVE = [
  "addictive","addiction","addicted","dopamine",
  "distract","distracting","distraction","time-consuming",
  "waste","wasting","toxic","harmful","harm","damage",
  "manipulat","exploit","surveillance","spy","spying",
  "dangerous","threat","risk","risky","unsafe",
  "misinformation","disinformation","fake","propaganda",
  "privacy","data harvester","data mining","tracking",
  "censorship","censor","ban","banned",
  "mental health","anxiety","depression","lonely",
  "narcissi","vanity","shallow","mindless",
  "chinese government","ccp","national security",
  "opium","drug","peddler","predatory",
  "problematic","concerning","bad","worst","terrible",
  "annoying","cringe","overrated",
];

export const DEFAULT_CONFIG: CaseConfig = {
  id: "default",
  title: "Case Discussion",
  board_title: "Case Discussion Board",
  description: "Classroom Case Discussion Board",
  sessions: [
    { id: "A", label: "Section A" },
    { id: "B", label: "Section B" },
    { id: "C", label: "Section C" },
  ],
  steps: [
    { id: 0, topic: "Opening", question: "Share your first impression", type: "sentiment" },
    { id: 1, topic: "Topic 1", question: "Discussion question 1", type: "text" },
    { id: 2, topic: "Topic 1", question: "Discussion question 2", type: "text" },
    { id: 3, topic: "Topic 2", question: "Discussion question 3", type: "text" },
    { id: 4, topic: "Topic 2", question: "Discussion question 4", type: "poll", pollOptions: ["Option A", "Option B", "Option C"] },
  ],
  topics: [
    { name: "Opening", stepIds: [0], color: "purple" },
    { name: "Topic 1", stepIds: [1, 2], color: "blue" },
    { name: "Topic 2", stepIds: [3, 4], color: "green" },
  ],
  sentiment_positive: DEFAULT_POSITIVE,
  sentiment_negative: DEFAULT_NEGATIVE,
};
