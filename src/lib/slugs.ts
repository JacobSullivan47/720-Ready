import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import type { DomainKey, ScenarioKey } from "@/content/types";

export function domainSlug(key: DomainKey): string {
  return key.toLowerCase().replace(/_/g, "-");
}

export function scenarioSlug(key: ScenarioKey): string {
  return key.toLowerCase().replace(/_/g, "-");
}

export function domainKeyFromSlug(slug: string): DomainKey | null {
  const key = slug.toUpperCase().replace(/-/g, "_") as DomainKey;
  return domains.some((d) => d.key === key) ? key : null;
}

export function scenarioKeyFromSlug(slug: string): ScenarioKey | null {
  const key = slug.toUpperCase().replace(/-/g, "_") as ScenarioKey;
  return scenarios.some((s) => s.key === key) ? key : null;
}
