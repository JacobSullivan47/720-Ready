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
  fixOptions: string[];
  correctFixIndex: number;
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
      "Nothing stops the model from calling it directly with dry_run: false — the 'preview first' behavior is a suggestion, not a guarantee.",
      "The workspace_id parameter should be a free-text string instead of an identifier.",
      "The tool doesn't return enough information in its response.",
    ],
    correctFlawIndex: 1,
    fixOptions: [
      "Rename the parameter from dry_run to confirm to make the intent clearer.",
      "Add a warning to the tool description telling the model to always preview first.",
      "Split it into a preview_delete_workspace() that returns a short-lived confirmation token, and a separate execute_delete_workspace(confirmation_token) that consumes it — there is no parameter that skips the preview.",
      "Require the user to type the workspace name to confirm, checked only in the system prompt.",
    ],
    correctFixIndex: 2,
  },
  {
    id: "escalation-counter",
    domainKey: "AGENTIC_ARCHITECTURE",
    title: "Support agent escalation policy",
    setup:
      "A customer support agent is configured to escalate to a human 'after 3 failed tool calls in a row', regardless of what those tool calls were trying to do.",
    flawOptions: [
      "Three is an arbitrary number that should probably be five instead.",
      "Escalation should be based on the category and impact of the failure (e.g. needs authority the agent lacks, or a policy exception), not a simplistic retry count.",
      "The agent should never escalate to a human under any circumstances.",
      "The agent should escalate after only 1 failed tool call instead.",
    ],
    correctFlawIndex: 1,
    fixOptions: [
      "Lower the threshold to 2 failed calls instead of 3.",
      "Trigger escalation based on what actually happened — a policy exception, a regulated approval, an action beyond the agent's authority, or genuinely no progress — and hand off with a structured summary of root cause and actions already taken.",
      "Have the agent apologize and keep retrying the same tool call indefinitely.",
      "Remove the human escalation path entirely and let the agent always resolve issues itself.",
    ],
    correctFixIndex: 1,
  },
  {
    id: "stale-resume",
    domainKey: "CONTEXT_MANAGEMENT",
    title: "Returning customer, old ticket",
    setup:
      "A user returns to a support chat after two days. The application resumes the old conversation transcript as-is and adds one line to the system prompt: 'Prefer more recent information if the user mentions anything new.'",
    flawOptions: [
      "The transcript should be deleted entirely and the user should start over with no context.",
      "Old tool results (like a prior order status) may now be stale, and a soft prompt instruction doesn't fix that — the application needs to actually re-fetch current state before making any claims.",
      "The system prompt line is too short and should be several paragraphs long instead.",
      "The application should re-call every single tool from the entire prior conversation before responding.",
    ],
    correctFlawIndex: 1,
    fixOptions: [
      "Add more instructions to the system prompt about being careful with old data.",
      "Start with a structured summary of the prior interaction, but explicitly re-fetch anything likely to be stale (e.g. order status) before responding, and mark that fresh state as authoritative over older tool results in the transcript.",
      "Re-run every tool call from the previous session again from scratch.",
      "Ignore the previous conversation and ask the user to repeat everything.",
    ],
    correctFixIndex: 1,
  },
  {
    id: "tool-choice-any",
    domainKey: "PROMPT_ENGINEERING",
    title: "Forcing a tool call",
    setup:
      "A developer wants Claude to always look something up before answering a factual question, so they set `tool_choice` to `{\"type\": \"auto\"}`, assuming this forces at least one tool call.",
    flawOptions: [
      "`auto` lets the model decide whether to use a tool at all — it doesn't force any tool call; that's what `any` (or a named tool) is for.",
      "tool_choice has no effect on model behavior at all.",
      "The system prompt should have been used instead of tool_choice entirely.",
      "`auto` forces every available tool to be called at once.",
    ],
    correctFlawIndex: 0,
    fixOptions: [
      "Switch to `{\"type\": \"any\"}` to require some tool call, or name a specific tool if only one lookup makes sense.",
      "Add the word 'MUST' in all caps to the system prompt instead of changing tool_choice.",
      "Remove the tool definition so the model has no choice.",
      "Leave tool_choice as `auto` and just hope the model calls a tool anyway.",
    ],
    correctFixIndex: 0,
  },
  {
    id: "subagent-context",
    domainKey: "AGENTIC_ARCHITECTURE",
    title: "\"Resuming\" a research subagent",
    setup:
      "A coordinator delegates document research to a subagent, gets a summary back, and later tells a NEW subagent invocation: \"Continue where the last research subagent left off.\"",
    flawOptions: [
      "Subagents are too slow to be useful for research tasks.",
      "A new subagent invocation starts a fresh context — it has no memory of the earlier subagent's run unless the coordinator explicitly passes forward the prior findings or a summary.",
      "The coordinator should never delegate research tasks to subagents.",
      "The subagent should have been given every available tool instead of a focused set.",
    ],
    correctFlawIndex: 1,
    fixOptions: [
      "Assume the SDK automatically shares context between separate subagent calls.",
      "Have the coordinator persist a structured summary or manifest of prior findings and explicitly include it in the new subagent's prompt, since nothing carries over automatically.",
      "Give up on using subagents for multi-step research.",
      "Repeat the entire original document set to the new subagent with no summary of what was already found.",
    ],
    correctFixIndex: 1,
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
