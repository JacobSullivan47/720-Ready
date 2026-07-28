"use client";

import type { SrsState } from "./srs";
import type {
  ActivePracticeSession,
  MockExamInProgress,
  MockExamResult,
  ProgressClient,
} from "./progress-types";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request to ${url} failed (${res.status})`);
  }
  return res.json();
}

export const remoteProgressClient: ProgressClient = {
  isGuest: false,

  async getAllCardStates() {
    return jsonFetch<Record<string, SrsState>>("/api/progress/cards");
  },

  async rateCard(cardId, rating) {
    return jsonFetch<SrsState>("/api/progress/cards", {
      method: "POST",
      body: JSON.stringify({ cardId, rating }),
    });
  },

  async getAttempts() {
    return jsonFetch("/api/progress/attempts");
  },

  async recordAttempt(input) {
    await jsonFetch("/api/progress/attempts", { method: "POST", body: JSON.stringify(input) });
  },

  async getBookmarks() {
    return jsonFetch("/api/progress/bookmarks");
  },

  async toggleBookmark(itemType, id) {
    const data = await jsonFetch<{ bookmarked: boolean }>("/api/progress/bookmarks", {
      method: "POST",
      body: JSON.stringify({ itemType, id }),
    });
    return data.bookmarked;
  },

  async getMockExamHistory() {
    return jsonFetch("/api/exam/history");
  },

  async getMockExamResult(examId) {
    const res = await fetch(`/api/exam/${examId}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Request to /api/exam/${examId} failed (${res.status})`);
    }
    return res.json() as Promise<MockExamResult>;
  },

  async getActiveMockExam() {
    const data = await jsonFetch<{ exam: MockExamInProgress | null }>("/api/exam/active");
    return data.exam;
  },

  async startMockExam() {
    return jsonFetch("/api/exam/start", { method: "POST" });
  },

  async saveMockExamProgress(examId, answers, currentIndex, remainingSec) {
    await jsonFetch(`/api/exam/${examId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ answers, currentIndex, remainingSec }),
    });
  },

  async submitMockExam(examId, answers) {
    return jsonFetch(`/api/exam/${examId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  async deleteMockExam(examId) {
    await jsonFetch(`/api/exam/${examId}`, { method: "DELETE" });
  },

  async pingStudyLog() {
    await jsonFetch("/api/progress/study-log", { method: "POST" });
  },

  async getStudyLogDates() {
    return jsonFetch("/api/progress/study-log");
  },

  async getExerciseAttempts() {
    return jsonFetch("/api/progress/exercises");
  },

  async recordExerciseAttempt(input) {
    await jsonFetch("/api/progress/exercises", { method: "POST", body: JSON.stringify(input) });
  },

  async getViewedOverviews() {
    return jsonFetch("/api/progress/overviews");
  },

  async markOverviewViewed(itemType, key) {
    await jsonFetch("/api/progress/overviews", { method: "POST", body: JSON.stringify({ itemType, key }) });
  },

  async getActivePracticeSession() {
    const data = await jsonFetch<{ session: ActivePracticeSession | null }>("/api/progress/practice-session");
    return data.session;
  },

  async startPracticeSession(questionIds, filters) {
    return jsonFetch("/api/progress/practice-session", {
      method: "POST",
      body: JSON.stringify({ questionIds, filters }),
    });
  },

  async updatePracticeSessionProgress(id, input) {
    await jsonFetch(`/api/progress/practice-session/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async completePracticeSession(id) {
    await jsonFetch(`/api/progress/practice-session/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });
  },
};
