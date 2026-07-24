import type { FlashcardSeed } from "../types";

// Original flashcards written for this app covering Agentic Architecture &
// Orchestration. Wording, examples, and phrasing are original — not copied
// or paraphrased from any source. See /about for licensing notes.
export const flashcards: FlashcardSeed[] = [
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Prompt chaining",
    definition:
      "A control-flow pattern where a task is broken into a fixed, ordered sequence of steps, each one feeding its output into the next. The sequence itself never changes based on what any step finds.",
    example:
      "An onboarding agent always runs: collect employee details, provision an account, assign default permissions, send a welcome email — in that exact order every time.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Routing",
    definition:
      "A pattern where an incoming request is first classified into one of a small set of known categories, then handed to a category-specific handler built for that case.",
    example:
      "An inbound-email agent tags each message as 'billing', 'technical', or 'sales', then forwards it to the handler tuned for that topic.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Orchestrator-workers pattern",
    definition:
      "A pattern in which a coordinating model decides, at runtime, what subtasks a job needs, delegates each one to a worker, and then combines the results itself. Unlike routing, the set of subtasks isn't fixed in advance.",
    example:
      "Given 'redesign our pricing page,' a coordinator might decide on the fly to delegate competitor research, copywriting, and layout mockups as three separate worker tasks.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Dynamic decomposition",
    definition:
      "An approach where each step's outcome determines what the next step should be, rather than following a pre-written sequence. It suits investigation-style problems where the right path can't be known ahead of time.",
    example:
      "Debugging an intermittent outage: the agent checks the alert first, and only then decides whether to pull logs, query a dashboard, or escalate — a fixed checklist would miss the actual cause.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Parallel subagents (fan-out)",
    definition:
      "A pattern where a large, uniform task is split into independent slices, each processed by its own subagent running at the same time, with results combined afterward. It works best when the slices don't need to consult one another.",
    example:
      "Reviewing 40 independent repositories for a deprecated API call by assigning each repository to its own subagent and merging the findings at the end.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    term: "Synthesis step",
    definition:
      "The final stage of a fan-out or orchestrator-workers job where a coordinator merges the individual results from all subtasks into one coherent output, resolving overlaps and preserving important distinctions between them.",
    example:
      "After five research subagents each return a set of sourced claims, the synthesis step merges them into a single report while keeping conflicting findings clearly labeled as contested.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Context isolation",
    definition:
      "The property that a spawned subagent starts with an empty context of its own and does not automatically see the parent's earlier conversation, tool results, or any other subagent's run.",
    example:
      "A subagent asked to 'check the second dataset' will have no idea what 'the first dataset' was unless the parent's prompt names it explicitly.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Handoff prompt",
    definition:
      "The instructions a coordinator gives a subagent when delegating work. A strong handoff states the goal, the exact output shape wanted, and any constraints; a weak one just names a vague task and hopes for the best.",
    example:
      "'List every open PR' is a weak handoff. 'List open PRs older than 14 days, return author, title, and age in days as a table' is a strong one.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Coordinator",
    definition:
      "The top-level agent in a multi-agent design that decides how to break work apart, delegates pieces to subagents or workers, and is responsible for combining their outputs into a final answer.",
    example:
      "In a document-review pipeline, the coordinator decides which sections need a specialist subagent and stitches the returned comments back into one reviewed draft.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    term: "Partition (of work)",
    definition:
      "One independent slice of a larger task assigned to a single subagent in a fan-out job. Partitions should be sized by expected effort, not just by raw item count, so no single one becomes the bottleneck.",
    example:
      "Splitting 100 support tickets into ten partitions of ten tickets each looks even, but if three tickets are far more complex than the rest, grouping by estimated effort keeps the partitions actually balanced.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Wall-clock time bound in fan-out",
    definition:
      "In a parallel fan-out phase, total elapsed time is set by whichever single partition takes longest to finish — not by the sum of every partition's individual time.",
    example:
      "If nine subagents finish in two minutes but a tenth takes twenty minutes because its slice was unexpectedly large, the whole phase takes twenty minutes regardless of how fast the others were.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Termination criteria",
    definition:
      "Explicit conditions that tell a dynamically-decomposed or open-ended agentic process when to stop investigating and produce a result, such as a maximum number of steps or a confidence threshold being met.",
    example:
      "An investigation agent is told to stop after five diagnostic steps or as soon as it finds a root cause matching a known error signature, whichever comes first.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Step cap",
    definition:
      "A hard limit on the number of iterations or tool calls an agent may take before it must stop and report, used to bound the unpredictable cost of dynamic, investigation-style work.",
    example:
      "A log-triage agent is capped at eight tool calls; on the ninth, it must summarize what it has found so far instead of continuing indefinitely.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "Escalation criteria",
    definition:
      "The conditions under which an agent should stop acting on its own and hand a task to a human, ideally defined around the category and risk of the situation rather than a simple retry count.",
    example:
      "A support agent escalates any request involving a regulated refund exception, but does not escalate just because a lookup tool failed twice and then succeeded on the third try.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "Structured handoff (to a human)",
    definition:
      "A concise, field-based summary passed to a human taking over from an agent, containing the essential identifiers, root cause, actions already taken, and a recommended next step — instead of a raw transcript dump.",
    example:
      "Rather than pasting the whole chat log, the agent hands the human agent a short record: customer ID, issue category, what was already tried, and why it couldn't be resolved automatically.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Provenance (in multi-agent output)",
    definition:
      "Tracking, for every claim or fact a subagent returns, where it came from (a source ID or location) and when it was produced, so a later synthesis step can cite it and judge how current it is.",
    example:
      "A research subagent returns each fact as {claim, source_id, date} rather than a plain sentence, so the coordinator can later trace any statement back to its origin.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    term: "Established vs. contested finding",
    definition:
      "A labeling convention where a synthesis step marks each claim as broadly agreed upon, disputed by conflicting sources, or too thin to support confidently — instead of presenting every claim with equal, flattened certainty.",
    example:
      "A merged report notes 'three sources agree adoption rose in 2025 (established)' separately from 'one source claims a market-share figure the others don't corroborate (contested).'",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Structured state manifest",
    definition:
      "A persisted, machine-readable record of a long-running workflow's progress — such as completed steps, produced artifacts, and open gaps — used so a resumed session can be re-briefed efficiently instead of replaying full transcripts.",
    example:
      "A workflow manifest like {\"workflow_id\": \"w-42\", \"completed_steps\": [\"gather\", \"draft\"], \"open_gaps\": [\"pricing section\"]} lets a new session pick up exactly where the last one stopped.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Over-delegation",
    definition:
      "An anti-pattern where a coordinator spawns a subagent for a task it could already finish directly from information already in its own context, incurring needless latency and cost.",
    example:
      "Spinning up a whole subagent just to reformat three sentences the coordinator already retrieved is over-delegation — a direct reply would be faster and cheaper.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Tool distribution across agents",
    definition:
      "The practice of giving each subagent only the tools relevant to its specific role, rather than the full set of tools available to the system, to reduce selection errors and keep each agent within its intended job.",
    example:
      "A synthesis subagent that only writes a report from findings it's handed doesn't need a web-search tool at all, even if a sibling research subagent does.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    term: "Delegation tool (Task/Agent tool)",
    definition:
      "The specific tool a coordinator must have in its own allowed-tools list to be able to spawn any subagent at all; without it present, the coordinator has no mechanism for delegation regardless of how capable subagents might be.",
    example:
      "A coding assistant configured without its Task tool enabled cannot hand off a large refactor to a subagent, no matter how clearly it's instructed to 'delegate this' in its prompt.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    term: "Raw transcript dump (anti-pattern)",
    definition:
      "Passing an entire, unfiltered conversation or tool-output history between agents instead of a filtered, structured summary — this wastes context budget and buries the specific fields the next step actually needs.",
    example:
      "Forwarding a subagent's full 90,000-token browsing transcript to the next stage, instead of the dozen claims-with-sources it actually produced.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "One-pass vs. iterative research",
    definition:
      "A design choice for research-style agent workflows: treating investigation as strictly a single round versus allowing the coordinator to trigger a follow-up round when the first pass reveals unresolved gaps.",
    example:
      "After the first round of subagents returns thin coverage on one subtopic, an iterative coordinator launches a second, narrower round instead of shipping an incomplete report.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Fixed chain vs. dynamic decomposition mismatch",
    definition:
      "An anti-pattern where the wrong control-flow shape is applied to a task: forcing a rigid, pre-written sequence onto work whose next step truly depends on findings, or forcing step-by-step improvisation onto work that is genuinely always the same sequence.",
    example:
      "Scripting a fixed five-step checklist for diagnosing an unpredictable production incident misses the actual cause just as much as re-deciding from scratch, every time, how to process a routine and identical weekly report.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    term: "Goal-and-criteria brief",
    definition:
      "A way of instructing a subagent by stating the desired outcome and the standard it must meet, then letting the subagent determine its own path — contrasted with over-prescribing a brittle, step-by-step script that breaks the moment reality deviates from it.",
    example:
      "Telling a subagent 'find the root cause and cite the specific log lines that support it' instead of dictating the exact order of commands it must run to get there.",
    difficulty: "MEDIUM",
  },
];
