import type { Metadata } from "next";
import { GlossaryClient } from "./GlossaryClient";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Every term from the Claude Certified Architect – Foundations (CCA-F) exam domains, alphabetized and searchable.",
};

export default function GlossaryPage() {
  return <GlossaryClient />;
}
