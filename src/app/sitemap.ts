import type { MetadataRoute } from "next";
import { domains } from "@/content/domains";
import { scenarios } from "@/content/scenarios";
import { domainSlug, scenarioSlug } from "@/lib/slugs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = [
  "/",
  "/study",
  "/study/overview",
  "/study/flashcards",
  "/study/exercises",
  "/practice",
  "/exam",
  "/glossary",
  "/about",
  "/login",
  "/register",
  "/legal/privacy",
  "/legal/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
  }));

  const domainEntries = domains.map((d) => ({
    url: `${siteUrl}/study/domains/${domainSlug(d.key)}`,
  }));

  const scenarioEntries = scenarios.map((s) => ({
    url: `${siteUrl}/study/scenarios/${scenarioSlug(s.key)}`,
  }));

  return [...staticEntries, ...domainEntries, ...scenarioEntries];
}
