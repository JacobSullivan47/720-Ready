import type { ScenarioContent } from "./types";

// Original scenario overviews written for this app — not copied from any
// source. Scenario names follow the publicly stated CCA-F exam structure
// (six possible production scenarios, four drawn per sitting).
export const scenarios: ScenarioContent[] = [
  {
    key: "CUSTOMER_SUPPORT_AGENT",
    name: "Customer Support Resolution Agent",
    sortOrder: 1,
    summary:
      "An agent that resolves support tickets end to end: verifying identity, looking up account and order data, applying policy, and knowing when to hand off to a human.",
    keyKnowledge: [
      "Escalation should trigger on category and impact (a policy exception, a regulated approval, an action the agent lacks authority for) — not on a simplistic counter like 'after three failed tool calls'.",
      "A structured handoff to a human agent needs the customer ID, issue type, root cause, relevant record IDs, actions already taken, and a recommended next step — not just the first complaint or a full raw transcript.",
      "Hard compliance rules (refund thresholds, manager approval, regulated workflows) must be enforced in code or tool logic, not left to prompt instructions alone, since prompts are not tamper-proof.",
      "A frustrated user who explicitly asks for a human should get an immediate, graceful handoff — not a forced intake questionnaire and not a silent account action performed instead of what they asked for.",
    ],
    keySkills: [
      "Design escalation criteria around risk and authority rather than retry count.",
      "Build a structured handoff payload a human agent can act on immediately.",
      "Enforce monetary/approval limits at the tool layer (e.g. a server-checked cap) instead of trusting the model to self-limit.",
    ],
    antiPatterns: [
      "Escalating after a fixed number of tool failures regardless of what those failures actually were.",
      "A refund tool that accepts an override parameter the model can simply set to bypass a policy cap.",
      "Dumping the entire chat transcript on a human agent instead of a concise structured summary.",
    ],
    examStyleNote:
      "Questions in this scenario often present an escalation or handoff situation and ask what should trigger escalation, or ask you to spot a compliance rule that lives only in the prompt instead of in enforced code.",
  },
  {
    key: "CODE_GENERATION_CLAUDE_CODE",
    name: "Code Generation with Claude Code",
    sortOrder: 2,
    summary:
      "Using Claude Code productively on a real codebase: exploring unfamiliar code, choosing plan mode vs. direct execution, and managing sessions across a multi-day task.",
    keyKnowledge: [
      "Efficient exploration follows a pattern: grep for identifiers/routes/error codes, read the matching entry files, follow imports to core abstractions, then trace one or two representative execution paths.",
      "Plan mode fits work that spans many files, involves architectural choices, or needs stakeholder sign-off before changes land; direct execution fits small, localized, low-risk edits with a clear target.",
      "A scratchpad of durable findings (key files, data flow, confirmed assumptions, open questions) helps when context compacts or another session picks up the same investigation later.",
      "CLAUDE.md conventions and hooks are complementary but different: CLAUDE.md is read context the model tries to follow; hooks and permission rules are what actually gets enforced.",
    ],
    keySkills: [
      "Pick plan mode vs. direct execution based on blast radius and need for approval, not habit.",
      "Use --fork-session plus a separate git worktree to compare two implementation approaches without contaminating the original session or files.",
      "Write a concise scratchpad summary before context runs out, so a resumed session isn't starting from zero.",
    ],
    antiPatterns: [
      "Jumping straight into large, multi-file edits without gathering context first, even for an urgent bug.",
      "Treating plan mode and extended thinking as the same lever.",
      "Resuming the same session in two terminals at once and getting conflicting edits.",
    ],
    examStyleNote:
      "Expect questions describing a coding task and asking whether plan mode or direct execution is appropriate, or which built-in tool (Grep/Glob/Read/Edit/Bash) fits a described step.",
  },
  {
    key: "MULTI_AGENT_RESEARCH",
    name: "Multi-Agent Research System",
    sortOrder: 3,
    summary:
      "Partitioning a large research task across parallel subagents, each returning claims with sources and dates, then synthesizing a coherent report.",
    keyKnowledge: [
      "Subagents in a parallel partition don't share the parent's conversation state — each needs the full context it requires (the goal, the partition of work, expected output shape) supplied explicitly in its own prompt.",
      "A subagent's output should be a structured record (claim, source ID/location, date, confidence, established vs. contested status) rather than free prose, so the coordinator can merge results and preserve provenance.",
      "Elapsed time for a parallel phase is bounded by the slowest partition, so balancing work across subagents by expected effort matters more than splitting evenly by item count.",
      "Give each subagent only the tools its role needs (a web-research subagent gets search/fetch; a synthesis subagent that only works from supplied findings doesn't need search tools at all).",
    ],
    keySkills: [
      "Write a subagent handoff prompt that specifies output structure and required fields (claim, source, date, confidence) instead of a vague 'go research this'.",
      "Balance partitions by expected effort rather than raw count of items.",
      "Design a synthesis step that preserves uncertainty and separates established from contested findings instead of flattening everything into confident prose.",
    ],
    antiPatterns: [
      "Assuming a subagent can 'resume' a previous subagent's run without being given its prior findings explicitly.",
      "Passing a 100K-token raw dump between agents instead of a structured summary with a source index.",
      "Giving every subagent every available tool regardless of its actual role.",
    ],
    examStyleNote:
      "Look for questions that describe a broken multi-agent handoff (missing dates, lost citations, an over-confident merged report) and ask what context or structure was missing.",
  },
  {
    key: "DEVELOPER_PRODUCTIVITY_TOOLS",
    name: "Developer Productivity Tools",
    sortOrder: 4,
    summary:
      "Building internal tools and integrations (via MCP or custom tools) that make a Claude-powered assistant genuinely useful across a team's existing systems.",
    keyKnowledge: [
      "MCP is worth the integration cost when the capability is reused across multiple clients or agents; a single agent with a narrow, app-specific need is often better served by a plain custom tool.",
      "Configuration scope in Claude Code matters for who benefits: project scope (.mcp.json, checked in) reaches the whole team, local scope is personal-and-project-specific (good for credentials), user scope follows one person across all projects.",
      "Tool descriptions compete with built-in tools and other servers' tools for the model's attention — vague or overlapping descriptions cause the model to pick the wrong tool or ignore a useful one.",
      "Progressive tool availability (a small discovery tool set that reveals more specific tools on demand) keeps the active tool list manageable as an internal tool library grows.",
    ],
    keySkills: [
      "Decide MCP vs. custom tool based on reuse across clients, not on how 'official' the mechanism feels.",
      "Place a new MCP server at the correct scope (project/local/user) for who actually needs it.",
      "Write tool descriptions that explain when to prefer this tool over similar built-in or third-party ones.",
    ],
    antiPatterns: [
      "Standing up an MCP server for a one-off, single-agent need that a simple custom tool would serve just as well.",
      "Putting personal or experimental credentials into a project-scoped .mcp.json that gets checked into version control.",
      "Shipping a tool description that only makes sense next to its sibling tools, breaking when tool search surfaces it in isolation.",
    ],
    examStyleNote:
      "Expect questions asking whether a described capability belongs in MCP or a custom tool, and which Claude Code MCP scope is appropriate for a given credential or team-sharing requirement.",
  },
  {
    key: "CLAUDE_CODE_CI_CD",
    name: "Claude Code for CI/CD",
    sortOrder: 5,
    summary:
      "Running Claude Code as part of an automated pipeline: reviewing PRs, triaging CI failures, and applying hard guardrails since no human is watching in real time.",
    keyKnowledge: [
      "In an unattended pipeline, anything that must not happen (destructive commands, unreviewed pushes to protected branches) needs to be blocked by permission rules or hooks — prompt instructions alone are not a safety boundary in this context.",
      "Session identifiers (--session-id) give a pipeline a stable, programmatic way to resume or reference a specific run, rather than relying on 'most recent session' semantics meant for interactive use.",
      "Investigating an intermittent CI failure is a dynamic-decomposition problem (each finding changes what to check next), not a fixed checklist — forcing a rigid script onto it tends to miss the actual cause.",
      "Automated review or triage output should be structured (pass/fail, specific file/line, suggested fix) so it can be consumed by the rest of the pipeline, not just a prose paragraph.",
    ],
    keySkills: [
      "Configure permission rules/hooks to enforce what must never happen in an automated run, rather than relying on system-prompt instructions.",
      "Use --session-id for reproducible, addressable pipeline runs instead of --continue.",
      "Structure automated output (e.g. a JSON review report) so downstream pipeline steps can act on it directly.",
    ],
    antiPatterns: [
      "Relying on 'please don't force-push' in a system prompt as the only safeguard in an unattended pipeline.",
      "Using --continue in a CI job and getting a different session than intended because 'most recent' isn't well defined in a shared runner.",
      "Running a fixed, pre-written checklist against a flaky test instead of letting each finding guide the next check.",
    ],
    examStyleNote:
      "Look for questions contrasting interactive session flags with what a CI/CD context actually needs, or asking where a hard safety rule should live when no human is present to catch a mistake.",
  },
  {
    key: "STRUCTURED_DATA_EXTRACTION",
    name: "Structured Data Extraction",
    sortOrder: 6,
    summary:
      "Pulling reliable, schema-validated data out of messy documents at scale: designing schemas that admit honest absence, validating semantically (not just syntactically), and choosing batch vs. real-time processing.",
    keyKnowledge: [
      "Valid JSON is not the same as correct data — schema compliance only checks shape; semantic validation (totals reconcile, dates fall in range, required citations are present) has to be added separately.",
      "Making a field optional or nullable when the source may not state it reduces fabrication; forcing a field to be required when the source is often silent on it encourages the model to invent a plausible-sounding value.",
      "An 'other' enum value paired with a free-text detail field handles long-tail categories better than repeatedly expanding a closed enum every time a new category appears.",
      "The Message Batches API trades latency for roughly half the cost and suits high-volume, non-urgent extraction; the real-time Messages API suits urgent or SLA-sensitive documents. Batch results can arrive out of order, so join them by their custom ID, not by position.",
    ],
    keySkills: [
      "Design a schema with explicit absence semantics (nullable field, empty array, an 'unclear' enum value) matched to what 'missing' actually means for that field.",
      "Add domain-specific semantic validation on top of schema validation, and feed validation failures back as a targeted correction request rather than a blind retry.",
      "Route mixed-urgency extraction correctly: standard volume to the Batch API, time-sensitive documents to the real-time API.",
    ],
    antiPatterns: [
      "Treating a syntactically valid JSON response as proof the extracted values are correct.",
      "Making every field required, which pushes the model to fabricate values for information the source never provided.",
      "Matching batch results by their position in a list instead of by their custom ID, silently misaligning outputs.",
    ],
    examStyleNote:
      "Expect questions presenting a schema design or a validation failure and asking you to spot the fabrication risk or fix the semantic gap, plus at least one question contrasting batch vs. real-time processing tradeoffs.",
  },
];
