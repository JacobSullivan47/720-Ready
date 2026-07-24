"use client";

import type { DomainKey, Difficulty, QuestionType, ScenarioKey } from "@/content/types";

export interface BankFlashcard {
  id: string;
  domainKey: DomainKey;
  scenarioKey: ScenarioKey | null;
  term: string;
  definition: string;
  example: string;
  difficulty: Difficulty;
  sortOrder: number;
}

export interface BankQuestion {
  id: string;
  domainKey: DomainKey;
  scenarioKey: ScenarioKey | null;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIndexes: number[];
  explanation: string;
  eli10: string;
  difficulty: Difficulty;
  sortOrder: number;
}

export interface ContentBank {
  flashcards: BankFlashcard[];
  questions: BankQuestion[];
}

let cached: ContentBank | null = null;
let inFlight: Promise<ContentBank> | null = null;

export async function fetchContentBank(): Promise<ContentBank> {
  if (cached) return cached;
  if (inFlight) return inFlight;

  inFlight = fetch("/api/content/bank")
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load content bank (${res.status})`);
      return res.json();
    })
    .then((data: ContentBank) => {
      cached = data;
      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
