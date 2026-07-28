import type { FlashcardSeed } from "../types";

// Original flashcards written for this app covering Prompt Engineering &
// Structured Output. Wording, examples, and phrasing are original — not
// copied or paraphrased from any source. See /about for licensing notes.
export const flashcards: FlashcardSeed[] = [
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Messages API statelessness",
    definition:
      "The Messages API keeps no memory of past calls on the server side. Every request must carry the full context it needs — the system prompt and the entire message history — because the previous call is not remembered.",
    example:
      "A chatbot that sent its system prompt on turn one but not on turn six is not 'reminding' the model of anything on turn six — the model only knows what's in that one request.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Top-level system parameter",
    definition:
      "Instructions that set persistent behavior are passed through a dedicated top-level field, separate from the alternating user/assistant messages array, rather than as a message with a 'system' role inside that array.",
    example:
      "A support bot's tone-and-scope instructions live in the top-level field on every call, while the actual back-and-forth with the customer fills the messages array.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Dropped system prompt on a later turn",
    definition:
      "Because the API has no memory between calls, leaving the system prompt out of a request after the first turn produces an immediate, visible behavior change on that very call — not a gradual fade.",
    example:
      "A developer who only attaches the persona instructions to the opening request finds the bot suddenly answering in a generic tone starting on message two.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "tool_choice: auto",
    definition:
      "The default tool_choice setting, under which the model decides for itself, turn by turn, whether calling a tool is necessary or whether a direct text reply is enough.",
    example:
      "With auto, a greeting like 'good morning' gets a plain reply, while 'what's my account balance' triggers a lookup tool.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "tool_choice: any",
    definition:
      "A tool_choice setting that forces the model to call some tool on this turn, while still letting the model pick which one of the available tools is most appropriate.",
    example:
      "An order-status turn set to 'any' with both a shipment-lookup tool and a returns tool available will always invoke one of the two, never reply with plain text alone.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "tool_choice: named tool",
    definition:
      "A tool_choice setting that pins the model to call one specific, named tool on this turn, removing any choice over which tool or whether to use one at all.",
    example:
      "A form-filling step pins tool_choice to the 'submit_application' tool so the model can't wander off and call an unrelated lookup tool instead.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "tool_choice: none",
    definition:
      "A tool_choice setting that disables tool use for the turn entirely, forcing a plain text response even if tools are defined and would otherwise be relevant.",
    example:
      "A summary-only turn sets tool_choice to none so the model restates what it already knows instead of triggering a live lookup mid-summary.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    term: "auto vs. any confusion",
    definition:
      "A common mistake is treating auto and any as interchangeable. auto makes tool use optional and model-judged; any makes tool use mandatory but leaves the choice of which tool open — the two guarantee different things.",
    example:
      "A pipeline that must always extract a record used auto by mistake and occasionally got a plain-text refusal instead of a tool call — switching to any fixed it.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    term: "Schema-validated structured output",
    definition:
      "Specifying a JSON Schema that a response is required to conform to, rather than asking in prose for 'JSON' and hoping the model complies. It is considerably more reliable for production pipelines that parse the result programmatically.",
    example:
      "Instead of writing 'please respond in JSON with fields name and total,' a pipeline attaches an actual schema requiring both fields with specific types, and the response is checked against it.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    term: "Strict tool-use mode",
    definition:
      "A mode that guarantees a tool call's input matches the tool's declared schema exactly, eliminating the class of failures where a tool call is made but its arguments don't actually fit the expected shape.",
    example:
      "With strict mode on, a 'create_invoice' tool call can no longer arrive missing its required 'amount' field or with it typed as a string instead of a number.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    term: "Schema compliance vs. semantic correctness",
    definition:
      "Schema compliance only means a response is syntactically valid against the schema — right field names and types. It says nothing about whether the actual values are true or correct, which is a separate, stronger guarantee.",
    example:
      "A contract-extraction tool call can return a perfectly schema-valid {\"term_months\": 12} that is nonetheless the wrong number, because the model misread the clause.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Assistant message prefill (deprecated)",
    definition:
      "An older technique where a caller supplied a partial trailing assistant message to force a response to start a certain way or skip a preamble. On current-generation models this is deprecated: a trailing assistant message typically triggers a validation error instead of being honored.",
    example:
      "A team that used to send an unfinished assistant turn like '{\"status\":' to force JSON now gets a request error on current models and must use schema-constrained output instead.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Few-shot examples vs. prefill",
    definition:
      "Placing complete worked assistant turns earlier in the conversation as examples is a valid, distinct technique from prefill — prefill specifically means a partial, trailing assistant message meant to be continued, which is deprecated.",
    example:
      "Including two full example Q&A exchanges earlier in the prompt to demonstrate the desired answer style is few-shot prompting, not prefill, and remains a normal current technique.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Extraction correction loop",
    definition:
      "A production pattern for handling a failed validation: rather than blindly retrying, the source document, the invalid extraction, and the specific validation errors are all sent back to the model as one targeted correction request.",
    example:
      "When a returned invoice extraction fails because 'due_date' isn't a real calendar date, the correction request includes the original invoice text, the bad extraction, and the exact error, not just a repeat of the original ask.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Tool schema token overhead",
    definition:
      "Every tool definition's schema is sent as part of the request and consumes real tokens on every call, so a tool with many fields adds ongoing cost and latency even on turns where that tool is never invoked.",
    example:
      "Adding fifteen optional fields to a rarely-used tool quietly raises the token cost of every single request, whether or not that tool ever actually gets called.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Principles vs. explicit conditionals",
    definition:
      "General, judgment-based guidance ('adapt explanation depth to the user's demonstrated expertise') suits behavior that needs contextual judgment, while explicit unconditional rules suit safety-critical requirements that must hold without exception.",
    example:
      "'Match your tone to how formal the user sounds' is a principle; 'if the user describes a medical emergency, direct them to emergency services' is an explicit rule.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Few-shot examples for subtle distinctions",
    definition:
      "Concrete worked examples embedded in a prompt often teach a fine distinction better than a paragraph of prose describing it, especially for things like tone calibration, judging severity, or handling missing data without guessing.",
    example:
      "Showing one example of a beginner-level explanation next to one expert-level explanation communicates the difference in depth faster than a written description of 'depth' would.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Prompt dilution over long conversations",
    definition:
      "Adherence to a system prompt's original instructions tends to weaken as a conversation grows, partly because the assistant's own accumulating prior responses start acting as a competing behavioral pattern.",
    example:
      "By message eighty, a bot's early formatting instruction gets followed less consistently, not because it vanished, but because dozens of intervening replies now compete for attention alongside it.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Reinforcement at natural breakpoints",
    definition:
      "A mitigation for prompt dilution: briefly restating a key instruction at a logical point such as a phase change, a topic switch, or after a long idle gap, rather than relying solely on instructions given once at the very start.",
    example:
      "A long troubleshooting session re-states the 'always cite the log line you're referencing' rule right as the conversation shifts from diagnosis into the fix-proposing phase.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Labeled system prompt sections",
    definition:
      "Organizing a system prompt into clearly labeled parts — such as role, style, and safety sections — improves how reliably the model attends to each part and makes any one section easy to point back to later in the conversation.",
    example:
      "Splitting a prompt into a 'Role' section and a separate 'Safety' section avoids ambiguity when the word 'escalate' means something different in each.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "When to ask a clarifying question",
    definition:
      "A clarifying question is warranted when interpretations genuinely diverge in their resulting action, when the action is costly or hard to reverse, when the user's stated requirements conflict, or when truly necessary information is missing.",
    example:
      "A request to 'cancel my subscription' when the account has two active subscriptions is worth clarifying, since guessing wrong cancels the wrong one.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "When to proceed on an assumption",
    definition:
      "Proceeding on a reasonable assumption, rather than pausing to ask, fits low-risk actions, situations where context strongly implies the intended meaning, or cases the user can easily correct afterward.",
    example:
      "A request to 'shorten this summary' doesn't need a clarifying question about exactly how many words — a reasonable trim is easy to adjust if it's not quite right.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "One focused question over a list",
    definition:
      "When a clarifying question is needed, a single specific question is usually preferable to a batch of three or four at once — except when the action is irreversible, costly, or regulated, where asking everything necessary up front is the safer default.",
    example:
      "For a routine address change, the agent asks just 'is this for your billing address or shipping address?' rather than a five-part intake form.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "Naming a conflicting preference",
    definition:
      "When a user states two goals that genuinely trade off against each other, the right move is to name the tension explicitly and ask which should govern, rather than silently blending them into an unstated, half-satisfying compromise.",
    example:
      "A user who asks for 'the absolute cheapest shipping' and 'guaranteed delivery by tomorrow' gets told those two goals conflict and is asked which one matters more, instead of being handed a middling option that meets neither well.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Response-format control without blacklists",
    definition:
      "A durable fix for issues like repetitive openers or forced verbosity is a concrete system instruction paired with positive style examples, rather than a long list of banned words — capitalized emphasis alone doesn't guarantee compliance.",
    example:
      "Instead of a growing list of 'never say X, never say Y,' a prompt states 'lead with the answer, no introductory phrase' and shows two example responses written that way.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Evaluation set (eval set)",
    definition:
      "A curated collection of representative test cases — including known edge cases and past failure modes — run against every prompt or model change to check whether it actually helped, rather than judging a change from a handful of eyeballed examples.",
    example:
      "Before shipping a reworded system prompt, a team reruns it against their eval set of 200 saved conversations rather than trusting that the new wording just 'reads better.'",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "LLM-as-judge",
    definition:
      "Using a separate model call, guided by an explicit rubric, to grade open-ended or subjective outputs that have no single exact correct answer to match against. Still needs periodic human spot-checking, since the judge model itself can be miscalibrated.",
    example:
      "A judge model scores each customer-support reply against a rubric for tone and completeness, and a human periodically reviews a sample of the judge's own scores to confirm it's grading fairly.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "False positive/negative in evaluation",
    definition:
      "A false positive is a grader marking a genuinely wrong output as correct; a false negative is a grader marking a genuinely correct output as wrong. Tuning a rubric has to balance both — too lenient hides real failures, too strict flags acceptable answers as broken.",
    example:
      "A grader that's too strict about exact phrasing marks a correct-but-differently-worded answer as a failure — a false negative that means the rubric needs loosening, not the model.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Feedback loop (prompt iteration)",
    definition:
      "The cycle of running an eval, finding a specific failure, making a targeted fix that addresses its actual cause, then re-running the full eval set to confirm the fix worked without breaking anything else — rather than patching a single failing example and calling it done.",
    example:
      "When an eval reveals the model fabricates a value for a genuinely missing field, the fix is a targeted instruction plus a worked example, followed by a full eval re-run, not just rewording until that one test case passes.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    term: "Regression tracking across prompt versions",
    definition:
      "Comparing eval pass rate before and after a prompt or model change, so a new version's overall reliability can be judged against the old one, rather than assuming a change is an improvement just because it fixed the one case it targeted.",
    example:
      "A team keeps a running record of eval pass rate per prompt version so they can catch a change that fixes one failure but quietly regresses three others.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    term: "Batch processing for evaluation",
    definition:
      "Running a large evaluation suite through a bulk, non-real-time processing path — trading latency for meaningfully lower cost — since eval runs aren't user-facing or time-sensitive the way production requests are.",
    example:
      "A 500-case eval suite is run overnight through batch processing instead of the real-time API, since no one is waiting on the results immediately and the cost savings add up at that volume.",
    difficulty: "MEDIUM",
  },
];
