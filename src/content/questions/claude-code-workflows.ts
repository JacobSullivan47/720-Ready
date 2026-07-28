import type { QuestionSeed } from "../types";

// Original practice questions written for this app covering Claude Code
// Configuration & Workflows. These are original scenarios designed to test
// the same underlying knowledge as the certification exam — they are not
// reconstructions or paraphrases of any real exam question. Wording and
// scenarios are our own. See /about for licensing notes.
export const questions: QuestionSeed[] = [
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A developer asks an assistant to locate the function that handles order cancellations somewhere in an unfamiliar codebase, but doesn't know the filename. The assistant instead tries a series of filename patterns like **/*cancel*.ts and **/*order*.ts, none of which turn up the function, which actually lives in a broadly named file called handlers.ts. What went wrong?",
    options: [
      "The assistant should have used Bash to run the full test suite and inspect the output for the handler instead",
      "The assistant used Glob when the target text lives inside file contents, which calls for Grep instead",
      "The assistant should have skipped exploration entirely and just guessed at the fix based on the filename",
      "Glob patterns cannot include wildcards for file extensions, so extension-based searches never match anything",
    ],
    correctIndexes: [1],
    explanation:
      "This is the classic Glob-for-content mistake: the function's name is text inside a file, not part of any filename, so no filename pattern will surface it. Grepping for the function name or a related identifier would find it regardless of what the file is called. Running tests doesn't help locate code, guessing skips necessary exploration, and Glob does support extension wildcards — that's not the issue here.",
    eli10:
      "You're looking for a toy in a messy room by only checking boxes labeled with the toy's name — but the toy is actually in a box labeled 'misc.' Checking labels won't work; you have to look inside the boxes.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A single line inside an otherwise correct 400-line file has a hardcoded timeout value that needs to change from 30 to 60. Which built-in approach best fits this change?",
    options: [
      "Read the file first, then Write out a full replacement copy of it",
      "A targeted Edit that matches the unique line and replaces it",
      "Delegate the one-line change to a subagent via the Task tool",
      "Use Glob to search for the number 30 and replace it directly",
    ],
    correctIndexes: [1],
    explanation:
      "A single, uniquely identifiable line change is exactly what a targeted Edit is for — small, precise, low blast radius. Read-then-Write is overkill for changing one line when the rest of the file is unaffected. Delegating a one-line fix to a subagent is unnecessary overhead. Glob only matches filenames/paths, not numeric values inside a file's content.",
    eli10:
      "If one word in a whole essay is wrong, you don't retype the entire essay — you just cross out that one word and write the new one. That's what a targeted edit does.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    type: "SINGLE",
    prompt:
      "An engineer is trying to understand how a specific webhook route processes incoming events in an unfamiliar service. Which sequence best matches an efficient exploration strategy?",
    options: [
      "Read every file in the service directory from smallest to largest, in file-size order, regardless of relevance",
      "Grep for the route name or error code, read the matches, follow imports to core logic, then trace one event through",
      "Immediately rewrite the webhook handler from scratch, relying only on general webhook conventions rather than the existing code",
      "Search only the project's README for a description of the webhook's behavior, and stop there without checking the code",
    ],
    correctIndexes: [1],
    explanation:
      "This mirrors the efficient exploration pattern: grep for the specific identifier, read what turns up, follow imports to the core logic, and trace a real path through it. Reading every file by size order is unstructured and wastes effort on irrelevant files. Rewriting from scratch without understanding what already exists risks losing correct behavior. Stopping at a README skips verifying against the actual code, which may be outdated relative to the docs.",
    eli10:
      "To learn how a machine works, you'd trace one part through the gears step by step, rather than staring at every part in a random order or just reading an old instruction manual and assuming it's still accurate.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    type: "SINGLE",
    prompt:
      "A team is planning to change how three separate services share a database connection pool, a change that touches all three services' configuration and could break existing behavior if done incorrectly. Which workflow best fits this situation?",
    options: [
      "Direct execution, treating the shared database connections as a routine, low-stakes detail",
      "Plan mode, exploring read-only first and proposing an approach before any file is changed",
      "Extended thinking alone, without otherwise changing the workflow being used",
      "Skipping exploration and reapplying the same fix used for a previous, unrelated bug",
    ],
    correctIndexes: [1],
    explanation:
      "A change spanning multiple services, involving architectural tradeoffs, and carrying real risk of breaking things is exactly what plan mode is for: explore first, propose, then get approval before acting. Direct execution understates the risk here. Extended thinking affects reasoning depth, not whether changes happen before or after a proposed plan — it doesn't substitute for the workflow control needed. Reusing an unrelated prior fix ignores the specifics of this codebase.",
    eli10:
      "If you're rearranging plumbing that three different houses share, you'd want to sketch out the plan and get everyone's okay before touching any pipes — not just start unscrewing things.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    type: "SINGLE",
    prompt:
      "A developer enables plan mode for a complex migration and assumes this automatically means the assistant is now reasoning more deeply about tricky edge cases in the migration logic. Is this assumption correct?",
    options: [
      "Yes, plan mode and extended or deep reasoning mode are simply two different names for the exact same underlying mechanism",
      "No — plan mode governs explore-then-approve workflow behavior; reasoning depth is a separate, independent mechanism",
      "Yes, but only once the migration involves more than five separate files being touched during the work",
      "No, because enabling plan mode actually disables all reasoning entirely until a plan gets approved",
    ],
    correctIndexes: [1],
    explanation:
      "Plan mode and extended thinking are two distinct mechanisms that are commonly confused: one controls the workflow (read-only exploration, propose, wait for approval), the other controls how much reasoning depth is applied to a hard problem. They can be used together, but turning one on does not automatically turn on the other. The file-count threshold and 'reasoning is disabled' options are both fabricated distinctions.",
    eli10:
      "Turning on your bike's headlight doesn't automatically make you pedal harder — those are two separate things you control independently, even though you might want both at once on a dark, steep hill.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A developer worked in one terminal yesterday on a refactor, then opened a second terminal later that day to quickly check something unrelated in the same project directory. This morning, they want to resume yesterday's refactor specifically. Which approach is safest?",
    options: [
      "Use the flag that resumes the most recent conversation in the current project directory",
      "Use the resume-specific-session flag or picker to explicitly choose yesterday's session",
      "Start a brand-new session and hope it somehow remembers yesterday's refactor automatically",
      "Open yet another, third terminal and use the most-recent flag there instead",
    ],
    correctIndexes: [1],
    explanation:
      "Because a second, unrelated session was opened afterward in the same directory, 'most recent' would resume the wrong conversation. Explicitly resuming the specific, named session avoids that risk. A brand-new session has no memory of the prior work at all. Opening yet another terminal doesn't change which session counts as 'most recent' and doesn't solve the ambiguity.",
    eli10:
      "If you left off reading one book yesterday, but skimmed a totally different book for two minutes today, grabbing 'whatever book you touched last' would hand you the wrong one. You have to point at the specific book you actually mean.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CLAUDE_CODE_CI_CD",
    type: "SINGLE",
    prompt:
      "A nightly automated pipeline runs a Claude Code job as part of build verification, and a later pipeline stage needs to reliably reattach to that exact run to read its results, unaffected by any other jobs sharing the runner. Which session mechanism fits best?",
    options: [
      "The continue-most-recent flag, since it's the simplest option",
      "A stable, caller-assigned session identifier tied to that specific run",
      "The resume-specific-session picker, since a human can select the right one",
      "Forking a session from the job, since forking guarantees a fixed identifier",
    ],
    correctIndexes: [1],
    explanation:
      "Programmatic, automated workflows need a reliable, addressable session rather than relying on 'most recent' semantics meant for interactive use — a caller-assigned session identifier serves exactly that purpose. The continue-most-recent flag is unreliable on a shared runner with concurrent jobs. A picker requires human interaction, which an automated pipeline doesn't have. Forking creates a new branched transcript but doesn't by itself provide a stable, addressable identifier for automation to target.",
    eli10:
      "In a busy warehouse with many packages moving at once, you don't want to grab 'whatever package arrived last' — you want the one with the exact tracking number you were given.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    type: "SINGLE",
    prompt:
      "A developer has a long, carefully built investigation session tracing a subtle bug and wants to try a completely different hypothesis about the root cause without risking the existing transcript. What best achieves this?",
    options: [
      "Resume the same session and simply ask it to consider an alternative hypothesis instead",
      "Fork the session, branching a new transcript so the original investigation stays untouched",
      "Start a brand-new session and manually retype a summary of everything discovered so far",
      "Close the original session entirely and start the whole investigation over from nothing",
    ],
    correctIndexes: [1],
    explanation:
      "Forking creates a new session branched from the existing transcript, preserving the original untouched, so the alternative hypothesis can be explored without contaminating the careful investigation already recorded. Resuming the same session risks polluting or overwriting the original line of reasoning. Manually retyping a summary loses the actual tool-call history that only forking preserves. Starting over from nothing discards all the prior investigative work for no reason.",
    eli10:
      "If you've built a great sandcastle and want to try a new tower design, you'd make a copy nearby to experiment on, rather than risking knocking over the original one you already like.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A developer forks a session to try an alternative implementation of a feature, but continues working in the very same project directory on disk as the original session used. What is the risk here?",
    options: [
      "There is no risk at all, since forking a session also isolates all file changes automatically",
      "Forking only preserves conversation history, not filesystem state, so both attempts edit the same files on disk",
      "Forking a session always fails outright whenever the target directory is not already completely empty",
      "Forking automatically creates a matching git worktree for you, so this particular concern doesn't really apply here",
    ],
    correctIndexes: [1],
    explanation:
      "Sessions persist conversation history, not filesystem state, so a forked session working in the same directory as the original can still overwrite the same files. Properly isolating two implementation attempts requires pairing the fork with a separate git branch or worktree, not relying on the session fork alone. Forking does not fail on a non-empty directory, and it does not automatically create a worktree — that pairing has to be done deliberately.",
    eli10:
      "Making a copy of your homework notes doesn't stop two people from writing on the very same piece of paper — if you want two separate drafts, you need two separate sheets, not just two sets of notes about the one sheet.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "While tracing an intermittent bug across several files, an engineer keeps losing track of which files matter and what's already been confirmed each time the conversation runs long. What practice best addresses this?",
    options: [
      "Keep a concise scratchpad noting key files, data flow so far, open questions, and confirmed assumptions",
      "Avoid taking any notes at all, relying purely on memory of the conversation as it unfolds over time",
      "Restart the investigation completely from the beginning every single time it starts feeling long",
      "Only write anything down once the entire investigation is completely finished and fully confirmed",
    ],
    correctIndexes: [0],
    explanation:
      "A scratchpad capturing important files, data flow, open questions, and confirmed assumptions is exactly the practice meant to prevent losing an investigation's progress, especially if context compacts or another session picks it up later. Relying purely on memory is fragile over a long or interrupted investigation. Restarting from scratch repeatedly wastes the work already done. Waiting until the very end to write anything down defeats the purpose of preserving progress along the way.",
    eli10:
      "If you're solving a big mystery over several days, it helps to keep a running notebook of clues and suspects, rather than trying to remember it all in your head or throwing away your notes and starting over each morning.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A repository has a root-level CLAUDE.md describing general coding conventions, and a second CLAUDE.md inside services/billing/ describing conventions specific to that directory. When working inside services/billing/, what should be expected?",
    options: [
      "Only the nested services/billing/ CLAUDE.md is loaded, fully replacing the root one entirely",
      "Only the root-level CLAUDE.md is loaded; any nested CLAUDE.md files are always silently ignored",
      "Both are loaded together, with the nested file adding detail rather than overriding the root",
      "The two files must always be manually merged into one by a developer before either can be used",
    ],
    correctIndexes: [2],
    explanation:
      "CLAUDE.md can be nested at multiple directory levels, and both the root and the more specific nested file are loaded together — the nested one supplements the broader repo-wide guidance with subtree-specific detail rather than replacing it. Neither file is ignored, and there's no requirement to manually merge them; the loading of both is automatic.",
    eli10:
      "A school has a general rulebook for the whole building, plus an extra page of rules just for the science lab. When you're in the lab, you follow both the general rules and the lab's extra rules together — the lab page doesn't erase the building's rules.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A team wants a rule file describing mocking conventions to be visible only when working on test files, without cluttering every other session's context. What is the correct way to achieve this?",
    options: [
      "Write the rule directly into the root CLAUDE.md so that it always loads for every session",
      "Scope the rule file to a glob pattern matching test files, such as **/*.test.ts",
      "Store the rule only in assistant memory instead of writing an actual rule file",
      "Duplicate the exact same rule text into every individual test file by hand",
    ],
    correctIndexes: [1],
    explanation:
      "Rule files can be scoped by glob pattern, so a rule about test conventions can be limited to files matching a pattern like **/*.test.ts, keeping it out of context when working on unrelated code. Putting it in the root CLAUDE.md would load it everywhere, including irrelevant sessions. Assistant memory is a different mechanism meant for accumulated notes, not a substitute for scoped project rules. Duplicating text into every test file is unnecessary and hard to maintain.",
    eli10:
      "If a rule only matters in the art room, you'd post the sign in the art room, not repeat it on every door in the school or write it once somewhere nobody in the art room will see.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A team lead writes \"CRITICAL: never run a database migration without explicit approval\" in the project's CLAUDE.md and considers the rule fully handled. What is the flaw in this approach?",
    options: [
      "There is no flaw here; capitalized keywords in CLAUDE.md get enforced the exact same way a permission rule does",
      "CLAUDE.md is read as context that shapes behavior, not enforced; a must-hold rule needs a hook or deny rule instead",
      "CLAUDE.md files simply cannot ever contain any instructions about database migrations at all, by design",
      "The rule would only actually work if it were placed in assistant memory instead of inside a CLAUDE.md file",
    ],
    correctIndexes: [1],
    explanation:
      "CLAUDE.md content, however emphatically worded, is read as context that the model tries to follow — it does not enforce anything. A rule that absolutely must hold, like blocking migrations without approval, needs to live in a hook or an explicit permission-deny rule, which actually intercepts the action. Capitalization doesn't change this. CLAUDE.md can contain any topic's guidance; the issue isn't the topic. Moving the same prose to memory wouldn't add enforcement either, since memory has the same non-enforcing nature.",
    eli10:
      "Writing 'DO NOT open this drawer!!!' in big letters on a note doesn't physically lock the drawer — if you truly need it to stay shut, you need an actual lock, not just a stronger-sounding note.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    type: "SINGLE",
    prompt:
      "Immediately after writing a new caching layer, the same session that wrote it is asked whether the code has any bugs, and it reports back that everything looks solid. What consideration is most relevant to how much weight that self-review deserves?",
    options: [
      "None at all — a session's review of its own recent work is exactly as reliable as any independent, fresh review would be",
      "The session that wrote the code tends to be less critical of its own choices, so a fresh session or review subagent tends to be more reliable",
      "Self-review is always strictly more reliable than any kind of external code review, since the original author best understands the original intent",
      "The review should only be trusted if the very same session happened to use plan mode while originally writing the code",
    ],
    correctIndexes: [1],
    explanation:
      "A session that just wrote some code tends to be less critical of its own choices when reviewing them, since it's evaluating decisions it already made. For anything high-stakes, a fresh context — a new session, a dedicated review subagent, external CI-based review, or a separate session given the diff plus explicit criteria — tends to catch more than self-review. Neither of the absolute claims (self-review is equally reliable, or always more reliable) holds, and whether plan mode was used while writing doesn't change this particular self-review blind spot.",
    eli10:
      "If you just built a sandcastle, you're probably going to think it looks great, because you're proud of every choice you made building it. Someone who didn't build it will spot the wobbly tower you might overlook.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "Which of the following is an accurate distinction between the built-in tools Grep and Glob in Claude Code?",
    options: [
      "Grep searches for patterns inside file contents, while Glob matches files by name or path pattern — so using Glob to find a code reference that's actually inside file contents is a common tool-selection mistake",
      "Glob can be used to search for a specific error string buried inside a JSON config value's contents",
      "Grep and Glob are simply two different names for the exact same underlying search behavior internally",
      "Glob is only ever usable on whole directories, never on individual files by themselves",
    ],
    correctIndexes: [0],
    explanation:
      "Grep vs. Glob is precisely a contents-search vs. filename/path-search distinction, and mistaking one for the other (especially reaching for Glob when the target text lives inside a file) is a well-known pitfall. Glob cannot see inside a JSON value, so it can't find an error string buried in file content — that's a Grep job. The two tools are not interchangeable or identical. Glob's scope is about matching filename/path patterns, not a restriction to directories only.",
    eli10:
      "Grep reads what's written inside books; Glob just looks at the titles on the spines. Mixing them up — like checking spines to find a sentence hidden inside a book — is a common mistake, and they are not the same tool doing the same thing.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "Which of the following correctly describes a session management flag/mechanism in Claude Code?",
    options: [
      "A continue-most-recent flag is convenient, but risky if multiple terminals were active and it isn't the intended session, which is exactly why a session-ID mechanism suits automated workflows that need a stable, addressable session instead",
      "Forking a session automatically isolates file changes on disk, in addition to the conversation history itself",
      "Resuming the same saved session from two terminals at once is always perfectly safe, with zero risk whatsoever",
      "The resume-specific-session mechanism only ever works for sessions that were created within the past hour or so",
    ],
    correctIndexes: [0],
    explanation:
      "The continue-most-recent flag's 'most recent isn't always the intended one' risk, and the session-ID mechanism's fit for stable, programmatic workflows, are both accurate. Forking only preserves conversation history, not filesystem state, so it does not by itself isolate files — a worktree is needed for that. Resuming the same session from two terminals at once risks conflicting edits, it isn't safe by default. And there's no time restriction limiting the resume-specific-session mechanism to sessions from the last hour.",
    eli10:
      "Grabbing 'whatever you touched last' can hand you the wrong thing if you touched several things recently, so a program that needs to reliably find one exact item should use a fixed label for it instead. But making a copy of your notes doesn't also copy your actual toys, and two people writing in the same notebook at once can absolutely bump into each other.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "Which of the following correctly describes CLAUDE.md and/or assistant memory in Claude Code?",
    options: [
      "Both CLAUDE.md and assistant-maintained memory load as context that shapes behavior, with no guarantee of compliance — so a rule that must be enforced without exception belongs in a hook or permission-deny rule, not CLAUDE.md prose alone",
      "Nested CLAUDE.md files completely replace the repo-root CLAUDE.md file entirely, whenever both happen to exist",
      "Assistant-maintained memory can only ever be edited by directly modifying the project's root CLAUDE.md file itself",
      "CLAUDE.md gets automatically compiled into an enforced permission rule the very moment it is saved",
    ],
    correctIndexes: [0],
    explanation:
      "Both CLAUDE.md and memory are read as context that shapes behavior with no compliance guarantee, and a rule that absolutely must hold belongs in a hook or permission-deny rule rather than relying on CLAUDE.md prose. Nested CLAUDE.md files supplement the root one rather than replacing it wholesale. Assistant memory is a separate mechanism from CLAUDE.md, not merely a section within it. CLAUDE.md is never automatically compiled into enforced permissions; it remains advisory context.",
    eli10:
      "A sticky note and a rulebook page are both just reminders someone reads — neither one locks a door by itself. If a door truly must stay locked, you need an actual lock, not a better-written note. And a note about the art room doesn't erase the sign on the school's front door; both apply.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "Which of the following correctly describes plan mode as a workflow control in Claude Code?",
    options: [
      "It explores the codebase read-only and proposes an approach before any file gets changed, and best suits work spanning many files, architectural decisions, or changes needing approval first",
      "It is simply just another name for enabling extended or deep reasoning mode",
      "It can only ever be enabled at the very start of a session and never toggled afterward",
      "It guarantees the eventual implementation will require zero further changes after approval",
    ],
    correctIndexes: [0],
    explanation:
      "Plan mode's defining behavior is exploring read-only and proposing a plan for approval before changes land, and it fits work with wide scope, architectural stakes, or a need for sign-off. It is a distinct mechanism from extended thinking, not another name for it. It can typically be toggled during a session, not only at the very start. And approving a plan doesn't guarantee the resulting implementation will need no further revisions.",
    eli10:
      "Plan mode is like sketching a blueprint and getting it approved before building anything — that part's true, and it suits big, tricky building projects. But sketching a blueprint isn't the same as thinking harder, you can pick up a pencil again mid-project, and an approved blueprint doesn't guarantee the finished building needs zero touch-ups.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A developer needs to bump one dependency's version string inside package.json, a change confined to a single file with no architectural implications and a clearly defined target line. Which workflow best fits this?",
    options: [
      "Plan mode, since any dependency bump could theoretically introduce risk somewhere down the line",
      "Direct execution, since this is a small, localized, low-risk change with a clearly defined target",
      "Delegating the entire one-line task to a subagent via Task, to keep the main session free",
      "Forking the session first, so the version bump can be tried out on a separate transcript",
    ],
    correctIndexes: [1],
    explanation:
      "A small, localized, low-risk change with an obvious target is exactly what direct execution suits — there's no need to explore read-only or seek approval first. Plan mode is reserved for work spanning many files, architectural tradeoffs, or genuine risk, none of which apply to a one-line version bump. Delegating such a trivial, well-defined edit to a subagent adds overhead for no benefit. Forking addresses branching a conversation or comparing alternatives, not the risk level of a single tiny edit.",
    eli10:
      "If you just need to change one number on a form, you don't call a meeting first or hand it off to someone else — you just write the new number. Save the careful planning for the big, complicated stuff.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "One engineer asks for a new API endpoint by saying only 'follow our usual style,' while another asks for the same endpoint by saying 'match the pattern in src/routes/users.ts and register it in src/routes/index.ts the way the other routes are registered.' Which request is more likely to produce a correctly styled result, and why?",
    options: [
      "The vague request, because 'usual style' implicitly covers every possible edge case without needing detail",
      "The specific request, because pointing to concrete files gives a verifiable pattern rather than an ambiguous instruction",
      "Both are equally effective either way, since the assistant infers identical conventions regardless of how the request is phrased",
      "Neither matters much, since referenced files are never actually read before new code gets written",
    ],
    correctIndexes: [1],
    explanation:
      "Referencing concrete files gives an unambiguous, checkable example to match, which is more effective than a vague instruction like 'usual style' that could mean many different things depending on interpretation. The two requests are not equally effective — specificity measurably reduces ambiguity. And referenced files are exactly the kind of context that does get read to inform the new code, not ignored.",
    eli10:
      "Saying 'draw it like my other drawing on this page' is a lot clearer than just saying 'draw it in my style' with nothing to point at. Showing the actual example helps way more than a vague description.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "SINGLE",
    prompt:
      "A team wants to understand why their nightly build has gradually slowed down over several months. The cause could be CI configuration drift, dependency changes, test suite growth, or infrastructure changes, and there's no single obvious file or function to start from. Which approach best fits this kind of broad, open-ended investigation?",
    options: [
      "A single Grep search for the literal word 'slow' across the entire repository's whole codebase and history",
      "Delegating the investigation to a subagent via Task, since it spans many unrelated areas with no clear start",
      "A targeted Edit straight to the CI configuration file, simply assuming that alone is the cause",
      "Read-then-Write the entire CI pipeline definition completely from scratch, skipping further investigation",
    ],
    correctIndexes: [1],
    explanation:
      "An investigation this broad — spanning CI config, dependencies, tests, and infrastructure with no clear single starting point — is exactly what delegating to a subagent via Task is meant for. Grepping for a generic word like 'slow' won't surface a structural, multi-part cause. Editing the CI config on an unverified assumption skips the investigation entirely. Rewriting the whole pipeline definition from scratch is disproportionate and doesn't diagnose anything.",
    eli10:
      "If you don't know why your whole morning routine keeps taking longer — maybe it's breakfast, maybe it's traffic, maybe it's something else entirely — you'd want a helper to look into all of it broadly, not just check one guess or search for one random word.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A developer paused a saved session three months ago while investigating a performance issue. Since then, another engineer substantially rewrote the module in question, so the old transcript's specific file contents and code snippets likely no longer match reality. What is the better approach now?",
    options: [
      "Resume the old session and continue exactly where it left off yesterday, without mentioning the rewrite at all",
      "Start a fresh session with a concise summary of the goal, since the old transcript's specifics are likely stale",
      "Use the continue-most-recent flag, trusting that it will automatically detect and account for the rewrite",
      "Fork the old session, since forking automatically refreshes its understanding of current file contents too",
    ],
    correctIndexes: [1],
    explanation:
      "When a codebase has changed enough that an old transcript's specifics are likely stale or misleading, starting fresh with a concise summary of the goal is the safer path. Resuming without acknowledging the rewrite risks the assistant reasoning from outdated file contents it still 'remembers.' The continue-most-recent flag has no awareness of code changes — it just picks a conversation. Forking only branches the conversation transcript; it does not re-read files or refresh any understanding of current content.",
    eli10:
      "If your notes about a room are three months old and someone repainted and rearranged all the furniture since, trusting those old notes could lead you the wrong way. It's better to walk in fresh with just your goal in mind than to follow a description of a room that no longer exists.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A team wants to properly compare two alternative implementations of a caching strategy side by side, making sure neither attempt's file changes interfere with the other and that each line of reasoning stays separate. Which combination correctly achieves this?",
    options: [
      "Forking the session alone, since a forked session isolates both conversation history and file changes automatically",
      "Forking the session to branch the conversation, paired with a separate git branch or worktree for disk isolation",
      "Resuming the same saved session twice in sequence, since resuming alone preserves all necessary isolation",
      "Copy-pasting a summary of the original conversation into two brand-new sessions instead of forking it",
    ],
    correctIndexes: [1],
    explanation:
      "Properly comparing two implementations requires both: forking the session to keep the reasoning branches separate, and a distinct git branch or worktree so the actual file changes on disk don't collide. Forking alone only isolates conversation history, not files. Resuming the same session twice doesn't create two separate reasoning branches at all. Copy-pasting a summary loses the tool-call history that forking preserves, and still does nothing about file isolation.",
    eli10:
      "To fairly test two different cake recipes, you'd want two separate notebooks for your notes AND two separate bowls for the batter. Just having two notebooks but mixing both recipes in the same bowl would ruin the comparison.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "CLAUDE_CODE_CI_CD",
    type: "SINGLE",
    prompt:
      "After patching a flaky function, a developer wants to confirm the existing test suite still passes before considering the fix done. Which built-in tool is the natural fit for this verification step?",
    options: [
      "Edit, since it can also validate that a change behaves correctly",
      "Bash, to run the test suite and inspect the results directly",
      "Glob, to locate all test files by their file extension",
      "Task, to delegate the running of a single test command to a subagent",
    ],
    correctIndexes: [1],
    explanation:
      "Running a test suite is a shell operation, which is exactly what Bash is for — it executes the tests and surfaces pass/fail results. Edit only changes file contents; it doesn't execute or validate anything. Glob can find test files by pattern but can't run them. Delegating a single, well-defined command like 'run the tests' to a subagent is unnecessary overhead when Bash can do it directly.",
    eli10:
      "To check if your fixed bike actually works, you ride it — you don't just look at where the bike shop is located, and you don't need to send a friend to ride it for you when you can just hop on yourself.",
    difficulty: "EASY",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A configuration file needs to be restructured from a flat list of key-value pairs into a nested, grouped format, a change that touches nearly every line and alters the file's overall shape rather than one isolated spot. Which built-in approach fits best?",
    options: [
      "A single targeted Edit that matches just one unique flat key-value block within the file",
      "Read the file to understand its content, then Write a full replacement in the new nested structure",
      "Glob for the configuration file's name and restructure its contents directly through the match",
      "Delegate the entire single-file restructuring to a subagent via Task, treating it as broad exploration",
    ],
    correctIndexes: [1],
    explanation:
      "When a change touches nearly the entire file and reshapes its structure, Read-then-Write is the better fit — a targeted Edit is meant for a small, uniquely identifiable change, not a near-total rewrite. Glob only locates files by name or path; it can't alter content. Task-based delegation is meant for broad, open-ended exploration across many files or unknowns, not a single, well-understood file rewrite.",
    eli10:
      "If you're reorganizing your entire sock drawer into new sections instead of just swapping one sock, you empty it out and rearrange everything at once — you don't just nudge a single sock, and you don't need to search the house for the drawer's name tag first.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A team scopes a rule file about REST error-handling conventions to the glob pattern src/api/v1/**/*.ts, intending it to guide all of their HTTP handlers. Months later they add a new src/api/v2/ directory with the same kind of handlers, and notice the rule never seems to apply there. What happened?",
    options: [
      "Rule files can only ever be scoped to a single fixed directory for a project's entire lifetime",
      "The glob pattern was scoped too narrowly, so it silently fails to apply to the new v2 handlers as well",
      "CLAUDE.md and rule files stop functioning entirely once any new top-level directory gets added",
      "Rule files only ever apply to files that already existed at the exact moment the rule file was originally written",
    ],
    correctIndexes: [1],
    explanation:
      "This is the too-narrow side of glob scoping: a pattern locked to src/api/v1/**/*.ts simply won't match anything under src/api/v2/, so the rule silently fails to apply where it's actually still relevant — no error is raised, it just doesn't apply. Rule file scope can be adjusted at any time, not fixed forever. Adding a new directory doesn't break CLAUDE.md or rule files generally. And rule files apply based on path matching at the time of use, not a frozen snapshot of files that existed when the rule was authored.",
    eli10:
      "If a sign only says 'quiet please' on Hallway A's door, putting up a brand-new Hallway B won't make people there follow that rule too — the sign simply doesn't cover a hallway it was never posted on.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
    type: "SINGLE",
    prompt:
      "Which of the following accurately describes when to reach for a particular built-in tool in Claude Code?",
    options: [
      "Bash is the appropriate tool for running a test suite or other shell commands, not for searching file contents, and a full-file Read-then-Write fits when a change touches nearly the entire file's structure, not just one isolated line",
      "Task-based subagent delegation is best reserved for only the smallest, most trivial single-line changes possible",
      "Edit is the preferred tool of choice whenever a change spans dozens of completely unrelated files at once",
      "Grep should always be used instead of Bash whenever the actual goal is to execute a test suite",
    ],
    correctIndexes: [0],
    explanation:
      "Bash is correctly the tool for executing shell commands like a test suite, and Read-then-Write correctly fits a near-total file rewrite rather than an isolated change. Task-based delegation is reserved for broad, open-ended work, not trivial single-line edits — that's backwards from the actual guidance. Edit suits a small, targeted, uniquely identifiable change, not dozens of unrelated files simultaneously. And Grep only searches file contents; it cannot execute anything, so it can't substitute for Bash when running tests.",
    eli10:
      "Using a wrench to run a race doesn't work, and using a stopwatch to tighten a bolt doesn't either — each tool fits a specific job. Running tests needs the tool that actually runs things, and rewriting almost a whole page needs a fresh page, not a single crossed-out word.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "Which of the following correctly describes how to handle resuming work after significant time has passed and the codebase may have changed?",
    options: [
      "If most of a saved session's context is still useful, resuming and noting exactly what changed is reasonable — but if the old transcript is likely stale or misleading instead, starting fresh with a concise goal summary is often safer",
      "A saved session automatically re-scans the entire codebase for any changes the moment it gets resumed again",
      "Once a session is forked, its understanding of the codebase is guaranteed current no matter how much time passed",
      "Assistant-maintained memory automatically rewrites itself to match any codebase changes, without ever being told",
    ],
    correctIndexes: [0],
    explanation:
      "Both are legitimate, complementary strategies depending on how stale the old context is: resume-and-correct when most of it still holds, or start fresh with a summary when it doesn't. There is no automatic re-scanning of the codebase when a session resumes — stale assumptions can persist unless corrected. Forking only branches the conversation transcript; it doesn't refresh or verify anything about current file contents. And assistant memory doesn't self-update to track code changes on its own — it still reflects whatever was previously noted until told otherwise.",
    eli10:
      "Coming back to a project after a long break, you either say 'hey, here's exactly what changed while I was gone' if most of what you remember still holds up, or you start over with just the goal in mind if too much has changed. Nothing automatically re-checks the room for you or magically updates your old notes by itself.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A team wants to build a custom on-call triage agent that runs unattended as part of their own internal service, rather than as an interactive terminal session. Which is the most appropriate way to build this?",
    options: [
      "The Claude Agent SDK, since it exposes the same agent harness — tools, permissions, context management — for building a custom agent product",
      "The Claude Code CLI directly, since it's designed to be embedded inside other services without modification",
      "The Messages API alone, since it already includes a built-in agentic loop with tool execution and context management",
      "MCP, since it's the correct mechanism for building an entire standalone agent product from scratch",
    ],
    correctIndexes: [0],
    explanation:
      "The Agent SDK is specifically meant for building a custom agent that runs as part of a team's own product or service, exposing the harness — tools, permissions, context management, subagents — that also powers Claude Code. The Claude Code CLI is built for interactive terminal use, not embedding inside another service. The raw Messages API returns one completion at a time and does not include an agentic loop; that loop is exactly what the Agent SDK adds on top of it. MCP standardizes exposing tools to an agent; it isn't itself a mechanism for building the agent.",
    eli10:
      "If you need a helper that works quietly in the background as part of your own machine, you'd build it with a toolkit meant for that, not hand someone a walkie-talkie meant for face-to-face chats.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A developer building an agent directly against the Messages API finds they're writing their own code to decide when to call a tool, execute it, feed the result back, and decide when to stop. What does this indicate?",
    options: [
      "This agentic loop is exactly what the Claude Agent SDK provides, so building it by hand duplicates work the SDK already does",
      "This is unavoidable; no tooling exists that handles tool-call looping automatically for any Claude product",
      "This means the Messages API is being called incorrectly, since it should return the agentic loop's results automatically",
      "This only happens when using MCP tools, and would not happen with a custom tool",
    ],
    correctIndexes: [0],
    explanation:
      "The Messages API is a single-completion primitive by design — it has no concept of looping tool calls on its own, so a developer wiring that loop up by hand is reimplementing exactly what the Agent SDK already provides, along with permission handling and context management. It isn't a sign of misuse of the Messages API; that's simply its scope. And the loop has to be built regardless of whether the tools involved are custom or MCP-based — the API itself doesn't distinguish between them here.",
    eli10:
      "If you keep having to manually pass a ball back and forth between two players yourself, that's a sign you need a referee who already knows how to run the game — not proof that the ball is broken.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A team building an SDK-based agent wants it to modify production infrastructure but only with a human approving each risky action, while a separate SDK-based agent that only reads logs and drafts reports should run unattended with much less oversight. What lets them configure this difference?",
    options: [
      "The Agent SDK's permission modes, which control how much autonomy an agent has before an action requires approval",
      "Choosing a different Claude model for each agent, since permission behavior is entirely determined by model choice",
      "MCP resource scopes, since permissions are only ever configured at the MCP protocol level",
      "There is no way to configure this; every SDK-based agent always requires the same level of approval for every action",
    ],
    correctIndexes: [0],
    explanation:
      "Permission modes are exactly the configurable control for this, mirroring Claude Code's own permission system — a low-stakes, read-only agent can run with more autonomy than one permitted to touch production infrastructure. Model choice doesn't determine permission behavior; that's a separate axis entirely. MCP resource scopes govern what an MCP server exposes, not the SDK agent's own approval requirements. And this is a real, commonly needed distinction the SDK supports, not an unconfigurable constant.",
    eli10:
      "You'd let a trusted friend water your plants on their own, but you'd still want to be asked before they rearrange your furniture — same person, different levels of check-in depending on the stakes.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A team building a deployment agent with the Agent SDK wants to guarantee it can never run a command that touches the production database, no matter what the model decides to do. Where should this rule live?",
    options: [
      "In an Agent SDK hook that intercepts and can block the tool call, the same enforcement mechanism Claude Code itself uses",
      "In the agent's system prompt, worded firmly enough that the model will never violate it",
      "In the tool's description, noting that production database access is discouraged",
      "Nowhere; the Agent SDK does not support blocking any tool call under any circumstances",
    ],
    correctIndexes: [0],
    explanation:
      "A hook is the mechanism that actually intercepts and can block a tool call before it executes — the same enforcement gap between 'written context' and 'enforced rule' that applies to Claude Code applies here too. A system-prompt instruction or a note in a tool description are both read as context the model tries to follow, with no guarantee of compliance, which is exactly why they're insufficient for a rule that must hold without exception. And the Agent SDK does support hooks for precisely this kind of enforcement.",
    eli10:
      "Writing 'please don't touch the stove' on a sticky note isn't the same as actually installing a stove lock — if it truly must never happen, you need the lock, not just the note.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "SINGLE",
    prompt:
      "An SDK-built research agent needs to fetch and summarize five sources without cluttering its own context with the full text of each one. Which SDK mechanism fits this?",
    options: [
      "Delegating the fetch-and-summarize subtask to a subagent with its own fresh context and only the tools that subtask needs",
      "Calling the Messages API a second time from inside the same context with no isolation at all",
      "Requiring the coordinator to read every source directly, since subagents aren't available outside interactive Claude Code sessions",
      "Switching to MCP resources instead, since subagents are a Claude Code-only concept unavailable to the SDK",
    ],
    correctIndexes: [0],
    explanation:
      "Subagents are available to SDK-built agents, not just interactive Claude Code sessions — delegating this subtask to one keeps the full source text out of the coordinator's own context, which only needs the summarized result back. Calling the Messages API again from inside the same context provides no isolation at all. And subagents are a real Agent SDK capability, not something limited to the Claude Code CLI.",
    eli10:
      "Sending an assistant off to read five long books and come back with just the key points keeps your own desk clear of all five books — you only need their notes, not the books themselves.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "SINGLE",
    prompt:
      "A long-running SDK-built agent monitors a deployment for several hours, accumulating a large conversation history. Which statement about managing this is accurate?",
    options: [
      "The Agent SDK provides its own context management, such as compaction as the session grows, rather than requiring the developer to build summarization logic from scratch",
      "The developer must implement all context management manually, since the Agent SDK has no context-management features of its own",
      "Context management is only available through Claude Code's interactive CLI, not through the Agent SDK",
      "The agent should simply restart from an empty context every few minutes to avoid ever running out of room",
    ],
    correctIndexes: [0],
    explanation:
      "The Agent SDK provides context management, including compaction as a session's history grows, the same way Claude Code manages context in an interactive session — the developer doesn't need to build this from scratch. It is available through the SDK, not only the CLI, and periodically wiping the context entirely would throw away state the deployment-monitoring task actually needs, rather than managing it sensibly.",
    eli10:
      "A long car trip doesn't require you to personally reinvent the fuel gauge — the car already comes with one built in. The SDK already comes with its own way of handling a growing conversation.",
    difficulty: "HARD",
  },
];
