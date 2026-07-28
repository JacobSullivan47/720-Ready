// Original interactive-exercise content for this app. Not copied from any
// source — see /about for licensing of the underlying concepts.
import type { DomainKey } from "./types";

// ---------------------------------------------------------------------------
// 1. CLAUDE.md / .claude/rules/ config builder — categorization exercise
// ---------------------------------------------------------------------------

export type ConfigBucketId =
  | "ROOT_CLAUDE_MD"
  | "NESTED_CLAUDE_MD"
  | "RULE_FILE_SCOPED"
  | "MCP_LOCAL_SCOPE"
  | "MCP_PROJECT_SCOPE"
  | "MCP_USER_SCOPE"
  | "HOOK_OR_PERMISSION";

export interface ConfigBucket {
  id: ConfigBucketId;
  label: string;
  description: string;
}

export const CONFIG_BUCKETS: ConfigBucket[] = [
  {
    id: "ROOT_CLAUDE_MD",
    label: "Root CLAUDE.md",
    description: "Repo-wide context every session should load: conventions, build commands, architecture.",
  },
  {
    id: "NESTED_CLAUDE_MD",
    label: "Nested CLAUDE.md (subdirectory)",
    description: "Extra detail relevant to one part of the codebase, supplementing the root file.",
  },
  {
    id: "RULE_FILE_SCOPED",
    label: "Rule file, glob-scoped",
    description: "A focused rule that should only load when working on files matching a specific pattern.",
  },
  {
    id: "MCP_LOCAL_SCOPE",
    label: "MCP server — local scope",
    description: "Only this person, only in this project. Good for credentials or experiments.",
  },
  {
    id: "MCP_PROJECT_SCOPE",
    label: "MCP server — project scope (.mcp.json)",
    description: "Checked into the repo; every teammate who clones it gets this server.",
  },
  {
    id: "MCP_USER_SCOPE",
    label: "MCP server — user scope",
    description: "Follows one person across every project they work on.",
  },
  {
    id: "HOOK_OR_PERMISSION",
    label: "Hook / permission rule (enforced, not just written down)",
    description: "For anything that must never happen — not advisory context, actual enforcement.",
  },
];

export interface ConfigItem {
  id: string;
  text: string;
  correctBucket: ConfigBucketId;
  rationale: string;
}

export const CONFIG_BUILDER_SCENARIO = {
  title: "Setting up Claude Code for a payments-team monorepo",
  intro:
    "Your team just adopted Claude Code across a monorepo with a payments/ service and a marketing-site/ frontend. Sort each piece of configuration into where it actually belongs.",
  items: [
    {
      id: "1",
      text: "\"This repo uses pnpm; run `pnpm test` before considering any task done.\"",
      correctBucket: "ROOT_CLAUDE_MD",
      rationale:
        "A build/test command that applies to the whole repo is exactly what the root CLAUDE.md is for — every session should load it.",
    },
    {
      id: "2",
      text: "\"All new tables in payments/ require a reviewed migration with a rollback script.\"",
      correctBucket: "NESTED_CLAUDE_MD",
      rationale:
        "This convention only matters inside payments/, so a nested CLAUDE.md there adds it without cluttering every session in marketing-site/.",
    },
    {
      id: "3",
      text: "\"Test files should mock the payment gateway, never call it directly, even in CI.\"",
      correctBucket: "RULE_FILE_SCOPED",
      rationale:
        "This is a narrow rule about test-writing specifically — scoping it to a glob like payments/**/*.test.ts keeps it out of context when you're not touching tests.",
    },
    {
      id: "4",
      text: "An experimental internal MCP server one engineer is still debugging, not ready to share.",
      correctBucket: "MCP_LOCAL_SCOPE",
      rationale:
        "Local scope is per-user, per-project — perfect for something not ready for the rest of the team yet.",
    },
    {
      id: "5",
      text: "A ticketing-system MCP server the whole team relies on for this project.",
      correctBucket: "MCP_PROJECT_SCOPE",
      rationale:
        "Checked into .mcp.json so everyone who clones the repo gets it automatically — a team-shared, project-specific tool.",
    },
    {
      id: "6",
      text: "A personal note-taking MCP server one engineer likes to use on every project they touch.",
      correctBucket: "MCP_USER_SCOPE",
      rationale: "User scope follows that one person across all their projects, not tied to this repo.",
    },
    {
      id: "7",
      text: "\"Never let the agent run a database migration against production without a human approving it first.\"",
      correctBucket: "HOOK_OR_PERMISSION",
      rationale:
        "This must hold every single time — that's a job for a hook or permission rule, not a sentence in CLAUDE.md that the model merely tries to follow.",
    },
  ] as ConfigItem[],
};

// ---------------------------------------------------------------------------
// 2. Anti-pattern spotter
// ---------------------------------------------------------------------------

export interface AntiPatternScenario {
  id: string;
  domainKey: DomainKey;
  title: string;
  setup: string;
  flawOptions: string[];
  correctFlawIndex: number;
  /** Shown after the user picks a flaw option — the fuller reasoning, kept
   * out of the option text itself so every option reads as a similarly
   * short, punchy claim instead of the correct one being visibly longer. */
  flawRationale: string;
  fixOptions: string[];
  correctFixIndex: number;
  fixRationale: string;
}

export const ANTI_PATTERN_SCENARIOS: AntiPatternScenario[] = [
  {
    id: "dry-run",
    domainKey: "TOOL_DESIGN_MCP",
    title: "Deleting a workspace",
    setup:
      "A team builds a `delete_workspace(workspace_id, dry_run: boolean)` tool. Their reasoning: the agent can call it with `dry_run: true` first to preview, then call it again with `dry_run: false` to actually delete.",
    flawOptions: [
      "The tool name is too generic for the model to understand.",
      "Nothing stops the model from calling it directly with dry_run: false.",
      "The workspace_id parameter should be a free-text string instead of an identifier.",
      "The tool doesn't return enough information in its response.",
    ],
    correctFlawIndex: 1,
    flawRationale:
      "The 'preview first' behavior is a suggestion, not a guarantee — the model can call it with dry_run: false immediately, skipping the preview entirely. Nothing about the tool's design forces the two-step sequence.",
    fixOptions: [
      "Rename the parameter from dry_run to confirm to make the intent clearer.",
      "Add a warning to the tool description telling the model to always preview first.",
      "Split it into a preview tool that issues a one-time token, and an execute tool that requires it.",
      "Require the user to type the workspace name to confirm, checked only in the system prompt.",
    ],
    correctFixIndex: 2,
    fixRationale:
      "This removes the skippable parameter entirely — there's no dry_run flag to flip, since executing requires a confirmation token that only the preview step can produce. Renaming the parameter or adding a description warning are still just as skippable as before.",
  },
  {
    id: "escalation-counter",
    domainKey: "AGENTIC_ARCHITECTURE",
    title: "Support agent escalation policy",
    setup:
      "A customer support agent is configured to escalate to a human 'after 3 failed tool calls in a row', regardless of what those tool calls were trying to do.",
    flawOptions: [
      "Three is an arbitrary number that should probably be five instead.",
      "Escalation should be based on the failure's category and impact, not a retry count.",
      "The agent should never escalate to a human under any circumstances.",
      "The agent should escalate after only 1 failed tool call instead.",
    ],
    correctFlawIndex: 1,
    flawRationale:
      "A policy exception or an action needing authority the agent lacks should escalate immediately regardless of retry count, while a routine, recoverable failure might not need to escalate at all even after several retries. The rule is tracking the wrong signal.",
    fixOptions: [
      "Lower the threshold to 2 failed calls instead of 3.",
      "Trigger escalation based on what actually happened, with a structured handoff summary.",
      "Have the agent apologize and keep retrying the same tool call indefinitely.",
      "Remove the human escalation path entirely and let the agent always resolve issues itself.",
    ],
    correctFixIndex: 1,
    fixRationale:
      "Real triggers include a policy exception, a regulated approval, or an action beyond the agent's authority — not a raw retry tally — and the human needs a structured summary of root cause and actions already taken to act immediately, not just the raw transcript.",
  },
  {
    id: "stale-resume",
    domainKey: "CONTEXT_MANAGEMENT",
    title: "Returning customer, old ticket",
    setup:
      "A user returns to a support chat after two days. The application resumes the old conversation transcript as-is and adds one line to the system prompt: 'Prefer more recent information if the user mentions anything new.'",
    flawOptions: [
      "The transcript should be deleted entirely and the user should start over with no context.",
      "Old tool results, like a prior order status, may now be stale.",
      "The system prompt line is too short and should be several paragraphs long instead.",
      "The application should re-call every single tool from the entire prior conversation before responding.",
    ],
    correctFlawIndex: 1,
    flawRationale:
      "A soft prompt instruction doesn't fix staleness by itself — the application needs to actually re-fetch current state before making any claims. Asking the model to 'prefer recent info' gives it nothing new to prefer if nothing new was fetched.",
    fixOptions: [
      "Add more instructions to the system prompt about being careful with old data.",
      "Start from the prior summary, but explicitly re-fetch anything likely to be stale.",
      "Re-run every tool call from the previous session again from scratch.",
      "Ignore the previous conversation and ask the user to repeat everything.",
    ],
    correctFixIndex: 1,
    fixRationale:
      "Fresh state, like a current order status, should be re-fetched and marked authoritative over older tool results left in the transcript, rather than trusting whatever was fetched days ago or re-running everything indiscriminately.",
  },
  {
    id: "tool-choice-any",
    domainKey: "PROMPT_ENGINEERING",
    title: "Forcing a tool call",
    setup:
      "A developer wants Claude to always look something up before answering a factual question, so they set `tool_choice` to `{\"type\": \"auto\"}`, assuming this forces at least one tool call.",
    flawOptions: [
      "`auto` lets the model decide whether to use a tool at all.",
      "tool_choice has no effect on model behavior at all.",
      "The system prompt should have been used instead of tool_choice entirely.",
      "`auto` forces every available tool to be called at once.",
    ],
    correctFlawIndex: 0,
    flawRationale:
      "Forcing a tool call needs `any` (some tool, model's choice which one) or a named tool (that exact one) — `auto` is specifically the setting that leaves tool use fully optional, which is the opposite of what the developer wanted here.",
    fixOptions: [
      "Switch to `{\"type\": \"any\"}`, or name a specific tool if only one lookup makes sense.",
      "Add the word 'MUST' in all caps to the system prompt instead of changing tool_choice.",
      "Remove the tool definition so the model has no choice.",
      "Leave tool_choice as `auto` and just hope the model calls a tool anyway.",
    ],
    correctFixIndex: 0,
    fixRationale:
      "`any` mandates some tool call while leaving the choice of tool open; naming a specific tool forces that exact one. A capitalized system-prompt instruction is a salience cue, not an enforcement mechanism, and removing the tool definition breaks the feature outright.",
  },
  {
    id: "subagent-context",
    domainKey: "AGENTIC_ARCHITECTURE",
    title: "\"Resuming\" a research subagent",
    setup:
      "A coordinator delegates document research to a subagent, gets a summary back, and later tells a NEW subagent invocation: \"Continue where the last research subagent left off.\"",
    flawOptions: [
      "Subagents are too slow to be useful for research tasks.",
      "A new subagent invocation starts with a fresh context.",
      "The coordinator should never delegate research tasks to subagents.",
      "The subagent should have been given every available tool instead of a focused set.",
    ],
    correctFlawIndex: 1,
    flawRationale:
      "A new subagent invocation has no memory of the earlier subagent's run — nothing carries over automatically between separate subagent invocations unless the coordinator explicitly passes forward the prior findings or a summary.",
    fixOptions: [
      "Assume the SDK automatically shares context between separate subagent calls.",
      "Have the coordinator persist a summary of prior findings and pass it forward explicitly.",
      "Give up on using subagents for multi-step research.",
      "Repeat the entire original document set to the new subagent with no summary of what was already found.",
    ],
    correctFixIndex: 1,
    fixRationale:
      "Since nothing carries over automatically, the coordinator has to be the one holding and forwarding that state — a structured manifest of prior findings included explicitly in the new subagent's prompt, not a vague reference to 'where things left off.'",
  },
  {
    id: "lossy-summary",
    domainKey: "CONTEXT_MANAGEMENT",
    title: "Summarizing away an exact fact",
    setup:
      "A long trip-planning conversation gets compressed into: 'The user discussed some seat and meal preferences.' Later, the assistant can't recall whether the user wanted an aisle or window seat.",
    flawOptions: [
      "The conversation should never have been summarized at all, no matter how long it got.",
      "The summary is too vague, collapsing an exact fact into vague prose.",
      "The assistant simply has a bad memory and needs a larger context window.",
      "Summarization should only ever be applied to the most recent two messages.",
    ],
    correctFlawIndex: 1,
    flawRationale:
      "The specific seat preference (aisle vs. window) is exactly the kind of exact, retrievable fact that should be kept as a structured value, not paraphrased into a general sentence that loses the actual answer.",
    fixOptions: [
      "Give up on summarization and keep the entire raw transcript forever instead.",
      "Replace the vague prose with a structured field for exact, recurring facts.",
      "Shorten the summary even further to save more tokens.",
      "Switch to a sliding window over the last three messages instead of summarizing at all.",
    ],
    correctFixIndex: 1,
    fixRationale:
      "A structured field like seatPreference: \"aisle\" preserves the exact value precisely. Prose summarization is still fine for general narrative continuity — it's specifically exact, recurring facts that need a structured field instead of a sentence.",
  },
  {
    id: "prefill-deprecated",
    domainKey: "PROMPT_ENGINEERING",
    title: "Forcing JSON with assistant prefill",
    setup:
      "A team gets inconsistent JSON replies from a classification task, so they prefill the assistant's response with an opening '{' to force JSON-shaped output — a technique that worked on older models but now sometimes returns a validation error on current-generation models.",
    flawOptions: [
      "The prefill approach is deprecated on current models for this use case.",
      "The classification task itself is impossible to make reliable in any way.",
      "The team should have prefilled with a closing '}' instead of an opening '{'.",
      "JSON output can only ever be produced by writing very long prose instructions.",
    ],
    correctFlawIndex: 0,
    flawRationale:
      "A schema-constrained structured output, or an enum-typed field for a closed set of categories, is the modern replacement — it enforces the shape structurally instead of relying on a deprecated trick that current models now reject outright.",
    fixOptions: [
      "Keep using prefill, just make the prefilled string shorter.",
      "Define the response schema with the category field constrained to a valid enum.",
      "Ask the model to 'try really hard' to always return valid JSON in the system prompt.",
      "Post-process every response with a regex that strips anything that isn't JSON-shaped.",
    ],
    correctFixIndex: 1,
    fixRationale:
      "An enum-constrained field makes the output structurally incapable of being anything else. Prefill itself is what's deprecated (a shorter version doesn't fix that), and a system-prompt request or a post-processing regex both just react to a mistake instead of preventing it.",
  },
  {
    id: "claudemd-as-lock",
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    title: "\"CRITICAL: never do X\" in CLAUDE.md",
    setup:
      "A team lead writes 'CRITICAL: never run a database migration without explicit approval' in the project's CLAUDE.md, in bold capital letters, and considers the rule fully handled.",
    flawOptions: [
      "CLAUDE.md content, however emphatically worded, does not enforce anything.",
      "The rule should have been written in lowercase instead, since capital letters actively confuse the model.",
      "CLAUDE.md files are not allowed to mention database operations at all.",
      "The rule would only work if it were moved into assistant-maintained memory instead.",
    ],
    correctFlawIndex: 0,
    flawRationale:
      "CLAUDE.md is read as context the model tries to follow, not enforced code — a rule that absolutely must hold without exception, like blocking a migration, needs a hook or a permission-deny rule instead, something that actually intercepts the action.",
    fixOptions: [
      "Reword the rule to be even more emphatic, with more capital letters and exclamation points.",
      "Add a hook that blocks any migration command unless a separate approval step has run.",
      "Remove the rule from CLAUDE.md and don't replace it with anything.",
      "Move the same wording into assistant memory instead of CLAUDE.md.",
    ],
    correctFixIndex: 1,
    fixRationale:
      "A hook actually enforces the rule in code by intercepting the command itself. Rewording it more emphatically, removing it, or moving the same prose into memory all leave the rule exactly as unenforced as before — none of those mechanisms actually block anything.",
  },
];

// ---------------------------------------------------------------------------
// 3. Sequencing exercises (click-to-order)
// ---------------------------------------------------------------------------

export interface SequencingExercise {
  id: string;
  domainKey: DomainKey;
  title: string;
  intro: string;
  steps: string[]; // in correct order
}

export const SEQUENCING_EXERCISES: SequencingExercise[] = [
  {
    id: "basic-tool-loop",
    domainKey: "AGENTIC_ARCHITECTURE",
    title: "A single tool-use turn",
    intro: "Put these steps of one tool-use round trip in the order they actually happen.",
    steps: [
      "User sends a message to the application.",
      "The application calls the Messages API with the conversation so far.",
      "Claude's response has stop_reason: tool_use, including a tool_use content block.",
      "The application executes the requested tool.",
      "The application sends the tool's output back as a tool_result content block.",
      "Claude reads the tool_result and produces a final response with stop_reason: end_turn.",
    ],
  },
  {
    id: "dynamic-decomposition",
    domainKey: "AGENTIC_ARCHITECTURE",
    title: "Dynamic decomposition during an investigation",
    intro: "Order the steps of investigating an intermittent production bug using dynamic decomposition.",
    steps: [
      "An alert fires reporting an intermittent failure.",
      "The coordinator examines the current evidence (logs, error rate) before deciding anything else.",
      "Based on what the evidence shows, the coordinator decides whether to pull more logs, query a monitoring system, or escalate.",
      "The coordinator takes that action and evaluates the new evidence it returns.",
      "The coordinator repeats the decide-then-act step until a termination condition (root cause found, or a step cap reached) is met.",
      "The coordinator reports findings, including if the step cap was hit without a resolution.",
    ],
  },
  {
    id: "escalation-handoff",
    domainKey: "TOOL_DESIGN_MCP",
    title: "Escalating a support case to a human",
    intro: "Order the steps of a support agent correctly escalating a case it can't resolve.",
    steps: [
      "The agent attempts to resolve the issue and hits something requiring authority or approval it doesn't have.",
      "The agent assembles a structured handoff: customer ID, issue type, root cause, relevant record IDs, and actions already taken.",
      "The agent hands the structured summary to a human agent or approval queue, not just the first customer message.",
      "A human reviews the structured handoff and takes the higher-authority action.",
      "The resolution (or its outcome) is recorded back against the original case.",
    ],
  },
  {
    id: "stale-session-resume",
    domainKey: "CONTEXT_MANAGEMENT",
    title: "Handling a returning, possibly-stale conversation",
    intro: "Order the steps of correctly resuming a paused conversation that may now be out of date.",
    steps: [
      "A user returns to a paused conversation after some time has passed.",
      "The application checks how much time has passed and how likely the old state is to be stale.",
      "If most of the old context is still valid, the assistant notes what's changed and continues; if it's likely stale, the assistant starts fresh with a concise summary of the goal instead.",
      "Any state likely to have changed (such as an order status) is re-fetched rather than assumed from the old transcript.",
      "The assistant responds using the refreshed, authoritative state.",
    ],
  },
  {
    id: "structured-output-correction",
    domainKey: "PROMPT_ENGINEERING",
    title: "Correcting a schema-valid but semantically wrong extraction",
    intro: "Order the steps of correctly handling a validation failure in a structured-output pipeline.",
    steps: [
      "A tool call is forced via tool_choice, and the model returns a response that passes schema validation.",
      "Application-level validation checks the response and flags a specific field as semantically wrong, such as an impossible date.",
      "The application sends a new request containing the original source text, the invalid output, and the specific validation error.",
      "The correction request forces a tool call again, so the result stays structured and re-checkable.",
      "The corrected response is validated again before being accepted.",
    ],
  },
  {
    id: "plan-mode-workflow",
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    title: "Using plan mode for a risky, multi-file change",
    intro: "Order the steps of a properly used plan-mode workflow for a risky change.",
    steps: [
      "The developer recognizes the change spans multiple files and carries real risk if done wrong.",
      "Plan mode is enabled, and the assistant explores the relevant code read-only, without changing anything yet.",
      "The assistant proposes a specific plan describing the intended changes.",
      "The developer reviews and approves, or requests revisions to, the plan.",
      "Only after approval does the assistant begin making the actual file changes.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Exercise-item -> domain mapping (for mastery tracking)
// ---------------------------------------------------------------------------
//
// Every gradeable exercise item gets a stable itemId and a domain
// attribution, so exercise results can feed into the same per-domain
// mastery calculation as flashcards and questions. Anti-pattern scenarios
// and sequencing exercises are already domain-tagged in their own content;
// the config builder is a single exercise about CLAUDE.md/rules/MCP scoping
// with no natural per-item domain split, so it's attributed wholesale to
// Claude Code Configuration & Workflows, the domain it actually covers.

export const CONFIG_BUILDER_ITEM_ID = "config-builder:main";

/** Maps every exercise item's stable ID to the domain it counts toward. */
export const EXERCISE_ITEM_DOMAIN: Record<string, DomainKey> = {
  ...Object.fromEntries(
    ANTI_PATTERN_SCENARIOS.map((s) => [`apspotter:${s.id}`, s.domainKey] as const),
  ),
  ...Object.fromEntries(
    SEQUENCING_EXERCISES.map((e) => [`sequencing:${e.id}`, e.domainKey] as const),
  ),
  [CONFIG_BUILDER_ITEM_ID]: "CLAUDE_CODE_WORKFLOWS",
};

/** Reverse of EXERCISE_ITEM_DOMAIN — every exercise itemId available per domain. */
export const EXERCISE_ITEMS_BY_DOMAIN: Partial<Record<DomainKey, string[]>> = (() => {
  const map: Partial<Record<DomainKey, string[]>> = {};
  for (const [itemId, domainKey] of Object.entries(EXERCISE_ITEM_DOMAIN)) {
    (map[domainKey] ??= []).push(itemId);
  }
  return map;
})();
