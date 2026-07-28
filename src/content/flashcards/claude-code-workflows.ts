import type { FlashcardSeed } from "../types";

// Original flashcards written for this app covering Claude Code Configuration
// & Workflows. Wording, examples, and phrasing are original — not copied or
// paraphrased from any source. See /about for licensing notes.
export const flashcards: FlashcardSeed[] = [
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Grep (built-in tool)",
    definition:
      "The built-in tool for finding text or patterns inside file contents — function names, error strings, route definitions, and the like. It searches what's written inside files, not filenames themselves.",
    example:
      "To find every place a function called validateInvoice is called, you'd grep for that identifier rather than guess which filenames might contain it.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Glob (built-in tool)",
    definition:
      "The built-in tool for locating files by name or path pattern, such as all files under a directory or all files with a given extension. It does not look inside file contents at all.",
    example:
      "Listing every test file with a pattern like **/*.spec.ts is a Glob job; finding which of those files references a specific mock name is a Grep job.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Glob-for-content mistake (anti-pattern)",
    definition:
      "A common tool-selection error where someone reaches for a filename/path search when what they actually need is a search of what's written inside files. Glob simply has no visibility into file contents, so it silently returns the wrong kind of result.",
    example:
      "Trying to locate a reference to an error code like ERR_STALE_TOKEN by globbing for a filename containing 'stale' misses every occurrence buried inside unrelated files; grepping for the literal string finds them.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Read (built-in tool)",
    definition:
      "The built-in tool for retrieving the full contents of one specific, already-identified file, typically used once a grep or glob has pointed at the right target.",
    example:
      "After grepping and confirming that billing/invoice-service.ts defines the function in question, Read is used to pull up that file in full.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Edit / multi-edit (built-in tool)",
    definition:
      "The built-in tool for making a targeted, precise change to an existing file by matching a unique piece of existing text and replacing it, rather than rewriting the whole file. A multi-edit variant applies several such targeted changes to one file in one pass.",
    example:
      "Renaming a single misspelled config key inside an otherwise-correct 300-line file is an Edit job, not a full rewrite.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Read-then-Write (full file replacement)",
    definition:
      "The pattern of reading a file's current contents and then writing back an entirely new version, appropriate when the desired end state is easier to produce wholesale than to express as a series of targeted edits.",
    example:
      "Regenerating a generated-config file from scratch after a schema change is naturally a Read-then-Write, since almost every line changes anyway.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    term: "Bash (built-in tool)",
    definition:
      "The built-in tool for running shell commands directly, such as executing a test suite, running a linter, or invoking a build script — used to verify or act on the codebase rather than to read or edit it.",
    example:
      "Running the project's test command after an edit to confirm nothing broke is a Bash step, not an Edit step.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Task/subagent delegation (built-in mechanism)",
    definition:
      "The mechanism for handing off a broad, open-ended piece of exploration or work to a subagent, appropriate when a question spans an unknown number of files or an unpredictable path rather than a single clearly located target.",
    example:
      "Asking 'where and how is authentication handled across this entire repository' is broad enough to warrant delegating the search rather than manually chaining grep calls.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    term: "Codebase exploration sequence",
    definition:
      "A repeatable approach to understanding unfamiliar code: search for the relevant identifiers or route names first, read the files that turn up, follow their imports to the core abstractions, then trace one or two real execution paths through it.",
    example:
      "To understand how refunds are processed, first grep for 'refund', read the handler files that match, follow their imports to a shared ledger module, then trace a single refund request from API entry to database write.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Plan mode",
    definition:
      "A workflow control in which exploration happens read-only and a proposed plan is presented for approval before any file is changed. It suits work that spans many files, involves architectural tradeoffs, or needs sign-off before code moves.",
    example:
      "Before restructuring how a monolith's three services share a database connection, plan mode is used to lay out the approach and get approval before touching anything.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Direct execution",
    definition:
      "Making a change immediately without a separate read-only planning phase, appropriate for small, localized, low-risk edits where the target and fix are already clearly understood.",
    example:
      "Fixing an off-by-one bug in a single loop that's already been pinpointed is a direct-execution edit, not something that needs a proposed plan first.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    term: "Plan mode vs. extended thinking (distinction)",
    definition:
      "Two separate mechanisms that get confused: plan mode controls the workflow — explore first, propose, wait for approval — while extended/deep reasoning controls how much reasoning depth is applied to a hard problem. Enabling one does not enable the other, though they can be combined.",
    example:
      "Turning on plan mode for a risky migration doesn't automatically make Claude reason any harder about a tricky edge case; that requires separately invoking deeper reasoning.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Continue-most-recent session flag",
    definition:
      "A session flag that resumes the most recent conversation in the current directory without prompting for which one. It's convenient for picking back up on the latest in-progress work, but risky when multiple terminals or projects mean 'most recent' isn't actually the session you meant.",
    example:
      "Returning to a laptop the next morning and resuming the most recent session works well when only one investigation was open — but picks the wrong one if a second terminal was also active in that directory.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Resume-specific-session flag",
    definition:
      "A session flag/command for resuming an explicitly identified saved session, or bringing up a picker to choose one, rather than assuming 'whatever ran last' is correct. It's the right choice when returning to a specific, named piece of prior work.",
    example:
      "Picking last Tuesday's refactor investigation out of a list of saved sessions, rather than whatever happens to be most recent today.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CLAUDE_CODE_CI_CD",
    term: "Session-ID mechanism",
    definition:
      "A mechanism for tying a session to a stable, specific identifier chosen by the caller, so an automated or programmatic workflow can reliably reference or resume the same session rather than depending on 'most recent' semantics meant for interactive use.",
    example:
      "A nightly pipeline job assigns each run a fixed session identifier tied to the build number, so a later step can reliably reattach to that exact run instead of guessing which session was most recent.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    term: "Fork-session mechanism",
    definition:
      "A mechanism for branching a new session from an existing transcript, leaving the original untouched. It preserves the full tool-call history of the branch point, which manually copy-pasting text into a new session cannot reconstruct.",
    example:
      "Wanting to try a completely different refactor strategy without risking the careful investigation already recorded, the session is forked so the original transcript stays intact either way.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Git worktree (for file isolation)",
    definition:
      "A separate working directory checked out from the same repository, letting two implementation attempts exist on disk simultaneously without one overwriting the other's files. Sessions only preserve conversation history, not filesystem state, so comparing two competing implementations properly means pairing a forked session with a separate worktree, not relying on the fork alone.",
    example:
      "Two candidate approaches to a database migration are built in two separate worktrees, each paired with its own forked session, so either attempt can be discarded without touching the other's files or transcript.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Stale prior session (resuming after code changes)",
    definition:
      "Two reasonable responses to a codebase that has changed since a saved session was recorded: resume the old session and explicitly state exactly which files or functions changed if most of its context is still useful, or start a fresh session with a concise summary if the old transcript is likely stale or misleading.",
    example:
      "If only one helper function was renamed since last week's session, resuming and naming that rename is enough; if the whole module was rewritten, starting fresh avoids working from outdated assumptions.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Scratchpad (exploration notes)",
    definition:
      "A concise, durable written note kept during a long codebase exploration, capturing the important files touched, the data flow understood so far, open questions, confirmed assumptions, and risk areas or next steps — so the investigation survives context compaction or a handoff to another session.",
    example:
      "Partway through tracing a payment bug, a scratchpad entry records which three files matter, what's confirmed about the retry logic, and what's still unverified about the timeout path.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "CLAUDE.md",
    definition:
      "A file where a developer or team writes persistent context loaded at the start of a session: build commands, coding conventions, architecture notes, and workflow preferences. It shapes behavior as context, but does not enforce it.",
    example:
      "A CLAUDE.md noting 'run npm run typecheck before committing' reliably surfaces that convention, but doesn't itself stop a commit if it's skipped.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "CLAUDE.md nesting",
    definition:
      "CLAUDE.md files can exist at multiple directory levels in a project. A more deeply nested file typically adds detail specific to that subtree, and both the repo-root and the nested file are loaded together rather than the nested one replacing the parent wholesale.",
    example:
      "A repo-root CLAUDE.md describes overall style, while a services/payments/CLAUDE.md adds extra conventions specific to that directory, and both apply together when working inside payments.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Rule file glob scoping",
    definition:
      "A separate rule file, focused on one concern, can be scoped to apply only to files matching a glob pattern, so it loads only when relevant instead of adding to every session's context regardless of what's being worked on.",
    example:
      "A rule about mock-naming conventions is scoped to **/*.test.ts, so it appears in context while writing tests but not while editing an unrelated config file.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Hooks (enforcement mechanism)",
    definition:
      "A mechanism that actually intercepts and can block actions, unlike prose in CLAUDE.md or memory. Anything that absolutely must hold — a forbidden destructive command, a mandatory approval gate — belongs in a hook or an explicit permission-deny rule, not in written instructions alone.",
    example:
      "A hook that blocks any command matching a production database drop pattern will stop it even if the model, for whatever reason, tries to run it — unlike a CLAUDE.md line asking it not to.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CLAUDE_CODE_CI_CD",
    term: "CLAUDE.md/memory vs. hooks/permissions (enforcement gap)",
    definition:
      "The core distinction of this domain: CLAUDE.md and memory shape behavior by being read as context, with no compliance guarantee; hooks and permission rules enforce behavior by actually intercepting actions. Mistaking the former for the latter leaves a supposed hard rule unenforced.",
    example:
      "Writing 'never push directly to main' in CLAUDE.md sets an expectation; only a hook or a permission rule blocking that push actually guarantees it can't happen.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Self-review context isolation (pitfall)",
    definition:
      "A session that just finished writing some code tends to be less critical when asked to review that same code, since it's reviewing choices it already committed to making. A fresh context is less prone to this blind spot.",
    example:
      "Asking the same session that wrote a caching layer whether the caching layer has bugs tends to get a lighter review than asking a brand-new session to look at just the diff.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Claude Agent SDK",
    definition:
      "A developer library (available for TypeScript and Python) that exposes the same underlying agent harness that powers Claude Code — built-in tools, permissions, hooks, subagents, and context management — so a team can build a custom agent product or automation, rather than only using Claude Code interactively in a terminal.",
    example:
      "A team building an internal on-call triage bot uses the Agent SDK, since the bot needs to run unattended as part of their own service rather than as an interactive terminal session.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Agent SDK vs. raw Messages API",
    definition:
      "Calling the Messages API directly returns one completion per request and leaves the entire agentic loop — deciding when to call a tool, executing it, feeding the result back, deciding when to stop — for the developer to build themselves. The Agent SDK provides that loop, plus built-in tools and context management, instead of requiring it from scratch.",
    example:
      "A team that started wiring up their own tool-call loop directly against the Messages API found they were reimplementing permission checks and context compaction the Agent SDK already provides.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Agent SDK permission modes",
    definition:
      "A configurable control, mirroring Claude Code's own permission system, over how much autonomy an SDK-built agent has before an action requires human approval — from requiring confirmation on risky actions to running with broader autonomy for a trusted, narrowly scoped automation.",
    example:
      "An SDK-built agent that only reads logs and drafts a report can run with far more autonomy than a separate SDK-built agent permitted to modify production infrastructure.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Agent SDK hooks",
    definition:
      "Programmatic callbacks at points in an SDK-built agent's loop (such as before or after a tool call) that let a developer enforce a hard rule or add custom logic in code — the same enforcement mechanism Claude Code itself relies on, now available to a custom agent a team builds.",
    example:
      "A hook that blocks any tool call touching a production database is added to an SDK-built deployment agent, enforcing the rule in code rather than leaving it to a system-prompt instruction.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Agent SDK subagents",
    definition:
      "The same delegation pattern used in Claude Code — spawning a subagent with its own fresh context and its own scoped set of tools to handle a subtask — available to a custom agent built with the Agent SDK, not just to interactive Claude Code sessions.",
    example:
      "An SDK-built research agent delegates a 'fetch and summarize five sources' subtask to a subagent with only search and fetch tools, keeping the coordinator's own context focused on synthesis.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    term: "Agent SDK context management",
    definition:
      "Automatic handling of a long-running SDK-built agent's context — such as compaction as the conversation approaches its limit — provided by the SDK itself rather than something the developer has to implement from scratch, the same way Claude Code manages context in an interactive session.",
    example:
      "A long-running SDK-built agent monitoring a multi-hour deployment doesn't need custom summarization logic, since the SDK's own context management already condenses older history as the session grows.",
    difficulty: "HARD",
  },
];
