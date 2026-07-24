import { domains } from "@/content/domains";
import type { DomainKey, ScenarioKey, QuestionSeed } from "@/content/types";

export const TOTAL_MOCK_QUESTIONS = 60;
export const MOCK_EXAM_SCENARIO_COUNT = 4;
export const MOCK_EXAM_TIME_LIMIT_SEC = 120 * 60;
export const SCALED_SCORE_MIN = 100;
export const SCALED_SCORE_MAX = 1000;
export const PASSING_SCALED_SCORE = 720;

/**
 * Largest-remainder apportionment: turns domain weight percentages into
 * integer question counts that sum to exactly `total`, distributing
 * rounding remainders to the domains with the largest fractional part.
 */
export function computeDomainQuestionCounts(
  total: number = TOTAL_MOCK_QUESTIONS,
): Record<DomainKey, number> {
  const raw = domains.map((d) => ({
    key: d.key,
    exact: (d.weightPct / 100) * total,
  }));

  const floors = raw.map((r) => ({ key: r.key, floor: Math.floor(r.exact), remainder: r.exact - Math.floor(r.exact) }));
  const allocated = floors.reduce((sum, f) => sum + f.floor, 0);
  let remaining = total - allocated;

  const byRemainderDesc = [...floors].sort((a, b) => b.remainder - a.remainder);
  const counts = new Map(floors.map((f) => [f.key, f.floor]));

  for (let i = 0; i < byRemainderDesc.length && remaining > 0; i++, remaining--) {
    const key = byRemainderDesc[i].key;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Object.fromEntries(counts) as Record<DomainKey, number>;
}

/** Linear estimate mapping raw correct/total onto the 100-1000 scale. Clearly
 * labeled as an *estimate* in the UI — the real exam's scaling formula isn't
 * publicly disclosed. */
export function estimateScaledScore(correct: number, total: number): number {
  if (total <= 0) return SCALED_SCORE_MIN;
  const fraction = Math.max(0, Math.min(1, correct / total));
  const raw = SCALED_SCORE_MIN + fraction * (SCALED_SCORE_MAX - SCALED_SCORE_MIN);
  return Math.round(raw / 10) * 10;
}

export function isPassingScore(scaledScore: number): boolean {
  return scaledScore >= PASSING_SCALED_SCORE;
}

export interface DomainBreakdownEntry {
  correct: number;
  total: number;
}
export type DomainBreakdown = Partial<Record<DomainKey, DomainBreakdownEntry>>;

export function computeDomainBreakdown(
  results: { domainKey: DomainKey; isCorrect: boolean }[],
): DomainBreakdown {
  const breakdown: DomainBreakdown = {};
  for (const r of results) {
    const entry = breakdown[r.domainKey] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (r.isCorrect) entry.correct += 1;
    breakdown[r.domainKey] = entry;
  }
  return breakdown;
}

export type RandomFn = () => number;

/** Fisher-Yates shuffle. Accepts an injectable RNG for deterministic tests. */
export function shuffle<T>(items: T[], rng: RandomFn = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandomScenarios(
  allScenarios: ScenarioKey[],
  count: number = MOCK_EXAM_SCENARIO_COUNT,
  rng: RandomFn = Math.random,
): ScenarioKey[] {
  return shuffle(allScenarios, rng).slice(0, count);
}

export interface BankQuestion extends QuestionSeed {
  id: string;
}

/**
 * Assembles a 60-question mock exam: draws `MOCK_EXAM_SCENARIO_COUNT` of the
 * 6 scenarios, then fills each domain's quota (per computeDomainQuestionCounts)
 * preferring questions tagged with one of the drawn scenarios, falling back
 * to untagged/other-scenario questions in that domain if there aren't enough
 * scenario-tagged ones. Throws if a domain's bank can't fill its quota at all.
 */
export function assembleMockExam(
  bank: BankQuestion[],
  allScenarios: ScenarioKey[],
  rng: RandomFn = Math.random,
): { scenarioKeys: ScenarioKey[]; questions: BankQuestion[] } {
  const scenarioKeys = pickRandomScenarios(allScenarios, MOCK_EXAM_SCENARIO_COUNT, rng);
  const scenarioSet = new Set(scenarioKeys);
  const counts = computeDomainQuestionCounts(TOTAL_MOCK_QUESTIONS);

  const selected: BankQuestion[] = [];

  for (const domainKey of Object.keys(counts) as DomainKey[]) {
    const need = counts[domainKey];
    if (need === 0) continue;

    const domainQuestions = bank.filter((q) => q.domainKey === domainKey);
    if (domainQuestions.length < need) {
      throw new Error(
        `Not enough questions in domain ${domainKey}: need ${need}, have ${domainQuestions.length}`,
      );
    }

    const preferred = shuffle(
      domainQuestions.filter((q) => q.scenarioKey && scenarioSet.has(q.scenarioKey)),
      rng,
    );
    const rest = shuffle(
      domainQuestions.filter((q) => !(q.scenarioKey && scenarioSet.has(q.scenarioKey))),
      rng,
    );

    selected.push(...[...preferred, ...rest].slice(0, need));
  }

  return { scenarioKeys, questions: shuffle(selected, rng) };
}
