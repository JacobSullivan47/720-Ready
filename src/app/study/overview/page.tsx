import type { Metadata } from "next";
import { StudyOverviewClient } from "./StudyOverviewClient";

export const metadata: Metadata = {
  title: "Concept Overviews",
  description:
    "Domain and scenario overviews for the Claude Certified Architect – Foundations exam: key knowledge, key skills, and anti-patterns.",
};

export default function StudyOverviewPage() {
  return <StudyOverviewClient />;
}
