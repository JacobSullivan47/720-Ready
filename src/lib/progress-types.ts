import type { SrsState } from "./srs";
import type { DomainKey, Difficulty, QuestionType, ScenarioKey } from "@/content/types";

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
  answers: Record<string, number[]>;
  currentIndex: number;
  remainingSec: number; // frozen while the tab is hidden, not derived from startedAt
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

export type ExerciseType = "CONFIG_BUILDER" | "ANTI_PATTERN_SPOTTER" | "SEQUENCING";

export interface ExerciseAttemptRecord {
  itemId: string;
  domainKey: DomainKey;
  isCorrect: boolean;
  createdAt: string; // ISO
}

export interface ViewedOverviews {
  domainKeys: DomainKey[];
  scenarioKeys: ScenarioKey[];
}

export interface PracticeSessionFilters {
  domainKey?: DomainKey;
  scenarioKey?: ScenarioKey;
  difficulty?: Difficulty;
}

export interface ActivePracticeSession {
  id: string;
  questionIds: string[];
  currentIndex: number;
  correctCount: number;
  filters: PracticeSessionFilters;
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
  getMockExamResult(examId: string): Promise<MockExamResult | null>;
  getActiveMockExam(): Promise<MockExamInProgress | null>;
  startMockExam(): Promise<MockExamInProgress>;
  saveMockExamProgress(
    examId: string,
    answers: Record<string, number[]>,
    currentIndex: number,
    remainingSec: number,
  ): Promise<void>;
  submitMockExam(
    examId: string,
    answers: Record<string, number[]>,
  ): Promise<MockExamResult>;
  deleteMockExam(examId: string): Promise<void>;

  pingStudyLog(): Promise<void>;
  getStudyLogDates(): Promise<string[]>;

  getExerciseAttempts(): Promise<ExerciseAttemptRecord[]>;
  recordExerciseAttempt(input: {
    exerciseType: ExerciseType;
    itemId: string;
    isCorrect: boolean;
  }): Promise<void>;

  getViewedOverviews(): Promise<ViewedOverviews>;
  markOverviewViewed(itemType: "DOMAIN" | "SCENARIO", key: string): Promise<void>;

  getActivePracticeSession(): Promise<ActivePracticeSession | null>;
  startPracticeSession(questionIds: string[], filters: PracticeSessionFilters): Promise<{ id: string }>;
  updatePracticeSessionProgress(
    id: string,
    input: { currentIndex: number; correctCount: number },
  ): Promise<void>;
  completePracticeSession(id: string): Promise<void>;
}
