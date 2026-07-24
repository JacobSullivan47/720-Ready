import { describe, expect, it } from "vitest";
import { domains } from "@/content/domains";
import type { BankQuestion } from "./scoring";
import {
  MOCK_EXAM_SCENARIO_COUNT,
  PASSING_SCALED_SCORE,
  SCALED_SCORE_MAX,
  SCALED_SCORE_MIN,
  TOTAL_MOCK_QUESTIONS,
  assembleMockExam,
  computeDomainBreakdown,
  computeDomainQuestionCounts,
  estimateScaledScore,
  isPassingScore,
  pickRandomScenarios,
  shuffle,
} from "./scoring";

// Deterministic seeded PRNG (mulberry32) so exam-assembly tests are stable.
function seededRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALL_SCENARIOS = [
  "CUSTOMER_SUPPORT_AGENT",
  "CODE_GENERATION_CLAUDE_CODE",
  "MULTI_AGENT_RESEARCH",
  "DEVELOPER_PRODUCTIVITY_TOOLS",
  "CLAUDE_CODE_CI_CD",
  "STRUCTURED_DATA_EXTRACTION",
] as const;

function makeBank(perDomain: number): BankQuestion[] {
  const bank: BankQuestion[] = [];
  for (const d of domains) {
    for (let i = 0; i < perDomain; i++) {
      bank.push({
        id: `${d.key}-${i}`,
        domainKey: d.key,
        scenarioKey: ALL_SCENARIOS[i % ALL_SCENARIOS.length],
        type: "SINGLE",
        prompt: `Question ${i} for ${d.key}`,
        options: ["a", "b", "c", "d"],
        correctIndexes: [0],
        explanation: "because",
        eli10: "because, simply",
      });
    }
  }
  return bank;
}

describe("computeDomainQuestionCounts", () => {
  it("sums to the requested total", () => {
    const counts = computeDomainQuestionCounts(60);
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(60);
  });

  it("gives every domain a non-negative integer count", () => {
    const counts = computeDomainQuestionCounts(60);
    for (const count of Object.values(counts)) {
      expect(Number.isInteger(count)).toBe(true);
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  it("allocates more questions to higher-weighted domains", () => {
    const counts = computeDomainQuestionCounts(60);
    // Agentic Architecture (27%) should get more than Context Management (15%).
    expect(counts.AGENTIC_ARCHITECTURE).toBeGreaterThan(counts.CONTEXT_MANAGEMENT);
  });

  it("still sums correctly for a total not evenly divisible by domain weights", () => {
    const counts = computeDomainQuestionCounts(17);
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(17);
  });
});

describe("estimateScaledScore", () => {
  it("maps 0 correct to the minimum score", () => {
    expect(estimateScaledScore(0, 60)).toBe(SCALED_SCORE_MIN);
  });

  it("maps all correct to the maximum score", () => {
    expect(estimateScaledScore(60, 60)).toBe(SCALED_SCORE_MAX);
  });

  it("is monotonically non-decreasing in the number correct", () => {
    let prev = -Infinity;
    for (let correct = 0; correct <= 60; correct++) {
      const score = estimateScaledScore(correct, 60);
      expect(score).toBeGreaterThanOrEqual(prev);
      prev = score;
    }
  });

  it("handles a zero-question edge case without dividing by zero", () => {
    expect(estimateScaledScore(0, 0)).toBe(SCALED_SCORE_MIN);
  });
});

describe("isPassingScore", () => {
  it("matches the documented passing bar", () => {
    expect(isPassingScore(PASSING_SCALED_SCORE)).toBe(true);
    expect(isPassingScore(PASSING_SCALED_SCORE - 10)).toBe(false);
  });
});

describe("computeDomainBreakdown", () => {
  it("tallies correct/total per domain", () => {
    const breakdown = computeDomainBreakdown([
      { domainKey: "AGENTIC_ARCHITECTURE", isCorrect: true },
      { domainKey: "AGENTIC_ARCHITECTURE", isCorrect: false },
      { domainKey: "CONTEXT_MANAGEMENT", isCorrect: true },
    ]);
    expect(breakdown.AGENTIC_ARCHITECTURE).toEqual({ correct: 1, total: 2 });
    expect(breakdown.CONTEXT_MANAGEMENT).toEqual({ correct: 1, total: 1 });
  });
});

describe("shuffle", () => {
  it("preserves all elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input, seededRng(1));
    expect(result.slice().sort()).toEqual(input.slice().sort());
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    shuffle(input, seededRng(1));
    expect(input).toEqual([1, 2, 3]);
  });

  it("is deterministic for a given seed", () => {
    const a = shuffle([1, 2, 3, 4, 5], seededRng(42));
    const b = shuffle([1, 2, 3, 4, 5], seededRng(42));
    expect(a).toEqual(b);
  });
});

describe("pickRandomScenarios", () => {
  it("picks the requested number of unique scenarios", () => {
    const picked = pickRandomScenarios([...ALL_SCENARIOS], MOCK_EXAM_SCENARIO_COUNT, seededRng(7));
    expect(picked).toHaveLength(MOCK_EXAM_SCENARIO_COUNT);
    expect(new Set(picked).size).toBe(MOCK_EXAM_SCENARIO_COUNT);
  });
});

describe("assembleMockExam", () => {
  it("assembles exactly 60 questions from a sufficiently large bank", () => {
    const bank = makeBank(20);
    const { questions, scenarioKeys } = assembleMockExam(bank, [...ALL_SCENARIOS], seededRng(3));
    expect(questions).toHaveLength(TOTAL_MOCK_QUESTIONS);
    expect(scenarioKeys).toHaveLength(MOCK_EXAM_SCENARIO_COUNT);
  });

  it("never selects the same question twice", () => {
    const bank = makeBank(20);
    const { questions } = assembleMockExam(bank, [...ALL_SCENARIOS], seededRng(9));
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("respects each domain's computed quota", () => {
    const bank = makeBank(20);
    const counts = computeDomainQuestionCounts(TOTAL_MOCK_QUESTIONS);
    const { questions } = assembleMockExam(bank, [...ALL_SCENARIOS], seededRng(11));
    for (const d of domains) {
      const actual = questions.filter((q) => q.domainKey === d.key).length;
      expect(actual).toBe(counts[d.key]);
    }
  });

  it("throws when a domain's bank cannot fill its quota", () => {
    const bank = makeBank(1); // far fewer than any domain's quota
    expect(() => assembleMockExam(bank, [...ALL_SCENARIOS], seededRng(1))).toThrow();
  });

  it("is deterministic given the same seed", () => {
    const bank = makeBank(20);
    const a = assembleMockExam(bank, [...ALL_SCENARIOS], seededRng(123));
    const b = assembleMockExam(bank, [...ALL_SCENARIOS], seededRng(123));
    expect(a.questions.map((q) => q.id)).toEqual(b.questions.map((q) => q.id));
    expect(a.scenarioKeys).toEqual(b.scenarioKeys);
  });
});
