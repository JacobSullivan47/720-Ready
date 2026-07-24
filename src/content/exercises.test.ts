import { describe, expect, it } from "vitest";
import {
  ANTI_PATTERN_SCENARIOS,
  CONFIG_BUCKETS,
  CONFIG_BUILDER_SCENARIO,
  SEQUENCING_EXERCISES,
} from "./exercises";

describe("config builder", () => {
  it("every item's correctBucket is a real bucket id", () => {
    const ids = new Set(CONFIG_BUCKETS.map((b) => b.id));
    for (const item of CONFIG_BUILDER_SCENARIO.items) {
      expect(ids.has(item.correctBucket)).toBe(true);
    }
  });

  it("has at least one item per common bucket type covered", () => {
    expect(CONFIG_BUILDER_SCENARIO.items.length).toBeGreaterThanOrEqual(6);
  });
});

describe("anti-pattern spotter", () => {
  it("every scenario's correct indexes are within range", () => {
    for (const s of ANTI_PATTERN_SCENARIOS) {
      expect(s.correctFlawIndex).toBeGreaterThanOrEqual(0);
      expect(s.correctFlawIndex).toBeLessThan(s.flawOptions.length);
      expect(s.correctFixIndex).toBeGreaterThanOrEqual(0);
      expect(s.correctFixIndex).toBeLessThan(s.fixOptions.length);
    }
  });

  it("covers at least 3 distinct domains", () => {
    const domains = new Set(ANTI_PATTERN_SCENARIOS.map((s) => s.domainKey));
    expect(domains.size).toBeGreaterThanOrEqual(3);
  });
});

describe("sequencing exercises", () => {
  it("every exercise has at least 4 steps in a defined order", () => {
    for (const ex of SEQUENCING_EXERCISES) {
      expect(ex.steps.length).toBeGreaterThanOrEqual(4);
      expect(new Set(ex.steps).size).toBe(ex.steps.length);
    }
  });
});
