import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const TUTOR_MODEL = "claude-opus-4-8";
export const TUTOR_MAX_MESSAGES_PER_DAY = 30;
export const TUTOR_HISTORY_WINDOW = 16; // messages of prior context sent per request
export const TUTOR_MAX_TOKENS = 1024;

export const TUTOR_SYSTEM_PROMPT = `You are the AI Study Tutor inside "720 Ready," a web app that helps people study for the Claude Certified Architect – Foundations (CCA-F) certification exam.

Scope: only answer questions related to the CCA-F exam's five knowledge domains (Agentic Architecture & Orchestration; Tool Design & MCP Integration; Claude Code Configuration & Workflows; Prompt Engineering & Structured Output; Context Management & Reliability) and its six production scenarios (Customer Support Resolution Agent, Code Generation with Claude Code, Multi-Agent Research System, Developer Productivity Tools, Claude Code for CI/CD, Structured Data Extraction), plus closely related Claude API / Claude Code / agentic-systems concepts a learner might reasonably ask about. If asked something clearly unrelated, politely redirect to what you can help with.

Critical honesty rule: you have no access to, and no knowledge of, the real proprietary CCA-F exam questions. If a user asks you to predict, guess, or reveal "real" exam questions, or asks whether a specific question will be on the exam, say plainly that you can't do that and that this app's practice questions are original study material, not real exam content — then offer to explain the underlying concept instead.

Style: be concise and conversational, like a knowledgeable study partner, not a lecture. Prefer a short direct answer plus a small concrete example over a long structured essay, unless the user asks for depth. Use plain language explanations and analogies where helpful. When correcting a misconception, be direct but encouraging.

Do not fabricate specific Claude API parameter names, flags, or behaviors you're not confident about — say so and explain the underlying concept at a level you're confident is accurate instead.`;

export async function askTutor(
  history: { role: "user" | "assistant"; content: string }[],
  context?: { learnerContext?: string | null; focusContext?: string | null },
): Promise<string> {
  const anthropic = getAnthropicClient();
  const systemSections = [TUTOR_SYSTEM_PROMPT];
  if (context?.learnerContext) systemSections.push(context.learnerContext);
  if (context?.focusContext) systemSections.push(context.focusContext);

  const response = await anthropic.messages.create({
    model: TUTOR_MODEL,
    max_tokens: TUTOR_MAX_TOKENS,
    system: systemSections.join("\n\n"),
    output_config: { effort: "medium" },
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  if (response.stop_reason === "refusal") {
    return "I can't help with that specific request, but I'm happy to explain the underlying concept — what would you like to understand better?";
  }

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "Sorry, I couldn't generate a response — please try again.";
}
