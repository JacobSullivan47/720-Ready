"use client";

import type { SrsState } from "./srs";
import type { ProgressClient } from "./progress-types";

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

  async startMockExam() {
    return jsonFetch("/api/exam/start", { method: "POST" });
  },

  async submitMockExam(examId, answers) {
    return jsonFetch(`/api/exam/${examId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  async pingStudyLog() {
    await jsonFetch("/api/progress/study-log", { method: "POST" });
  },

  async getStudyLogDates() {
    return jsonFetch("/api/progress/study-log");
  },
};
