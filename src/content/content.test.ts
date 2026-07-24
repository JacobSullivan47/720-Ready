import { describe, expect, it } from "vitest";
import { domains } from "./domains";
import { scenarios } from "./scenarios";
import { flashcards as agenticArchitectureCards } from "./flashcards/agentic-architecture";
import { flashcards as toolDesignMcpCards } from "./flashcards/tool-design-mcp";
import { flashcards as claudeCodeWorkflowsCards } from "./flashcards/claude-code-workflows";
import { flashcards as promptEngineeringCards } from "./flashcards/prompt-engineering";
import { flashcards as contextManagementCards } from "./flashcards/context-management";
import { questions as agenticArchitectureQuestions } from "./questions/agentic-architecture";
import { questions as toolDesignMcpQuestions } from "./questions/tool-design-mcp";
import { questions as claudeCodeWorkflowsQuestions } from "./questions/claude-code-workflows";
import { questions as promptEngineeringQuestions } from "./questions/prompt-engineering";
import { questions as contextManagementQuestions } from "./questions/context-management";
import type { DomainKey, FlashcardSeed, QuestionSeed } from "./types";

const flashcardsByDomain: Record<DomainKey, FlashcardSeed[]> = {
  AGENTIC_ARCHITECTURE: agenticArchitectureCards,
  TOOL_DESIGN_MCP: toolDesignMcpCards,
  CLAUDE_CODE_WORKFLOWS: claudeCodeWorkflowsCards,
  PROMPT_ENGINEERING: promptEngineeringCards,
  CONTEXT_MANAGEMENT: contextManagementCards,
};

const questionsByDomain: Record<DomainKey, QuestionSeed[]> = {
  AGENTIC_ARCHITECTURE: agenticArchitectureQuestions,
  TOOL_DESIGN_MCP: toolDesignMcpQuestions,
  CLAUDE_CODE_WORKFLOWS: claudeCodeWorkflowsQuestions,
  PROMPT_ENGINEERING: promptEngineeringQuestions,
  CONTEXT_MANAGEMENT: contextManagementQuestions,
};

describe("domain overviews", () => {
  it("covers exactly the 5 documented domains, weights summing to 100", () => {
    expect(domains).toHaveLength(5);
    const totalWeight = domains.reduce((sum, d) => sum + d.weightPct, 0);
    expect(totalWeight).toBe(100);
  });

  it("every domain has non-empty knowledge/skills/anti-pattern lists", () => {
    for (const d of domains) {
      expect(d.keyKnowledge.length).toBeGreaterThan(0);
      expect(d.keySkills.length).toBeGreaterThan(0);
      expect(d.antiPatterns.length).toBeGreaterThan(0);
      expect(d.examStyleNote.length).toBeGreaterThan(0);
    }
  });
});

describe("scenario overviews", () => {
  it("covers exactly the 6 documented scenarios", () => {
    expect(scenarios).toHaveLength(6);
  });
});

describe("seed content volume (per README commitment: 20+ cards / 15+ questions per domain)", () => {
  for (const domain of domains) {
    const cards = flashcardsByDomain[domain.key];
    const questions = questionsByDomain[domain.key];

    it(`${domain.key} has at least 20 flashcards, all tagged with this domain`, () => {
      expect(cards.length).toBeGreaterThanOrEqual(20);
      for (const c of cards) expect(c.domainKey).toBe(domain.key);
    });

    it(`${domain.key} has at least 15 questions, all tagged with this domain`, () => {
      expect(questions.length).toBeGreaterThanOrEqual(15);
      for (const q of questions) expect(q.domainKey).toBe(domain.key);
    });
  }
});

describe("question integrity", () => {
  const allQuestions = Object.values(questionsByDomain).flat();

  it("every question has at least 4 options", () => {
    for (const q of allQuestions) {
      expect(q.options.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("SINGLE questions have exactly one correct index; MULTI have exactly two", () => {
    for (const q of allQuestions) {
      if (q.type === "SINGLE") {
        expect(q.correctIndexes).toHaveLength(1);
      } else {
        expect(q.correctIndexes).toHaveLength(2);
      }
    }
  });

  it("every correct index is within range and indexes are unique", () => {
    for (const q of allQuestions) {
      expect(new Set(q.correctIndexes).size).toBe(q.correctIndexes.length);
      for (const idx of q.correctIndexes) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(q.options.length);
      }
    }
  });

  it("every question has a non-empty explanation and eli10 explanation", () => {
    for (const q of allQuestions) {
      expect(q.explanation.trim().length).toBeGreaterThan(0);
      expect(q.eli10.trim().length).toBeGreaterThan(0);
    }
  });

  it("no two questions in the whole bank share an identical prompt", () => {
    const prompts = allQuestions.map((q) => q.prompt.trim());
    expect(new Set(prompts).size).toBe(prompts.length);
  });
});

describe("flashcard integrity", () => {
  const allCards = Object.values(flashcardsByDomain).flat();

  it("every card has non-empty term/definition/example", () => {
    for (const c of allCards) {
      expect(c.term.trim().length).toBeGreaterThan(0);
      expect(c.definition.trim().length).toBeGreaterThan(0);
      expect(c.example.trim().length).toBeGreaterThan(0);
    }
  });

  it("no duplicate terms within the same domain", () => {
    for (const domain of domains) {
      const terms = flashcardsByDomain[domain.key].map((c) => c.term.trim().toLowerCase());
      expect(new Set(terms).size).toBe(terms.length);
    }
  });
});
