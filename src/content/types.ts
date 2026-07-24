// Structured content types. All seed content (flashcards, questions, overviews)
// lives as plain data conforming to these shapes under src/content/, and is
// loaded into the database by prisma/seed.ts. This keeps content editable
// without touching UI code — see README "Adding content".

export type DomainKey =
  | "AGENTIC_ARCHITECTURE"
  | "TOOL_DESIGN_MCP"
  | "CLAUDE_CODE_WORKFLOWS"
  | "PROMPT_ENGINEERING"
  | "CONTEXT_MANAGEMENT";

export type ScenarioKey =
  | "CUSTOMER_SUPPORT_AGENT"
  | "CODE_GENERATION_CLAUDE_CODE"
  | "MULTI_AGENT_RESEARCH"
  | "DEVELOPER_PRODUCTIVITY_TOOLS"
  | "CLAUDE_CODE_CI_CD"
  | "STRUCTURED_DATA_EXTRACTION";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionType = "SINGLE" | "MULTI";

export interface TopicOverview {
  name: string;
  /** 2-4 sentence plain-language summary of what this covers. */
  summary: string;
  /** Bullet points (markdown-ish plain strings), the core facts/skills to know. */
  keyKnowledge: string[];
  keySkills: string[];
  /** Common mistakes/anti-patterns, each a short "X instead of Y" style bullet. */
  antiPatterns: string[];
  /** 1-3 sentences on how this tends to show up in exam-style questions. */
  examStyleNote: string;
}

export interface DomainContent extends TopicOverview {
  key: DomainKey;
  weightPct: number;
  sortOrder: number;
}

export interface ScenarioContent extends TopicOverview {
  key: ScenarioKey;
  sortOrder: number;
}

export interface FlashcardSeed {
  domainKey: DomainKey;
  scenarioKey?: ScenarioKey;
  term: string;
  definition: string;
  example: string;
  difficulty?: Difficulty;
}

export interface QuestionSeed {
  domainKey: DomainKey;
  scenarioKey?: ScenarioKey;
  type: QuestionType;
  prompt: string;
  options: string[];
  /** 0-indexed positions of correct options within `options`. */
  correctIndexes: number[];
  explanation: string;
  eli10: string;
  difficulty?: Difficulty;
}
