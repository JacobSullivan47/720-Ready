import type { QuestionSeed } from "../types";

// Original practice questions written for this app covering Agentic
// Architecture & Orchestration. These are original scenarios and wording
// designed to test the same underlying knowledge as the real certification
// exam — they are NOT reproductions or reconstructions of any real exam
// question. See /about for licensing notes.
export const questions: QuestionSeed[] = [
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A team builds an agent that handles equipment-warranty claims. Every claim goes through the exact same four steps in the exact same order: confirm the purchase date, check the warranty window, inspect the reported defect against a coverage list, and issue an approval or denial. No claim ever needs a different order or an extra step. Which pattern best fits this workflow?",
    options: [
      "Prompt chaining",
      "Dynamic decomposition",
      "Parallel subagents",
      "Orchestrator-workers",
    ],
    correctIndexes: [0],
    explanation:
      "Prompt chaining fits because the sequence of steps is fixed and identical for every case, which is exactly the situation it's designed for. Dynamic decomposition is wrong because nothing here depends on findings changing the next step. Parallel subagents is wrong because there's no independent, uniform set of units to split across workers. Orchestrator-workers is wrong because there's no need for a coordinator to decide which subtasks apply — they're always the same four.",
    eli10:
      "Imagine a recipe you follow the exact same way every single time, step 1 then 2 then 3 then 4, no matter what. That's like a fixed chain — you don't need to stop and think about what to do next, because it's always the same.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "An inbox-triage agent reads each incoming message and sorts it into one of three known buckets — 'refund request,' 'shipping question,' or 'account access' — and then passes the message to a handler built specifically for that bucket. What pattern is this?",
    options: [
      "Routing",
      "Parallel subagents",
      "Dynamic decomposition",
      "Prompt chaining",
    ],
    correctIndexes: [0],
    explanation:
      "Routing is correct: the agent classifies input into a known, stable category and dispatches to a category-specific handler. Parallel subagents is wrong because there's no partition of a large uniform task running concurrently here. Dynamic decomposition is wrong because there's no chain of findings changing subsequent steps — classification happens once, up front. Prompt chaining is wrong because the handler that runs depends on the classification, not on a single fixed sequence applied to everything.",
    eli10:
      "It's like a mail sorter who looks at each letter and puts it in the right bin — 'bills' in one bin, 'birthday cards' in another — and each bin has its own person who deals with it.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A company wants an assistant that can take an open-ended request like 'help us decide whether to enter a new market' and figure out, case by case, which subtasks are even needed — sometimes that means competitor analysis, sometimes regulatory research, sometimes both, sometimes neither. The set of subtasks can't be listed in advance. Which pattern fits best?",
    options: [
      "Routing",
      "Orchestrator-workers",
      "Prompt chaining",
      "Parallel subagents alone, with no coordinator",
    ],
    correctIndexes: [1],
    explanation:
      "Orchestrator-workers is correct because a coordinator decides, at runtime, what subtasks this particular request needs and delegates accordingly, then synthesizes the results. Routing is wrong because the request doesn't cleanly fall into a small number of stable categories with a dedicated handler each. Prompt chaining is wrong because there's no fixed, known sequence — the needed subtasks vary. Parallel subagents without a coordinator is wrong because something still has to decide which subtasks apply and integrate the results.",
    eli10:
      "This is like a project manager who looks at a new job and decides on the spot who needs to help — maybe the artist, maybe the writer, maybe both — instead of always calling the same two people every time.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "An on-call engineer asks an agent to figure out why a service intermittently times out. The agent starts by looking at one alert, and only after seeing what it says decides whether to pull application logs, query a metrics dashboard, or escalate to a human — each choice changes based on what was just found. Which risk is most specifically associated with running this kind of investigation without any guardrails?",
    options: [
      "The investigation will always reach the wrong root cause, since dynamic decomposition can't handle intermittent bugs",
      "The number of steps and total cost become unpredictable, so the agent could keep investigating indefinitely without an explicit stopping point",
      "The agent will be unable to use any tools, since dynamic decomposition assumes a tool-free reasoning process",
      "The investigation becomes identical to a fixed chain, since each new finding just replays the same script",
    ],
    correctIndexes: [1],
    explanation:
      "The genuine tradeoff of dynamic decomposition is unpredictable cost and step count, which is why explicit termination criteria or a step cap matter — without them the agent could investigate indefinitely. Option A is wrong because dynamic decomposition is actually well suited to intermittent bugs, not doomed to fail on them. Option C is wrong and fabricates a constraint — dynamic decomposition routinely involves tool use. Option D contradicts the definition — the entire point is that steps are not a replayed fixed script.",
    eli10:
      "If you're following your nose to solve a mystery, you might keep chasing clues forever unless someone says 'okay, stop after ten clues and tell me what you've got.' That stopping rule is the missing piece here.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "SINGLE",
    prompt:
      "A team is producing a competitive landscape report from 30 source documents. Early drafts of the pipeline treated the documents as fully independent, giving one subagent per document and merging results afterward. But several documents directly reference and update claims made in other documents in the set, so slicing them apart loses that relationship. What's the most accurate assessment?",
    options: [
      "Parallel fan-out is still the right choice, since 30 documents is a large enough number to justify it regardless of their content",
      "This is a poor fit for pure independent fan-out, since the documents aren't actually independent units — the partitioning should account for the cross-references before splitting",
      "The problem is that the documents should have been processed with prompt chaining instead, since chaining tolerates cross-references automatically",
      "The problem is unrelated to partitioning and is really about needing a bigger step cap",
    ],
    correctIndexes: [1],
    explanation:
      "Fan-out wins specifically when units are independent; here the documents reference and update each other, so naive per-document partitioning throws away that relationship. The fix is to rethink the partition boundaries (e.g., grouping related documents together, or handling cross-references in a synthesis or sequential step), not to assume raw document count alone justifies fan-out. Prompt chaining doesn't inherently 'tolerate' cross-references any better — it's a different concern (fixed sequence vs. dependency between units). A step cap addresses runaway cost in dynamic decomposition, not this partitioning issue.",
    eli10:
      "If two pages of a story finish each other's sentences, you can't hand them to two different people who never talk to each other and expect the story to make sense — you have to keep connected pieces together.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A fan-out job splits 12 equally-sized files across 12 subagents, expecting them all to finish around the same time. In practice, one file turns out to require far more analysis than the other 11, and the whole job's completion time ends up matching that one subagent's runtime. What does this best illustrate?",
    options: [
      "Parallel fan-out total time is the sum of every subagent's runtime, so this outcome was unavoidable",
      "Elapsed time in a fan-out phase is bounded by the slowest single partition, so partitions should be balanced by expected effort rather than by equal count",
      "This shows fan-out should never be used when files differ in size at all",
      "This shows the coordinator should have used routing instead of fan-out",
    ],
    correctIndexes: [1],
    explanation:
      "This is a textbook illustration of the wall-clock bound in fan-out: the phase can't finish faster than its slowest partition, so equal item counts aren't the same as balanced effort. Option A misstates the mechanic — fan-out time tracks the max, not the sum. Option C overreaches; the fix is rebalancing by effort, not abandoning fan-out altogether. Option D is a non sequitur — routing solves a classification problem, not an uneven-workload problem.",
    eli10:
      "If ten friends are washing ten cars but one car is covered in mud and takes forever, everyone else finishing early doesn't get the group done any sooner — you're still waiting on that one muddy car.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A coordinator agent has just retrieved three short facts via a lookup tool and now needs only to combine them into one sentence for the user. Instead, it spawns a subagent, gives it the three facts, and waits for the subagent's response before replying. What's the best assessment of this design choice?",
    options: [
      "This is good practice, since delegating work to a subagent is always more thorough than answering directly",
      "This is over-delegation: the coordinator already has everything it needs in its own context, and spawning a subagent for such a small task adds overhead without benefit",
      "This is required, since a coordinator is never allowed to produce final text itself",
      "This is fine as long as the subagent has access to every tool available in the system",
    ],
    correctIndexes: [1],
    explanation:
      "Delegation carries real overhead — a fresh context, a tool-call round trip, result reconciliation — so when the coordinator already has what it needs, finishing directly is faster and cheaper. Option A is false in general; delegation isn't inherently 'more thorough,' it's a tool for specific situations like context flooding or parallelizable work. Option C invents a rule that doesn't exist — coordinators routinely produce final output themselves. Option D is irrelevant to whether delegation was warranted in the first place.",
    eli10:
      "If you already know the answer to a simple question, calling a friend to ask them to figure it out for you just wastes time — you could've just answered it yourself.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "SINGLE",
    prompt:
      "A synthesized research report states that adoption of a technology was '40% in one section' and '25% in another,' with no other context, making the two numbers read as a flat contradiction. Investigation reveals both figures were accurate at the time they were reported, but one subagent had dropped the original publication date when it passed its finding along. What is the most direct fix?",
    options: [
      "Have every subagent write in a more confident tone so the numbers seem less contradictory",
      "Have each subagent preserve and pass forward the date associated with each finding, so the synthesis step can present the figures as a trend over time rather than a contradiction",
      "Remove one of the two figures from the report so only one number remains",
      "Merge the two subagents into a single subagent so there's only one source of numbers",
    ],
    correctIndexes: [1],
    explanation:
      "Dropping dates is exactly what turns an older-vs-newer trend into an apparent contradiction; preserving the date lets the synthesis step correctly frame it as change over time. Option A doesn't address the actual cause — tone has nothing to do with missing dates. Option C throws away real information instead of fixing the provenance gap. Option D doesn't solve anything either — merging subagents doesn't restore the missing date metadata.",
    eli10:
      "If your friend tells you 'it was raining' but doesn't say whether that was yesterday or last month, it can sound like it contradicts someone who says 'it's sunny now.' Once you know the dates, it's just weather changing over time, not a contradiction.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "Two coordinators each delegate a summarization task to a subagent. Coordinator A's prompt to its subagent reads: 'Summarize the findings.' Coordinator B's prompt reads: 'Summarize these five claim records into a 200-word executive summary; keep each claim's confidence level visible, and cite each claim by its source_id.' Which statement is most accurate?",
    options: [
      "Both prompts are equally effective, since the subagent will infer the needed structure either way",
      "Coordinator B's handoff is stronger because it specifies the desired output shape, length, and required fields, while Coordinator A's is vague and leaves the subagent guessing",
      "Coordinator A's handoff is stronger because shorter instructions always produce better subagent performance",
      "Neither handoff matters, since subagents ignore instructions about output format",
    ],
    correctIndexes: [1],
    explanation:
      "A good handoff specifies exactly what's wanted and in what shape; Coordinator B's prompt does this (length, structure, required fields), while Coordinator A's vague instruction risks a mismatched or incomplete result. Option A is wrong — vagueness reliably produces inconsistent results, it isn't neutral. Option C is a false generalization; brevity isn't the same as clarity, and B's prompt is more specific, not just longer for its own sake. Option D is false — subagents follow the instructions and structure they're given, which is the entire premise of handoff design.",
    eli10:
      "If you ask a friend to 'do something for the party,' they might bring a napkin or a whole cake — who knows. If you say 'bring a chocolate cake for 10 people,' you'll actually get what you wanted.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A support agent's escalation rule currently says: 'escalate to a human after any three consecutive failed tool calls.' A customer whose account lookup fails twice due to a transient network blip, then succeeds on the third try with a routine, low-risk request, does NOT get escalated — but a customer whose very first request involves a regulated compliance exception also does not get escalated, because it only took one tool call to identify. What's the core problem with this rule?",
    options: [
      "The threshold of three is too low and should be raised to five",
      "The rule ties escalation to a raw retry count rather than to the category and risk of the situation, so it can miss genuinely high-risk cases and doesn't reflect the transient-failure case well either",
      "There is no problem; retry-count-based escalation is the recommended approach for all support agents",
      "The rule should be removed entirely, since support agents should never escalate automatically",
    ],
    correctIndexes: [1],
    explanation:
      "Escalation should be driven by category and impact — regulated approvals, policy exceptions, actions outside the agent's authority — not by how many tool calls happened to fail. This rule lets a genuinely high-risk, single-step case slip through while being indifferent to whether failures were even meaningful. Option A just tunes the same flawed mechanism. Option C directly contradicts the correct principle. Option D overcorrects — some form of escalation criteria is still needed, just not one based on retry count.",
    eli10:
      "Deciding when to call a grown-up for help based only on 'how many times did I try' misses the point — some things need a grown-up right away no matter how many tries it took, and some things are fine to keep trying even after a few hiccups.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A multi-agent system gives every subagent — including a subagent whose only job is to write a final report from findings it's handed — full access to web search, a file-editing tool, a database query tool, and a code execution tool. What is the most likely consequence of this design choice?",
    options: [
      "Nothing changes; giving every subagent every tool has no meaningful downside as long as the tools work correctly",
      "It increases the chance a subagent selects the wrong tool or acts outside its intended role, since tool selection gets harder as irrelevant options pile up",
      "It guarantees faster completion, since more available tools always speeds up a task",
      "It is required, since MCP mandates that all agents in a system share an identical tool list",
    ],
    correctIndexes: [1],
    explanation:
      "Giving every subagent every tool increases selection complexity and can push an agent outside its intended role — a report-writing subagent doesn't need search or database access, and having it anyway invites misuse or distraction. Option A dismisses a real, well-documented tradeoff. Option C is false — more available tools doesn't speed up a task and can slow decision-making. Option D fabricates a requirement; tool distribution across agents is a design choice, not a protocol mandate.",
    eli10:
      "If you hand every player on a team every possible piece of equipment for every sport, a player just supposed to keep score might end up fumbling with a bat and glove they don't need. It's easier if each person just has what their job actually requires.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A workflow that spans several days and multiple sessions needs to be resumable if the process restarts partway through. Which approach best supports resuming efficiently without re-deriving already-completed work?",
    options: [
      "Replay the full raw transcript of every prior session into the new session's context before continuing",
      "Persist a structured record of workflow state (such as completed steps, produced artifacts, and open gaps) and load only the relevant parts of it into the next session's prompt",
      "Discard all prior state and restart the entire workflow from scratch each time, to avoid any risk of stale information",
      "Rely on the coordinator's memory of the previous session, since conversation history persists automatically across restarts",
    ],
    correctIndexes: [1],
    explanation:
      "A structured manifest (completed steps, artifacts, open gaps) lets a resumed session get exactly the state it needs without the cost of replaying everything. Replaying full transcripts wastes context on already-settled information the next step doesn't need. Restarting from scratch throws away legitimate completed progress unnecessarily. The last option is simply false — nothing about restarting a process guarantees conversation history carries over automatically; that has to be deliberately persisted and reloaded.",
    eli10:
      "If you're building a Lego set over several days, it's much faster to check your instruction sheet for 'steps 1 through 6 are done, step 7 is next' than to dump out every brick and rebuild everything you already finished.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    type: "SINGLE",
    prompt:
      "A developer configures a coding assistant's own permitted tool list to include file editing and shell execution, but not the delegation tool used to spawn subagents. The developer then asks the assistant to 'delegate the test-writing work to a subagent while you handle the refactor yourself.' What happens?",
    options: [
      "The assistant delegates successfully, since delegation is always available regardless of configuration",
      "The assistant cannot spawn a subagent at all, since the delegation (Task/Agent) tool must itself be present in the coordinator's own allowed-tools list before it can delegate anything",
      "The assistant delegates successfully, but the subagent will be missing its own tools instead",
      "The request fails only because the phrase 'delegate' wasn't recognized; rewording the request would fix it",
    ],
    correctIndexes: [1],
    explanation:
      "A coordinator needs its own delegation tool present in its allowed-tools list to spawn a subagent at all — that's a separate configuration question from what tools a subagent gets once spawned. Since it's missing here, the assistant simply has no mechanism to delegate. Option A is false — delegation is not automatically available; it depends on configuration. Option C misattributes the failure to the subagent's configuration rather than the coordinator's own missing tool. Option D is a red herring; the issue is a missing tool, not phrasing.",
    eli10:
      "If you want to send a letter but you don't have any stamps, no amount of clever wording on the envelope will make it go out — you're missing the actual thing needed to send it.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "MULTI",
    prompt:
      "A team is deciding whether parallel subagent fan-out fits a task of reviewing 40 independent log files for a specific error pattern. Which TWO of the following statements are accurate about fan-out in general?",
    options: [
      "Fan-out works best when the units being processed are independent and don't need to consult each other's results",
      "Total elapsed time for a fan-out phase is roughly bounded by the slowest single partition, not the sum of every partition's time",
      "Fan-out guarantees a lower total dollar cost than a fixed sequential chain in every case",
      "Fan-out is the correct choice whenever a task involves more than one file, regardless of whether the files relate to each other",
      "Subagents in a fan-out phase automatically share progress with one another as they run",
    ],
    correctIndexes: [0, 1],
    explanation:
      "Fan-out's core requirements are independence of units and a wall-clock time bound set by the slowest partition — both correct statements about the general pattern. It does not guarantee lower cost (running many subagents concurrently can cost more in total tokens even if it's faster), so that option is wrong. It's also not automatically correct just because there's more than one file — relatedness between units matters, as does whether they must consult each other, which contradicts the last option's claim that they automatically share progress (they don't; each subagent's context is isolated).",
    eli10:
      "Splitting up chores only saves time if everyone's chore is separate from everyone else's, and the whole group isn't done until the slowest person finishes — but splitting chores doesn't magically make the whole job cheaper, and helpers don't automatically know what each other are doing.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "MULTI",
    prompt:
      "Which TWO of the following are genuine anti-patterns commonly seen in multi-agent orchestration designs?",
    options: [
      "Passing an unfiltered 100,000-token raw tool output from one agent to the next instead of a structured, filtered summary",
      "Giving every subagent in a system full access to every available tool, regardless of that subagent's actual role",
      "Restricting a research subagent's tools to search and fetch, while giving a synthesis-only subagent no external tools at all",
      "Writing a subagent handoff prompt that states the goal, the required output shape, and relevant constraints",
      "Assigning each of 50 independent repositories to its own subagent for a uniform review task",
    ],
    correctIndexes: [0, 1],
    explanation:
      "Passing raw, unfiltered dumps between agents and giving every subagent every tool are both well-documented anti-patterns — the first wastes context and buries needed fields, the second increases selection complexity and invites role drift. The third option describes correct, role-appropriate tool distribution, not an anti-pattern. The fourth describes a well-constructed handoff prompt, which is the recommended practice, not a mistake. The fifth describes a textbook-appropriate use of fan-out for independent, uniform units, not a flaw.",
    eli10:
      "Handing someone a giant messy pile of papers instead of a short clear note is a mistake, and giving every helper every single tool in the shed 'just in case' is also a mistake — but giving people only the tools they need, writing clear notes, and splitting up separate identical chores are all good moves, not mistakes.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "MULTI",
    prompt:
      "A coordinator is designing the output format that each research subagent must return for every claim it finds, so that a later synthesis step can merge results while preserving provenance. Which TWO fields are most important to include alongside the claim itself?",
    options: [
      "An identifier or location pointing to the specific source the claim came from",
      "The date the claim or statistic was originally reported or observed",
      "The full raw HTML or PDF text of every page the subagent visited",
      "A running token count of how much context the subagent consumed",
      "The subagent's complete internal reasoning trace for every intermediate step it took",
    ],
    correctIndexes: [0, 1],
    explanation:
      "A source identifier/location and a date are exactly what preserve provenance and let a synthesis step cite claims and correctly frame older versus newer findings. Raw HTML or full page text is far more than the next step needs and reintroduces the raw-dump problem instead of a structured summary. A token-count tally doesn't help establish where a claim came from or how current it is. A full internal reasoning trace is unnecessary detail for synthesis and, again, works against passing a compact structured record forward.",
    eli10:
      "If you're collecting facts for a school report, the two most useful things to jot down next to each fact are 'where did this come from' and 'when was this true' — not the entire website you read it on or a diary of everything you were thinking while reading it.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "MULTI",
    prompt:
      "A platform team is choosing control-flow patterns for two different jobs: (1) generating a weekly sales digest that always follows the same five fixed steps, and (2) triaging a newly reported production incident whose cause is unknown and where each finding changes what to check next. Which TWO pairings correctly match a job to its best-fitting pattern?",
    options: [
      "The weekly sales digest fits prompt chaining, since its steps are fixed and identical every time",
      "The incident triage fits dynamic decomposition, since each finding determines what to investigate next",
      "The weekly sales digest fits dynamic decomposition, since digests benefit from being re-evaluated fresh every week",
      "The incident triage fits prompt chaining, since incidents should always be checked in the same fixed order for consistency",
      "Both jobs fit routing equally well, since routing can substitute for either chaining or decomposition",
    ],
    correctIndexes: [0, 1],
    explanation:
      "The sales digest's fixed, always-identical sequence is the definition of a good prompt-chaining fit, and the incident triage's findings-drive-next-step nature is the definition of dynamic decomposition — these two pairings are correct. Claiming the digest needs dynamic decomposition ignores that its steps never actually change. Forcing a fixed order onto incident triage is the classic anti-pattern of applying a rigid script to a problem whose real cause a checklist would likely miss. Routing solves a classification-and-dispatch problem, not either of these two shapes, so it isn't a substitute for both.",
    eli10:
      "Baking the same recipe every week is best done the same way every time, but solving a mystery means following each new clue wherever it leads — you wouldn't want to swap those two approaches around.",
    difficulty: "MEDIUM",
  },
];
