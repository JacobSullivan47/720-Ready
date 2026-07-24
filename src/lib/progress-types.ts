import type { SrsState } from "./srs";
import type { DomainKey, QuestionType, ScenarioKey } from "@/content/types";

export type BookmarkItemType = "FLASHCARD" | "QUESTION";
export type AttemptMode = "PRACTICE" | "MOCK";

export interface AttemptRecord {
  questionId: string;
  domainKey: DomainKey;
  selectedIndexes: number[];
  isCorrect: boolean;
  mode: AttemptMode;
  mockExamId?: string;
  createdAt: string; // ISO
}

export interface MockExamSummary {
  id: string;
  scenarioKeys: ScenarioKey[];
  startedAt: string;
  completedAt: string | null;
  scaledScore: number | null;
  passed: boolean | null;
  domainBreakdown: Partial<Record<DomainKey, { correct: number; total: number }>> | null;
}

export interface MockExamQuestionRecord {
  id: string;
  domainKey: DomainKey;
  scenarioKey?: ScenarioKey;
  type: QuestionType;
  prompt: string;
  options: string[];
}

export interface MockExamInProgress extends MockExamSummary {
  questions: MockExamQuestionRecord[];
  timeLimitSec: number;
}

export interface GradedMockExamQuestion extends MockExamQuestionRecord {
  correctIndexes: number[];
  explanation: string;
  eli10: string;
  selectedIndexes: number[];
  isCorrect: boolean;
}

export interface MockExamResult extends MockExamSummary {
  questions: GradedMockExamQuestion[];
}

export interface ProgressClient {
  isGuest: boolean;

  getAllCardStates(): Promise<Record<string, SrsState>>;
  rateCard(cardId: string, rating: "STILL_LEARNING" | "KNEW_IT"): Promise<SrsState>;

  getAttempts(): Promise<AttemptRecord[]>;
  recordAttempt(input: Omit<AttemptRecord, "createdAt">): Promise<void>;

  getBookmarks(): Promise<{ cardIds: string[]; questionIds: string[] }>;
  toggleBookmark(itemType: BookmarkItemType, id: string): Promise<boolean>;

  getMockExamHistory(): Promise<MockExamSummary[]>;
  startMockExam(): Promise<MockExamInProgress>;
  submitMockExam(
    examId: string,
    answers: Record<string, number[]>,
  ): Promise<MockExamResult>;

  pingStudyLog(): Promise<void>;
  getStudyLogDates(): Promise<string[]>;
}
