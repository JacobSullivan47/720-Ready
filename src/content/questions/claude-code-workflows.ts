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
      "The assistant should have used Bash to run the test suite instead",
      "The assistant used Glob to search for something that required Grep, since the function name lives inside file contents rather than in a filename",
      "The assistant should have skipped exploration entirely and just guessed at the fix",
      "Glob patterns cannot include wildcards for file extensions",
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
      "Read the file, then Write an entirely new version of it",
      "A targeted Edit that matches the unique line and replaces it",
      "Delegate the change to a subagent via Task",
      "Use Glob to locate the number 30 and replace it",
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
      "Read every file in the service directory in file-size order",
      "Grep for the webhook's route name or a related error code, read the matching entry files, follow their imports to core abstractions, then trace one representative event through the code",
      "Immediately rewrite the webhook handler from scratch based on general webhook conventions",
      "Search only the project's README for a description of the webhook, and stop there",
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
      "Direct execution, since database connections are a routine detail",
      "Plan mode, exploring read-only first and proposing an approach before any file is changed",
      "Extended thinking alone, without changing the workflow at all",
      "Skipping exploration and applying the same fix used for a previous, unrelated bug",
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
      "Yes, plan mode and extended/deep reasoning are the same underlying mechanism",
      "No — plan mode is a workflow control governing explore-then-approve behavior, while reasoning depth is a separate mechanism; enabling one does not enable the other",
      "Yes, but only when the migration involves more than five files",
      "No, because plan mode actually disables all reasoning until a plan is approved",
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
      "Use the flag that resumes the most recent conversation in the current directory",
      "Use the resume-specific-session flag or picker to explicitly choose yesterday's refactor session",
      "Start a brand-new session and hope it remembers the refactor automatically",
      "Open a third terminal and use the most-recent flag there instead",
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
      "Resume the same session and simply ask it to consider an alternative hypothesis",
      "Fork the session, branching a new transcript so the original investigation stays untouched",
      "Start a brand-new session and manually retype a summary of everything discovered so far",
      "Close the session entirely and start over from nothing",
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
      "There is no risk, since forking a session also isolates all file changes automatically",
      "Forking only preserves conversation history, not filesystem state — both the original and the alternative approach would be editing the same files on disk",
      "Forking a session always fails if the directory is not empty",
      "Forking automatically creates a matching git worktree, so this concern doesn't apply",
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
      "Keep a concise scratchpad noting key files, the data flow understood so far, open questions, and confirmed assumptions as the investigation proceeds",
      "Avoid taking any notes and rely purely on memory of the conversation",
      "Restart the investigation completely from the beginning every time it feels long",
      "Only note the final conclusion once the entire investigation is fully finished",
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
      "Only the nested services/billing/ CLAUDE.md is loaded, fully replacing the root one",
      "Only the root CLAUDE.md is loaded; nested CLAUDE.md files are ignored",
      "Both are loaded together, with the nested file adding detail for that subtree rather than overriding the root's conventions wholesale",
      "The two files must be manually merged by the developer before either can be used",
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
      "Write the rule directly into the root CLAUDE.md so it always loads",
      "Scope the rule file to a glob pattern matching test files, such as **/*.test.ts",
      "Store the rule only in assistant memory instead of a rule file",
      "Duplicate the same rule text into every individual test file",
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
      "There is no flaw; capitalized keywords in CLAUDE.md are enforced the same way a permission rule is",
      "CLAUDE.md is read context that shapes behavior but guarantees no compliance; a rule that absolutely must hold needs a hook or an explicit permission-deny rule instead",
      "CLAUDE.md files cannot contain instructions about migrations at all",
      "The rule would only work if it were placed in assistant memory instead of CLAUDE.md",
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
      "None — a session's review of its own recent work is exactly as reliable as any other review",
      "The session that just wrote the code tends to be less critical of choices it already committed to, so a fresh session, dedicated review subagent, or external CI review is generally more reliable for a high-stakes review",
      "Self-review is always more reliable than any external review, since the author understands the intent best",
      "The review should be trusted only if the session used plan mode while writing the code",
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
    type: "MULTI",
    prompt:
      "Which TWO of the following are accurate distinctions between the built-in tools Grep and Glob in Claude Code?",
    options: [
      "Grep searches for patterns inside file contents, while Glob matches files by name or path pattern",
      "Glob can be used to search for a specific error string buried inside a JSON config value",
      "Using Glob to try to find a code reference that's actually inside file contents is a common tool-selection mistake",
      "Grep and Glob are simply two different names for the exact same underlying search behavior",
      "Glob is only usable on directories, never on individual files",
    ],
    correctIndexes: [0, 2],
    explanation:
      "Grep vs. Glob is precisely a contents-search vs. filename/path-search distinction, and mistaking one for the other (especially reaching for Glob when the target text lives inside a file) is a well-known pitfall. Glob cannot see inside a JSON value, so it can't find an error string buried in file content — that's a Grep job. The two tools are not interchangeable or identical. Glob's scope is about matching filename/path patterns, not a restriction to directories only.",
    eli10:
      "Grep reads what's written inside books; Glob just looks at the titles on the spines. Mixing them up — like checking spines to find a sentence hidden inside a book — is a common mistake, and they are not the same tool doing the same thing.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "MULTI",
    prompt:
      "Which TWO statements correctly describe session management flags/mechanisms in Claude Code?",
    options: [
      "A continue-most-recent flag is convenient for returning to the latest work in a directory, but risky if multiple terminals were active and 'most recent' isn't actually the intended session",
      "A session-ID mechanism is best suited for programmatic or automated workflows that need a stable, addressable session rather than whatever ran last",
      "Forking a session automatically isolates file changes on disk as well as conversation history",
      "Resuming the same saved session from two terminals at once is always perfectly safe with no risk of conflicting state",
      "The resume-specific-session mechanism is only usable for sessions created within the last hour",
    ],
    correctIndexes: [0, 1],
    explanation:
      "The continue-most-recent flag and its 'most recent isn't always the intended one' risk, and the session-ID mechanism's fit for stable, programmatic workflows, are both accurate. Forking only preserves conversation history, not filesystem state, so it does not by itself isolate files — a worktree is needed for that. Resuming the same session from two terminals at once risks conflicting edits, it isn't safe by default. There's no time restriction limiting the resume-specific-session mechanism to sessions from the last hour.",
    eli10:
      "Grabbing 'whatever you touched last' can hand you the wrong thing if you touched several things recently, and a program that needs to reliably find one exact item should use a fixed label for it — those two ideas are true. But making a copy of your notes doesn't also copy your actual toys, and two people writing in the same notebook at once can absolutely bump into each other.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "MULTI",
    prompt:
      "Which TWO of the following correctly describe CLAUDE.md and/or assistant memory in Claude Code?",
    options: [
      "Both CLAUDE.md and assistant-maintained memory are loaded as context that shapes behavior, without any guarantee of compliance",
      "A rule that must be enforced without exception, such as blocking a specific destructive command, is better placed in a hook or permission-deny rule than in CLAUDE.md prose alone",
      "Nested CLAUDE.md files completely replace the repo-root CLAUDE.md whenever both exist",
      "Assistant-maintained memory can only be edited by directly modifying the project's CLAUDE.md file",
      "CLAUDE.md is compiled into an enforced permission rule automatically the moment it's saved",
    ],
    correctIndexes: [0, 1],
    explanation:
      "Both CLAUDE.md and memory are read as context that shapes behavior with no compliance guarantee, and a rule that absolutely must hold belongs in a hook or permission-deny rule rather than relying on CLAUDE.md prose — both of these are accurate. Nested CLAUDE.md files supplement the root one rather than replacing it wholesale. Assistant memory is a separate mechanism from CLAUDE.md, not merely a section within it. CLAUDE.md is never automatically compiled into enforced permissions; it remains advisory context.",
    eli10:
      "A sticky note and a rulebook page are both just reminders someone reads — neither one locks a door by itself. If a door truly must stay locked, you need an actual lock, not a better-written note. And a note about the art room doesn't erase the sign on the school's front door; both apply.",
    difficulty: "HARD",
  },
  {
    domainKey: "CLAUDE_CODE_WORKFLOWS",
    type: "MULTI",
    prompt:
      "Which TWO statements correctly describe plan mode as a workflow control in Claude Code?",
    options: [
      "Plan mode explores read-only and proposes an approach before any file is changed",
      "Plan mode is best suited to work spanning many files, architectural decisions, or changes needing approval before implementation",
      "Plan mode is simply another name for enabling extended/deep reasoning",
      "Plan mode can only ever be enabled at the very start of a session and never toggled afterward",
      "Plan mode guarantees the eventual implementation will require zero further changes after approval",
    ],
    correctIndexes: [0, 1],
    explanation:
      "Plan mode's defining behavior is exploring read-only and proposing a plan for approval before changes land, and it fits work with wide scope, architectural stakes, or a need for sign-off — both accurate. It is a distinct mechanism from extended thinking, not another name for it. It can typically be toggled during a session, not only at the very start. And approving a plan doesn't guarantee the resulting implementation will need no further revisions.",
    eli10:
      "Plan mode is like sketching a blueprint and getting it approved before building anything — that part's true, and it suits big, tricky building projects. But sketching a blueprint isn't the same as thinking harder, you can pick up a pencil again mid-project, and an approved blueprint doesn't guarantee the finished building needs zero touch-ups.",
    difficulty: "MEDIUM",
  },
];
