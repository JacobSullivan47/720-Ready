import type { DomainContent } from "./types";

// Original overviews written for this app. Domain names/weights follow the
// publicly stated CCA-F exam structure; explanations below are our own
// original writing, not copied from any source. See /about for licensing.
export const domains: DomainContent[] = [
  {
    key: "AGENTIC_ARCHITECTURE",
    name: "Agentic Architecture & Orchestration",
    weightPct: 27,
    sortOrder: 1,
    summary:
      "How to shape multi-step, tool-using work into the right control-flow pattern — fixed pipelines, routers, orchestrator/worker delegation, dynamic investigation loops, or parallel fan-out — and when a single call is enough.",
    keyKnowledge: [
      "Five recurring patterns: prompt chaining (fixed sequence), routing (classify then dispatch), orchestrator-workers (coordinator delegates subtasks), dynamic decomposition (next step depends on current findings), and parallel subagents (independent partitions).",
      "Subagents do not inherit the parent conversation. A spawned subagent starts a fresh context and only sees what the parent explicitly puts in its prompt — no prior user turns, no prior tool results, no memory of earlier subagent runs.",
      "Parallel fan-out only pays off when units of work are independent and roughly balanced in size; total wall-clock time is bounded by the slowest partition, not the sum of all of them.",
      "Delegating to a subagent has fixed overhead (new context, a tool-call round trip, result reconciliation) — for something the parent can already answer directly (e.g. summarizing three facts it just retrieved), delegating is slower and more expensive, not more 'agentic'.",
      "State that must survive across turns or across subagent handoffs needs to be persisted as structured data (a workflow manifest, a claim-and-source index) — passing raw transcripts or prose summaries loses exactly the fields the next step needs.",
    ],
    keySkills: [
      "Match the pattern to the shape of the work, not to what feels most sophisticated: ask whether the next step is knowable in advance (chain it) or depends on what was just discovered (decompose dynamically).",
      "Write subagent handoff prompts that specify the goal, the required output shape, and any constraints — not just 'go do the thing' — since the subagent has no other context to fall back on.",
      "Recognize when NOT to delegate: small, already-in-context tasks are cheaper for the coordinator to finish directly.",
      "Design tool availability per subagent role (a research subagent gets search tools; a synthesis subagent gets none) rather than handing every subagent every tool.",
    ],
    antiPatterns: [
      "Forcing a rigid prompt-chain onto an investigation whose next step genuinely depends on what was just found (misses the real problem, wastes calls retracing a fixed script).",
      "Forcing dynamic step-by-step decomposition onto a workflow that is always the same five steps (adds latency and inconsistency for no benefit).",
      "Assuming a subagent 'remembers' anything from the parent's conversation or from a previous subagent run it wasn't explicitly told about.",
      "Passing three sub-agents an unfiltered 100K-token dump instead of a structured summary with the specific fields the next step needs.",
      "Spawning a subagent to answer something the orchestrator could finish in one more sentence using information already in its own context.",
    ],
    examStyleNote:
      "Exam-style questions usually describe a workflow and ask you to pick the matching pattern, or describe a broken multi-agent handoff and ask what context was missing — both test whether you can read the shape of the work, not memorize pattern names.",
  },
  {
    key: "TOOL_DESIGN_MCP",
    name: "Tool Design & MCP Integration",
    weightPct: 18,
    sortOrder: 2,
    summary:
      "Designing tool interfaces an LLM agent can use reliably: clear schemas, sensible error shapes, safe confirmation flows for risky actions, and choosing between custom tools, MCP servers, and Anthropic-hosted tools.",
    keyKnowledge: [
      "Model Context Protocol exposes three building blocks: tools (model-controlled actions), resources (application-controlled passive reference material), and prompts (user/application-controlled reusable templates).",
      "MCP configuration in Claude Code has three scopes with a strict precedence: local (per-user, per-project, in ~/.claude.json) overrides project (.mcp.json, checked into the repo) overrides user (per-user, all projects) — the whole winning entry is used, fields are never merged across scopes.",
      "Good tool descriptions state what the tool does, when to use it, when NOT to use it, required input shapes, and limitations — vague descriptions cause the model to under- or over-use a tool.",
      "Tool annotations like readOnlyHint, destructiveHint, and idempotentHint are untrusted metadata a server can lie about — they inform which confirmation UI to show, but must never replace an actual server-side authorization check.",
      "Errors split into tiers: transient infrastructure failures (retry with backoff, inside the tool), permanent validation errors (return structured details so the model can correct itself), and business-rule failures (non-retryable, needs a human-readable explanation).",
    ],
    keySkills: [
      "Split a tool whose parameters have interdependent constraints into several narrower tools instead of one tool with a sprawling, conditional schema.",
      "Design a preview-then-execute pair (e.g. a preview tool returning a one-time confirmation token, and an execute tool that consumes it) for any destructive action, instead of a single boolean like dry_run.",
      "Return paginated results as a first page plus a total count and a continuation token — never silently auto-fetch every page on the model's behalf.",
      "Decide resource vs. tool by asking: is this something the agent looks up before acting (resource) or something requiring a live computation or side effect (tool)?",
    ],
    antiPatterns: [
      "One 'manage_order' tool covering create/cancel/refund instead of separate tools per distinct action and risk level.",
      "A dry_run: boolean parameter on a destructive tool, which the model can simply set to false.",
      "Trusting a destructiveHint: false annotation from an MCP server as if it were an enforced permission rather than an advisory hint.",
      "Returning an empty array for a backend timeout, indistinguishable from a genuine 'no results' response.",
      "Encoding format requirements only in a parameter's name (e.g. iso_date_string) instead of in the schema and description.",
    ],
    examStyleNote:
      "Expect scenario questions asking you to fix a poorly designed tool schema or error contract, or to place a capability correctly as an MCP tool vs. resource vs. Claude Code scope.",
  },
  {
    key: "CLAUDE_CODE_WORKFLOWS",
    name: "Claude Code Configuration & Workflows",
    weightPct: 20,
    sortOrder: 3,
    summary:
      "Configuring Claude Code for a team and codebase: the CLAUDE.md/rules hierarchy, hooks vs. memory, session and plan-mode workflows, choosing the right built-in tool for a task, and building custom agents with the Claude Agent SDK.",
    keyKnowledge: [
      "CLAUDE.md and .claude/rules/ files are context, not enforcement — Claude reads and tries to follow them, but nothing guarantees compliance. Anything that MUST hold every time (a forbidden command, a required approval) belongs in a hook or a permissions.deny rule, not in prose.",
      "CLAUDE.md can be nested at multiple directory levels; more deeply nested files add detail for that subtree without overriding the parent's conventions wholesale.",
      "Rule files under .claude/rules/ are scoped by glob pattern, so a rule about test conventions can apply only under tests/ while a rule about API style applies repo-wide.",
      "Plan mode (--permission-mode plan, or Shift+Tab to toggle) is a workflow control that explores read-only and proposes before acting — a separate mechanism from extended thinking, which is about reasoning depth; the two can be combined but are not the same lever.",
      "Session flags serve different purposes: --continue resumes the most recent conversation in the current directory, --resume/-r picks a specific saved session, --session-id pins a stable identifier for programmatic use, and --fork-session branches a new transcript so the original stays untouched.",
      "The Claude Agent SDK exposes the same underlying harness that powers Claude Code — built-in tools, permissions, hooks, subagents, context management — as a library for building a custom agent product or automation, distinct from using the Claude Code CLI interactively.",
    ],
    keySkills: [
      "Choose the right built-in tool for a task: Grep for text inside files, Glob for filenames/paths, Read for a known file, Edit for a small targeted change, Bash for running tests or shell commands.",
      "Decide between direct execution and plan mode based on blast radius: small, localized, low-risk changes go direct; multi-file, architectural, or approval-requiring changes go through plan mode first.",
      "Use --fork-session to try an alternative approach without disturbing the original investigation, especially alongside a separate git worktree for isolated file changes.",
      "Place a hard rule (e.g. 'never run migrations without approval') in a hook or permission rule instead of relying on CLAUDE.md prose to enforce it.",
      "Recognize when a task calls for the interactive Claude Code CLI versus building a custom agent with the Agent SDK — an unattended automation embedded in a team's own product or pipeline needs the SDK, not the terminal tool.",
    ],
    antiPatterns: [
      "Writing 'CRITICAL: you must always do X' in CLAUDE.md and treating that as equivalent to actually blocking the action.",
      "Resuming the same session from two terminals at once, or blindly using --continue when the 'most recent' session isn't actually the one you meant to return to.",
      "Putting a narrow, one-off workflow checklist into global user memory instead of a project-scoped rule file.",
      "Confusing plan mode with extended thinking, and assuming turning one on gives you the other.",
      "Using Glob to search for text inside files (it only matches filenames/paths) instead of Grep.",
      "Hand-building an agentic tool-call loop directly against the raw Messages API instead of using the Agent SDK, which already provides that loop plus permissions and context management.",
    ],
    examStyleNote:
      "Expect questions that show a CLAUDE.md/rules snippet or a session-flag choice and ask what will actually happen, since this domain rewards precise recall of scoping and precedence rules over general impressions.",
  },
  {
    key: "PROMPT_ENGINEERING",
    name: "Prompt Engineering & Structured Output",
    weightPct: 20,
    sortOrder: 4,
    summary:
      "Getting reliable, correctly-shaped output from Claude: system prompt structure, when to use principles vs. explicit conditionals, forcing tool use or schema-validated JSON, why the system prompt needs reinforcement over long conversations, and evaluating whether a prompt change actually helped.",
    keyKnowledge: [
      "The system prompt is resent in full on every API call alongside the message history — there is no server-side memory between calls, so omitting it on a later turn causes an immediate behavior change, and its influence can still drift as a long conversation accumulates competing recent context.",
      "tool_choice has four settings: auto (model decides), any (must use some tool), a named tool (must use that specific one), and none (no tool use) — 'auto' and 'any' are frequently confused.",
      "Structured, schema-validated output is more reliable than asking for JSON in prose and hoping; validation failures should be fed back to the model as a specific correction request, not answered with a blind retry.",
      "Few-shot examples embedded in the prompt often outperform long prose instructions for teaching a subtle distinction (e.g. how to handle missing data without fabricating it).",
      "Principles work well for judgment-heavy behavior ('adapt explanation depth to the user's demonstrated expertise'); explicit conditionals are for rules that must hold without exception ('if this is a medical emergency, direct to emergency services'). Turning every nuance into a conditional bloats the prompt and can reduce adherence.",
      "A prompt or model change should be judged against an evaluation set of representative cases, not a subjective read of the new wording; subjective or open-ended output can be graded with an LLM-as-judge rubric, spot-checked periodically by a human to catch a miscalibrated grader.",
    ],
    keySkills: [
      "Choose tool_choice correctly for the goal: force a specific tool when the next action is known, use 'any' when some tool call is required but which one is open, leave 'auto' for genuinely optional tool use.",
      "Replace a deprecated assistant-message prefill approach with schema-constrained structured output or an explicit 'respond with no preamble' instruction.",
      "Recognize prompt dilution in a long-running conversation and apply a fix: reinforce key constraints at a natural breakpoint, version the system prompt across long sessions, or move a hard requirement into code instead of prose.",
      "Decide when to ask one focused clarifying question versus proceeding on a reasonable assumption, based on cost of a wrong guess and reversibility of the action.",
      "Fix an eval failure at its actual cause and re-run the full eval set afterward, rather than patching a single failing example and assuming the fix generalizes.",
    ],
    antiPatterns: [
      "Relying on words like 'IMPORTANT' or 'NEVER' in a system prompt as if capitalization were an enforcement mechanism rather than a salience cue.",
      "Silently averaging two conflicting user preferences into a vague compromise instead of naming the tension and asking which one governs.",
      "Asking a list of three or four clarifying questions when one targeted question would resolve the ambiguity.",
      "Treating 'auto' and 'any' as interchangeable tool_choice settings.",
      "Stuffing every edge case into an ever-growing list of conditionals instead of stating the underlying principle once.",
      "Shipping a prompt change because it fixed one failing eval case, without re-running the full eval set to check for regressions elsewhere.",
    ],
    examStyleNote:
      "Look for questions that give you a system prompt or a tool_choice configuration and ask you to predict behavior, or that describe drifting behavior over a long session and ask for the correct fix.",
  },
  {
    key: "CONTEXT_MANAGEMENT",
    name: "Context Management & Reliability",
    weightPct: 15,
    sortOrder: 5,
    summary:
      "Keeping long-running or returning conversations reliable: choosing between sliding windows, progressive summaries, and structured state; compressing verbose tool results; and handling stale data when a user returns.",
    keyKnowledge: [
      "A large context window is a capacity limit, not a guarantee of attention — even within budget, very long transcripts can dilute how strongly earlier instructions are followed.",
      "Different information needs different retention strategies: recent conversational flow suits a sliding window; long-term narrative continuity suits progressive summarization; exact facts and numbers are better retrieved from a structured store than compressed into prose.",
      "After a tool call returns a large payload, keep only the fields the next step actually needs (an order ID, a status, a return window) and drop internal metadata and duplicated data — this is distinct from summarizing the conversation itself.",
      "Server-side compaction summarizes older history when a session approaches its context limit; context editing instead clears stale tool results or thinking blocks. They solve different problems and are not interchangeable.",
      "When a user returns to a stale session, the fix is to fetch fresh state and mark it as more authoritative than old tool results — not to silently resume as if nothing changed, and not to blindly re-run every previous tool call.",
    ],
    keySkills: [
      "Pick the right context strategy per kind of information in a single system: sliding window for recent flow, structured state object for current preferences, retrieval for exact facts.",
      "Compress a verbose tool result to the handful of fields relevant to the ongoing task immediately after receiving it, rather than carrying the raw payload forward.",
      "Recognize when the correct fix for context-window pressure is compaction (summarize) versus context editing (clear) versus simply trimming a sliding window.",
      "Design a 'returning user' flow that surfaces a structured summary of prior state and explicitly re-fetches anything that may be stale.",
    ],
    antiPatterns: [
      "Summarizing exact facts and numbers into vague prose instead of keeping them in a structured, retrievable store.",
      "Keeping every RAG/tool retrieval result in context indefinitely instead of trimming to the last few relevant ones.",
      "Resuming an old transcript with stale tool results and simply adding an instruction to 'prefer the latest information' rather than actually re-fetching it.",
      "Confusing compaction (summarizes) with context editing (clears) and applying the wrong one to the problem at hand.",
      "Assuming a 1M-token context window means the model will weigh a turn-50 instruction as strongly as one from turn 2.",
    ],
    examStyleNote:
      "This domain rewards recognizing which context-management technique fits a described symptom (drifting behavior, stale data, ballooning token cost) rather than reciting definitions.",
  },
];
