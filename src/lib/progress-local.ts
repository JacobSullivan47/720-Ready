"use client";

import { INITIAL_SRS_STATE, scheduleFromRating, type SrsState } from "./srs";
import {
  assembleMockExam,
  computeDomainBreakdown,
  estimateScaledScore,
  isPassingScore,
  MOCK_EXAM_TIME_LIMIT_SEC,
  type BankQuestion,
} from "./scoring";
import { fetchContentBank } from "./content-bank-client";
import { EXERCISE_ITEM_DOMAIN } from "@/content/exercises";
import type {
  ActivePracticeSession,
  AttemptRecord,
  ExerciseAttemptRecord,
  GradedMockExamQuestion,
  MockExamInProgress,
  MockExamResult,
  MockExamSummary,
  ProgressClient,
  ViewedOverviews,
} from "./progress-types";
import type { DomainKey, ScenarioKey } from "@/content/types";

const NS = "720ready:guest:v1:";
const KEYS = {
  cardStates: `${NS}cardStates`,
  attempts: `${NS}attempts`,
  bookmarks: `${NS}bookmarks`,
  mockExams: `${NS}mockExams`,
  activeExam: `${NS}activeExam`,
  studyLog: `${NS}studyLog`,
  exerciseAttempts: `${NS}exerciseAttempts`,
  viewedOverviews: `${NS}viewedOverviews`,
  activePracticeSession: `${NS}activePracticeSession`,
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const ALL_SCENARIOS: ScenarioKey[] = [
  "CUSTOMER_SUPPORT_AGENT",
  "CODE_GENERATION_CLAUDE_CODE",
  "MULTI_AGENT_RESEARCH",
  "DEVELOPER_PRODUCTIVITY_TOOLS",
  "CLAUDE_CODE_CI_CD",
  "STRUCTURED_DATA_EXTRACTION",
];

interface ActiveExamStorage {
  exam: MockExamInProgress;
  fullQuestions: BankQuestion[];
}

function todayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export const localProgressClient: ProgressClient = {
  isGuest: true,

  async getAllCardStates() {
    return readJson<Record<string, SrsState>>(KEYS.cardStates, {});
  },

  async rateCard(cardId, rating) {
    const states = readJson<Record<string, SrsState>>(KEYS.cardStates, {});
    const prev = states[cardId] ?? INITIAL_SRS_STATE;
    const result = scheduleFromRating(prev, rating);
    states[cardId] = {
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
      repetitions: result.repetitions,
      lapses: result.lapses,
    };
    writeJson(KEYS.cardStates, states);
    await localProgressClient.pingStudyLog();
    return states[cardId];
  },

  async getAttempts() {
    return readJson<AttemptRecord[]>(KEYS.attempts, []);
  },

  async recordAttempt(input) {
    const attempts = readJson<AttemptRecord[]>(KEYS.attempts, []);
    attempts.push({ ...input, createdAt: new Date().toISOString() });
    writeJson(KEYS.attempts, attempts);
    await localProgressClient.pingStudyLog();
  },

  async getBookmarks() {
    return readJson(KEYS.bookmarks, { cardIds: [] as string[], questionIds: [] as string[] });
  },

  async toggleBookmark(itemType, id) {
    const bookmarks = readJson(KEYS.bookmarks, { cardIds: [] as string[], questionIds: [] as string[] });
    const list = itemType === "FLASHCARD" ? bookmarks.cardIds : bookmarks.questionIds;
    const idx = list.indexOf(id);
    let nowBookmarked: boolean;
    if (idx >= 0) {
      list.splice(idx, 1);
      nowBookmarked = false;
    } else {
      list.push(id);
      nowBookmarked = true;
    }
    writeJson(KEYS.bookmarks, bookmarks);
    return nowBookmarked;
  },

  async getMockExamHistory() {
    return readJson<MockExamSummary[]>(KEYS.mockExams, []);
  },

  async getMockExamResult(examId) {
    const summary = readJson<MockExamSummary[]>(KEYS.mockExams, []).find((h) => h.id === examId);
    if (!summary || !summary.completedAt) return null;

    const bank = await fetchContentBank();
    const byId = new Map(bank.questions.map((q) => [q.id, q]));
    const attempts = readJson<AttemptRecord[]>(KEYS.attempts, []).filter(
      (a) => a.mockExamId === examId,
    );

    const questions: GradedMockExamQuestion[] = attempts.flatMap((a) => {
      const q = byId.get(a.questionId);
      if (!q) return [];
      return [
        {
          id: q.id,
          domainKey: q.domainKey,
          scenarioKey: q.scenarioKey ?? undefined,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          correctIndexes: q.correctIndexes,
          explanation: q.explanation,
          eli10: q.eli10,
          selectedIndexes: a.selectedIndexes,
          isCorrect: a.isCorrect,
        },
      ];
    });

    return { ...summary, questions };
  },

  async startMockExam() {
    const bank = await fetchContentBank();
    const normalized = bank.questions.map((q) => ({ ...q, scenarioKey: q.scenarioKey ?? undefined }));
    const { scenarioKeys, questions } = assembleMockExam(normalized, ALL_SCENARIOS);
    const id = `guest-exam-${Date.now()}`;
    const exam: MockExamInProgress = {
      id,
      scenarioKeys,
      startedAt: new Date().toISOString(),
      completedAt: null,
      scaledScore: null,
      passed: null,
      domainBreakdown: null,
      timeLimitSec: MOCK_EXAM_TIME_LIMIT_SEC,
      answers: {},
      currentIndex: 0,
      remainingSec: MOCK_EXAM_TIME_LIMIT_SEC,
      questions: questions.map((q) => ({
        id: q.id,
        domainKey: q.domainKey,
        scenarioKey: q.scenarioKey,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
      })),
    };
    writeJson<ActiveExamStorage>(KEYS.activeExam, { exam, fullQuestions: questions });
    return exam;
  },

  async getActiveMockExam() {
    return getActiveGuestExam();
  },

  async saveMockExamProgress(examId, answers, currentIndex, remainingSec) {
    const active = readJson<ActiveExamStorage | null>(KEYS.activeExam, null);
    if (!active || active.exam.id !== examId) return;
    writeJson<ActiveExamStorage>(KEYS.activeExam, {
      ...active,
      exam: { ...active.exam, answers, currentIndex, remainingSec },
    });
  },

  async submitMockExam(examId, answers) {
    const active = readJson<ActiveExamStorage | null>(KEYS.activeExam, null);
    if (!active || active.exam.id !== examId) {
      throw new Error("No active exam found for this ID. It may have already been submitted.");
    }

    const graded: GradedMockExamQuestion[] = active.fullQuestions.map((q) => {
      const selected = answers[q.id] ?? [];
      const isCorrect =
        selected.length === q.correctIndexes.length &&
        [...selected].sort().every((v, i) => v === [...q.correctIndexes].sort()[i]);
      return {
        id: q.id,
        domainKey: q.domainKey,
        scenarioKey: q.scenarioKey,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        correctIndexes: q.correctIndexes,
        explanation: q.explanation,
        eli10: q.eli10,
        selectedIndexes: selected,
        isCorrect,
      };
    });

    const correctCount = graded.filter((g) => g.isCorrect).length;
    const scaledScore = estimateScaledScore(correctCount, graded.length);
    const domainBreakdown = computeDomainBreakdown(
      graded.map((g) => ({ domainKey: g.domainKey, isCorrect: g.isCorrect })),
    );

    const result: MockExamResult = {
      id: active.exam.id,
      scenarioKeys: active.exam.scenarioKeys,
      startedAt: active.exam.startedAt,
      completedAt: new Date().toISOString(),
      scaledScore,
      passed: isPassingScore(scaledScore),
      domainBreakdown,
      questions: graded,
    };

    const history = readJson<MockExamSummary[]>(KEYS.mockExams, []);
    history.unshift({
      id: result.id,
      scenarioKeys: result.scenarioKeys,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      scaledScore: result.scaledScore,
      passed: result.passed,
      domainBreakdown: result.domainBreakdown,
    });
    writeJson(KEYS.mockExams, history);
    writeJson(KEYS.activeExam, null);

    const attempts = readJson<AttemptRecord[]>(KEYS.attempts, []);
    for (const g of graded) {
      attempts.push({
        questionId: g.id,
        domainKey: g.domainKey,
        selectedIndexes: g.selectedIndexes,
        isCorrect: g.isCorrect,
        mode: "MOCK",
        mockExamId: result.id,
        createdAt: result.completedAt!,
      });
    }
    writeJson(KEYS.attempts, attempts);
    await localProgressClient.pingStudyLog();

    return result;
  },

  async deleteMockExam(examId) {
    const history = readJson<MockExamSummary[]>(KEYS.mockExams, []);
    writeJson(
      KEYS.mockExams,
      history.filter((h) => h.id !== examId),
    );
    const active = readJson<ActiveExamStorage | null>(KEYS.activeExam, null);
    if (active?.exam.id === examId) writeJson(KEYS.activeExam, null);
  },

  async pingStudyLog() {
    const log = readJson<string[]>(KEYS.studyLog, []);
    const today = todayKey();
    if (!log.includes(today)) {
      log.push(today);
      writeJson(KEYS.studyLog, log);
    }
  },

  async getStudyLogDates() {
    return readJson<string[]>(KEYS.studyLog, []);
  },

  async getExerciseAttempts() {
    return readJson<ExerciseAttemptRecord[]>(KEYS.exerciseAttempts, []);
  },

  async recordExerciseAttempt({ itemId, isCorrect }) {
    const domainKey = EXERCISE_ITEM_DOMAIN[itemId];
    if (!domainKey) throw new Error(`Unknown exercise item: ${itemId}`);
    const list = readJson<ExerciseAttemptRecord[]>(KEYS.exerciseAttempts, []);
    list.push({ itemId, domainKey, isCorrect, createdAt: new Date().toISOString() });
    writeJson(KEYS.exerciseAttempts, list);
    await localProgressClient.pingStudyLog();
  },

  async getViewedOverviews() {
    return readJson<ViewedOverviews>(KEYS.viewedOverviews, { domainKeys: [], scenarioKeys: [] });
  },

  async markOverviewViewed(itemType, key) {
    const viewed = readJson<ViewedOverviews>(KEYS.viewedOverviews, { domainKeys: [], scenarioKeys: [] });
    if (itemType === "DOMAIN") {
      const domainKey = key as DomainKey;
      if (!viewed.domainKeys.includes(domainKey)) viewed.domainKeys.push(domainKey);
    } else {
      const scenarioKey = key as ScenarioKey;
      if (!viewed.scenarioKeys.includes(scenarioKey)) viewed.scenarioKeys.push(scenarioKey);
    }
    writeJson(KEYS.viewedOverviews, viewed);
  },

  async getActivePracticeSession() {
    return readJson<ActivePracticeSession | null>(KEYS.activePracticeSession, null);
  },

  async startPracticeSession(questionIds, filters) {
    const id = `guest-practice-${Date.now()}`;
    const session: ActivePracticeSession = { id, questionIds, currentIndex: 0, correctCount: 0, filters };
    writeJson(KEYS.activePracticeSession, session);
    return { id };
  },

  async updatePracticeSessionProgress(id, input) {
    const session = readJson<ActivePracticeSession | null>(KEYS.activePracticeSession, null);
    if (!session || session.id !== id) return;
    writeJson<ActivePracticeSession>(KEYS.activePracticeSession, { ...session, ...input });
  },

  async completePracticeSession(id) {
    const session = readJson<ActivePracticeSession | null>(KEYS.activePracticeSession, null);
    if (session?.id === id) writeJson(KEYS.activePracticeSession, null);
  },
};

export function getActiveGuestExam(): MockExamInProgress | null {
  const active = readJson<ActiveExamStorage | null>(KEYS.activeExam, null);
  return active?.exam ?? null;
}

export function clearGuestData(): void {
  for (const key of Object.values(KEYS)) window.localStorage.removeItem(key);
}
