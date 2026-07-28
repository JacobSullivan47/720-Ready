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
      "Dynamic decomposition",
      "Orchestrator-workers",
      "Parallel subagents",
      "Prompt chaining",
    ],
    correctIndexes: [3],
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
      "Prompt chaining",
      "Routing",
      "Dynamic decomposition",
      "Parallel subagents",
    ],
    correctIndexes: [1],
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
      "Prompt chaining",
      "Routing",
      "Orchestrator-workers",
      "Parallel subagents alone, with no coordinator",
    ],
    correctIndexes: [2],
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
      "The number of steps and total cost become unpredictable, so the agent could investigate indefinitely with no stopping point",
      "The agent will be completely unable to use any tools, since dynamic decomposition assumes a tool-free reasoning process",
      "The investigation will always reach the wrong root cause, since dynamic decomposition can't handle intermittent bugs",
      "The investigation becomes identical to a fixed chain, since each new finding just replays the exact same fixed script",
    ],
    correctIndexes: [0],
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
      "The problem is that the documents should have been processed with prompt chaining instead, since chaining tolerates cross-references automatically",
      "This is a poor fit for independent fan-out, since the documents aren't truly independent — partitioning should account for cross-references",
      "The problem is unrelated to partitioning and is really just about needing a bigger step cap for this investigation",
      "Parallel fan-out is still the right choice here, since 30 total documents is a large enough number to justify it regardless of content",
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
      "Parallel fan-out's total elapsed time is simply the sum of every subagent's own individual runtime added together",
      "Fan-out should never be used again whenever any of the files being processed differ in size, even slightly, from one another",
      "Elapsed time in a fan-out phase is bounded by the slowest partition, so work should be balanced by effort, not item count",
      "The coordinator should have used routing instead of fan-out for processing this particular batch of twelve files",
    ],
    correctIndexes: [2],
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
      "This is fine as long as the subagent has access to every single tool available anywhere in the whole system",
      "This is over-delegation: the coordinator already has what it needs, so spawning a subagent just adds needless overhead",
      "This is required, since a coordinator is never allowed to produce any final text itself under the orchestration pattern",
      "This is good practice, since delegating work to a subagent is always more thorough than answering directly",
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
      "Have each subagent preserve and pass forward the date behind its finding, so synthesis can frame the figures as a trend over time",
      "Remove one of the two conflicting figures from the report entirely so only a single number remains for the reader to see",
      "Have every subagent rewrite its finding in a more confident, assertive tone so the numbers stop sounding contradictory to readers",
      "Merge the two research subagents into one single combined subagent so there is only one source of numbers left",
    ],
    correctIndexes: [0],
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
      "Coordinator B's handoff is stronger: it specifies the output shape, length, and required fields, while A's vague prompt leaves the subagent guessing",
      "Both prompts are equally effective, since a capable subagent will always infer the needed structure either way regardless of what it's told",
      "Neither handoff matters much, since subagents generally ignore instructions about desired output format and structure anyway",
      "Coordinator A's handoff is actually stronger, since shorter instructions reliably produce better subagent performance than longer, more detailed ones",
    ],
    correctIndexes: [0],
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
      "The rule should be removed entirely, since support agents should never escalate any request to a human under any circumstances",
      "The rule ties escalation to a raw retry count instead of the situation's category and risk, missing high-risk cases and misreading failures",
      "The threshold of three is simply set too low here and should instead be raised to five consecutive failed tool calls",
      "There is no real problem here; retry-count-based escalation is the industry-recommended approach for every support agent design",
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
      "It guarantees faster completion overall, since having more available tools on hand always speeds up how quickly a task finishes",
      "It is required, since the underlying protocol mandates that every agent in a multi-agent system share an identical tool list",
      "Nothing changes; giving every subagent every tool has no meaningful downside as long as each tool works correctly on its own",
      "It increases the chance a subagent picks the wrong tool or acts outside its role, since selection gets harder as irrelevant options pile up",
    ],
    correctIndexes: [3],
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
      "Discard all prior state and restart the entire workflow completely from scratch every time, to avoid any risk of stale information",
      "Rely on the coordinator's own memory of the previous session, since conversation history is assumed to persist automatically across restarts",
      "Replay the full raw transcript of every prior session into the new session's context before letting it continue any further",
      "Persist a structured record of workflow state — completed steps, artifacts, open gaps — and load only the relevant parts into the next prompt",
    ],
    correctIndexes: [3],
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
      "The assistant delegates the work successfully anyway, since delegation is always available to a coordinator regardless of its tool configuration",
      "The assistant cannot spawn a subagent at all, since the delegation tool itself must be present in the coordinator's own allowed-tools list first",
      "The request fails only because the specific phrase 'delegate' wasn't recognized by the assistant; simply rewording the request would fix the problem",
      "The assistant delegates successfully, but the resulting subagent ends up missing its own tools and cannot complete its assigned task",
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
    type: "SINGLE",
    prompt:
      "A team is deciding whether parallel subagent fan-out fits a task of reviewing 40 independent log files for a specific error pattern. Which of the following is an accurate statement about fan-out in general?",
    options: [
      "It guarantees a lower total dollar cost than a fixed sequential chain in every case",
      "It is the correct choice whenever a task involves more than one file, regardless of whether the files relate to each other",
      "Subagents in a fan-out phase automatically share progress with one another as they run",
      "It works best when the units being processed are independent and don't need to consult each other's results",
    ],
    correctIndexes: [3],
    explanation:
      "Fan-out's core requirement is independence between units — genuinely separate work that doesn't need to consult other units' results (its elapsed time is also bounded by the slowest partition rather than the sum of all of them, a related but separate fact). It does not guarantee lower cost (running many subagents concurrently can cost more in total tokens even if it's faster). It's also not automatically correct just because there's more than one file — relatedness between units matters. And subagents don't automatically share progress with each other; each one's context is isolated unless explicitly passed along.",
    eli10:
      "Splitting up chores only saves time if everyone's chore is separate from everyone else's, and the whole group isn't done until the slowest person finishes — but splitting chores doesn't magically make the whole job cheaper, and helpers don't automatically know what each other are doing.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "Which of the following is a genuine anti-pattern commonly seen in multi-agent orchestration designs?",
    options: [
      "Restricting a research subagent's tools to search and fetch, while giving a synthesis-only subagent no external tools at all",
      "Assigning each of 50 independent repositories to its own subagent for a uniform review task",
      "Passing an unfiltered 100,000-token raw tool output from one agent to the next instead of a structured, filtered summary",
      "Writing a subagent handoff prompt that states the goal, the required output shape, and relevant constraints",
    ],
    correctIndexes: [2],
    explanation:
      "Passing raw, unfiltered dumps between agents is a well-documented anti-pattern — it wastes context and buries the fields the next step actually needs (giving every subagent every available tool regardless of role is another common one, though not the option tested here). Restricting tools by role describes correct, role-appropriate distribution, not an anti-pattern. A handoff prompt stating the goal, output shape, and constraints is the recommended practice, not a mistake. Assigning independent, uniform units to their own subagents is a textbook-appropriate use of fan-out, not a flaw.",
    eli10:
      "Handing someone a giant messy pile of papers instead of a short clear note is a mistake, and giving every helper every single tool in the shed 'just in case' is also a mistake — but giving people only the tools they need, writing clear notes, and splitting up separate identical chores are all good moves, not mistakes.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "SINGLE",
    prompt:
      "A coordinator is designing the output format that each research subagent must return for every claim it finds, so that a later synthesis step can merge results while preserving provenance. Which of the following best describes the fields most important to include alongside the claim itself?",
    options: [
      "A running token count of how much context the subagent consumed, plus the subagent's complete internal reasoning trace",
      "The subagent's complete internal reasoning trace for every step, plus the full raw HTML or PDF text of every page visited",
      "The full raw HTML or PDF text of every page the subagent visited, plus a running token count of context consumed",
      "An identifier or location pointing to the specific source, plus the date the claim was originally reported",
    ],
    correctIndexes: [3],
    explanation:
      "A source identifier/location and a date are exactly what preserve provenance and let a synthesis step cite claims and correctly frame older versus newer findings. Raw HTML or full page text is far more than the next step needs and reintroduces the raw-dump problem instead of a structured summary. A token-count tally doesn't help establish where a claim came from or how current it is. A full internal reasoning trace is unnecessary detail for synthesis and, again, works against passing a compact structured record forward — none of these three pairings include either field that actually matters.",
    eli10:
      "If you're collecting facts for a school report, the two most useful things to jot down next to each fact are 'where did this come from' and 'when was this true' — not the entire website you read it on or a diary of everything you were thinking while reading it.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A platform team is choosing control-flow patterns for two different jobs: (1) generating a weekly sales digest that always follows the same five fixed steps, and (2) triaging a newly reported production incident whose cause is unknown and where each finding changes what to check next. Which of the following correctly pairs each job to its best-fitting pattern?",
    options: [
      "The digest fits prompt chaining, and the triage fits dynamic decomposition",
      "The digest fits dynamic decomposition, and the triage fits prompt chaining",
      "The digest fits dynamic decomposition, and the triage also fits dynamic decomposition",
      "The digest fits prompt chaining, and the triage also fits prompt chaining",
    ],
    correctIndexes: [0],
    explanation:
      "The sales digest's fixed, always-identical sequence is the definition of a good prompt-chaining fit, and the incident triage's findings-drive-next-step nature is the definition of dynamic decomposition — the pairing is reversed for each job in the second option, and the third and fourth options force the same pattern onto both jobs despite one having fixed steps and the other not. Forcing a fixed order onto incident triage is the classic anti-pattern of applying a rigid script to a problem whose real cause a checklist would likely miss, and treating the digest as needing case-by-case decomposition ignores that its steps never actually change.",
    eli10:
      "Baking the same recipe every week is best done the same way every time, but solving a mystery means following each new clue wherever it leads — you wouldn't want to swap those two approaches around.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A content-moderation team wants an agent to sort each flagged post into one of a few fixed categories and hand it to a category-specific reviewer. In practice, new categories of harmful content emerge weekly, existing categories blur together, and reviewers keep disagreeing about which bucket a given post belongs in. What does this suggest about using routing here?",
    options: [
      "Routing is still the right choice, since any classification task is automatically a good fit for routing regardless of how stable the categories are",
      "The problem is unrelated to routing and only means the reviewers need more training",
      "Routing is a poor fit here, since it works best when categories are distinct and stable, and these categories are fuzzy and constantly evolving",
      "The fix is to keep adding more categories until every post fits perfectly, since routing always improves the more categories it has",
    ],
    correctIndexes: [2],
    explanation:
      "Routing works best when categories are distinct and stable; this scenario is the classic poor-fit case, since the categories are fuzzy, overlapping, and constantly changing. Option A ignores that real limitation. Option C is a naive fix — adding more categories doesn't stabilize categories that are inherently blurry and evolving. Option D reframes a pattern mismatch as a training problem, which doesn't address why the categories themselves keep causing disagreement.",
    eli10:
      "Sorting toys into 'car toys' and 'doll toys' works great when every toy is clearly one or the other. But if new odd toys keep showing up that are kind of both, that kind of sorting stops working well — that's the real problem here, not that the sorter needs more practice.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A team builds a coordinator that, for every incoming password-reset request, spends time deciding whether it needs to delegate to a 'verify identity' subagent, a 'generate reset token' subagent, and a 'send reset email' subagent — even though these exact three steps run, in this exact order, for every single request with no variation. What's the best critique of this design?",
    options: [
      "This is a reasonable use of orchestrator-workers, since any task involving more than one step benefits from a coordinator actively deciding what's needed each time",
      "This is overkill: the steps never vary, so a simple fixed chain would get the same result more simply and cheaply than re-deciding subtasks every time",
      "The design is only correct if the three subagents are run all at the same time instead of running one after another in sequence",
      "The design is fundamentally broken because orchestrator-workers requires at least five distinct subtasks in order to function correctly at all",
    ],
    correctIndexes: [1],
    explanation:
      "Orchestrator-workers earns its overhead when subtasks aren't knowable in advance; here they're always the same three steps in the same order, so a coordinator re-deciding this every time is overkill compared to a plain fixed chain. Option A over-generalizes — step count alone doesn't justify a coordinator, predictability does. Option C invents a numeric requirement that doesn't exist. Option D is a non sequitur and would actually break the workflow, since generating a token needs identity verified first and sending the email needs the token, so these steps depend on each other rather than being safe to run concurrently.",
    eli10:
      "If you always tie your shoes the exact same way every morning, you don't need a planning meeting to decide which steps to do — running a whole decision process for the same three steps every time is more effort than it needs to be.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "During a long support conversation, a customer tells the coordinating agent, 'Please don't close this ticket until I confirm the refund posted to my card.' Later, the coordinator delegates the actual refund step to a subagent, passing along only 'process a refund for order #48213.' The subagent processes the refund and immediately marks the ticket closed. What is the most likely root cause?",
    options: [
      "The refund tool itself must be broken, since closing a ticket is a side effect that no tool should ever be able to trigger on its own",
      "The subagent ignored an instruction it had definitely already received, since all subagents automatically inherit the full prior conversation history",
      "The coordinator left the customer's constraint out of the subagent's prompt, and the subagent has no automatic access to earlier turns",
      "This is expected, normal behavior, since subagents are designed to always close a ticket immediately after taking any action at all",
    ],
    correctIndexes: [2],
    explanation:
      "A subagent starts with a fresh context and only sees what's explicitly included in its prompt; since the coordinator passed only the order number, the subagent never learned about the 'don't close yet' constraint. Option A is factually wrong — subagents do not automatically inherit prior conversation turns from the coordinator. Option C blames a tool malfunction where none is demonstrated. Option D fabricates a default behavior that isn't accurate for how subagents should be designed.",
    eli10:
      "If you whisper a rule to one friend but then ask a different friend to do a task without repeating the rule, the second friend can't follow a rule they never heard. The subagent here never heard the 'don't close yet' part.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A coordinator building a repository dependency report needs to first determine which package-manifest format a project uses (npm, pip, or cargo) before it can know how to correctly parse that project's version constraints. An engineer suggests starting the 'detect manifest format' step and the 'parse version constraints' step as two subagents running at the same time to save time. What's wrong with this suggestion?",
    options: [
      "The real problem is that a dependency report of this kind should never make use of subagents in any capacity whatsoever, ever",
      "The real problem is that both of these particular steps must be handled by prompt chaining instead of by any kind of subagent",
      "The parsing step depends on the detection step's output, so running them concurrently risks starting too early — run them in sequence instead",
      "Nothing is wrong here; running independent-looking subagents concurrently always saves time no matter what input each one actually needs",
    ],
    correctIndexes: [2],
    explanation:
      "Parallelizing only makes sense for genuinely independent work; here the parsing step's correctness depends on already knowing the manifest format, so it must wait for that result instead of running alongside it. Option A ignores exactly this dependency. Option C overcorrects — subagents can still be useful for other, genuinely independent slices of the report. Option D confuses two separate concerns; the actual fix is sequencing these two steps, not necessarily abandoning subagents for a chain.",
    eli10:
      "You can't frost a cake before you know if it's chocolate or vanilla — you have to find out which cake it is first, then frost it. Doing both 'at the same time' just means frosting a cake you haven't identified yet.",
    difficulty: "HARD",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "CLAUDE_CODE_CI_CD",
    type: "SINGLE",
    prompt:
      "A CI pipeline powered by an agent always performs the same four actions for every pull request, in the same order: run the linter, run the unit tests, run the type checker, and post one combined status comment. No pull request ever needs these steps reordered or skipped. Which pattern does this pipeline match?",
    options: [
      "Prompt chaining, since the sequence of steps is fixed and identical for every pull request",
      "Parallel subagents, since the four checks are a large uniform task that must be split across independent workers",
      "Dynamic decomposition, since CI pipelines must adapt their steps to each new pull request's contents",
      "Orchestrator-workers, since a coordinator must decide which of the four checks apply to each pull request",
    ],
    correctIndexes: [0],
    explanation:
      "The steps never vary in content or order, which is the defining trait of prompt chaining. Option A is wrong because nothing here adapts based on findings — the same four steps run every time. Option C is wrong because there's no case-by-case decision about which checks apply; all four always run, so no coordinator judgment is needed. Option D mismatches the pattern being described, which is the pipeline's fixed, always-identical sequence rather than a partition of one task into independently varying slices.",
    eli10:
      "If you always brush your teeth, then wash your face, then comb your hair, in that exact order every night, that's a fixed routine you follow the same way each time, not something you rethink every night.",
    difficulty: "EASY",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    type: "SINGLE",
    prompt:
      "A finance team needs to extract five known fields (vendor name, invoice number, date, subtotal, and tax) from 200 incoming invoice PDFs. Each invoice is self-contained, and processing one has no bearing on how any other invoice should be read. Which approach best fits this job?",
    options: [
      "A single subagent handling all 200 invoices in one long sequential pass, since sharing one context is required for consistent field extraction",
      "Parallel subagents, partitioning the 200 invoices into independent slices processed concurrently and then combining the extracted fields",
      "Dynamic decomposition, since the fields to extract from each invoice can't be known until the agent inspects it",
      "Routing, since each invoice should be classified into a category before any fields are extracted",
    ],
    correctIndexes: [1],
    explanation:
      "Two hundred self-contained, uniform invoices with no cross-dependencies is the textbook case for parallel fan-out: split the work, run it concurrently, and synthesize the extracted fields. Option A invents an unneeded classification step with no indication invoices fall into meaningfully different categories. Option C is wrong because the fields to extract are already fixed and known in advance — nothing here is discovered case by case. Option D is unnecessarily slow, and it's false that a shared context is required for consistent extraction across independent documents.",
    eli10:
      "If you have 200 separate homework worksheets that don't depend on each other, it's faster to split them among several friends who each grade a stack at the same time than to have one person slowly go through all 200 alone.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A developer asks an agent to figure out why a newly cloned, unfamiliar repository fails to build. The agent starts by running the build to see the actual error, and only after reading that error decides whether to check a missing dependency, a misconfigured environment variable, or a version mismatch — each next action determined by what the previous one revealed. A reviewer suggests writing a fixed five-step checklist instead so the process is 'more predictable.' What's the strongest response to that suggestion?",
    options: [
      "A fixed checklist is a poor fit: the cause is unknown up front, and a pre-written sequence risks missing what only emerges from earlier findings",
      "The checklist is a good idea here, since a fixed prompt-chaining sequence is always safer than any exploratory, open-ended approach",
      "Neither approach really works here, since build failures of this kind can only ever be properly diagnosed by a human engineer",
      "The checklist is necessary here, since dynamic decomposition is fundamentally incapable of using any tools to actually run the build",
    ],
    correctIndexes: [0],
    explanation:
      "This is a dynamic-decomposition situation — each finding determines the next step — so a rigid pre-written checklist risks overlooking the actual cause that only a real investigation would surface. Option A wrongly claims chaining is universally safer, when it's actually a mismatch for problems whose path isn't known in advance. Option C overstates things, since agents routinely diagnose this kind of issue. Option D is a fabricated limitation — dynamic decomposition regularly involves running tools like a build command.",
    eli10:
      "If you don't know what's broken yet, following someone's fixed five-step guess-list might skip right past the actual reason your bike won't start — you need to look at what's actually wrong first, then decide what to check next.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A coordinator asks a synthesis subagent to combine three research subagents' outputs into a final report that must cite every claim. Each research subagent, however, only wrote a short prose paragraph like 'adoption appears to be growing,' with no indication of which specific source, page, or record backs that statement. What is the most accurate assessment of this handoff design?",
    options: [
      "This is fine as it stands, since prose summaries are always a sufficient input for any downstream synthesis task to work with",
      "The handoff is inadequate: citations are required downstream, so subagents needed a structured claims-to-sources index, not bare prose",
      "The problem here is unrelated to the handoff and is really just a limitation of the synthesis subagent's own writing ability",
      "The fix is to have the synthesis subagent guess a plausible source for each claim so the final report still contains citations",
    ],
    correctIndexes: [1],
    explanation:
      "When citations or provenance are required downstream, a bare prose summary isn't enough — the handoff needed a structured claims-to-sources index instead. Option A is wrong precisely because the citation requirement here makes prose-only input insufficient. Option C misdiagnoses the issue as a writing-quality problem rather than a missing-data problem; no amount of better prose can invent source information that was never passed along. Option D is actively harmful, since fabricating plausible-sounding sources is worse than including no citation at all.",
    eli10:
      "If your teacher needs to know exactly which book each fact in your report came from, just writing 'I read that this is true' isn't enough — you need to write down the actual book and page for each fact, not make one up to fill the blank.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A team is reviewing how their multi-agent research assistant behaves after its first pass over source material turns up a gap — for instance, a claim with no clear timeframe, or a contested figure backed by only one source. Which of the following best describes correct practice for handling this situation?",
    options: [
      "Gaps like this should be resolved by having the synthesis step silently pick whichever version of a contested figure simply sounds more authoritative",
      "Every subagent in the system should be given every available tool, so that whichever one happens to notice the gap can also go resolve it itself",
      "The gap — a missing timeframe or a single-sourced figure — should be flagged as contested or insufficiently supported rather than presented as settled fact",
      "Once a first pass is complete, the report should be finalized immediately regardless of gaps found, since revisiting sources afterward is never worthwhile",
    ],
    correctIndexes: [2],
    explanation:
      "Good practice is explicitly labeling uncertain or contested findings rather than smoothing them into settled fact (triggering a targeted follow-up round of investigation is another correct response here, alongside flagging it). Finalizing immediately regardless of gaps is exactly the strictly-one-pass anti-pattern this guards against. Giving every subagent every tool repeats the tool-sprawl anti-pattern — the fix for a missed gap is a follow-up investigation step, not blanket tool access. And silently picking whichever figure sounds more authoritative misrepresents confidence to the reader instead of flagging the uncertainty.",
    eli10:
      "If you're writing a report and notice one fact is shaky, the right move is to go check it again or say 'this one is unsure' — not to just guess which version sounds more confident, and not to hand every helper every tool hoping someone fixes it by accident.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "AGENTIC_ARCHITECTURE",
    type: "SINGLE",
    prompt:
      "A coordinator is designing a fan-out job: plan which partitions are needed, run subagents on those partitions, then combine their results into one output. Which of the following correctly describes how this kind of job should be structured for genuinely independent, I/O-heavy partitions?",
    options: [
      "The job should be planned once, executed concurrently across independent partitions, then synthesized afterward",
      "Running every single partition concurrently regardless of dependencies always produces a correct result faster, since concurrency never affects correctness at all",
      "Partition sizing doesn't matter at all for overall elapsed time, since only the total raw number of partitions affects when the job finishes",
      "The synthesis step should happen before the parallel execution step even begins, so results are already ready to combine the moment partitions start",
    ],
    correctIndexes: [0],
    explanation:
      "The correct shape for this kind of job is plan once, fan out concurrently across independent partitions, then synthesize afterward (any partition with a genuine dependency on another's output must additionally wait for it rather than run alongside it, a related but separate point). Running every partition concurrently regardless of dependencies is false: it can produce wrong or incomplete results, not just a faster correct one. Synthesizing before execution begins is impossible as described, since synthesis needs the partition results as input. And partition sizing is false to dismiss — elapsed time is bounded by the slowest partition, so uneven partition sizes matter a great deal, not just the raw count.",
    eli10:
      "First you decide who's doing what, then everyone works on their own separate piece at the same time, and only at the end do you put all the pieces together — you can't combine pieces before they're made, and if one piece truly needs another piece finished first, that one has to wait its turn.",
    difficulty: "HARD",
  },
];
