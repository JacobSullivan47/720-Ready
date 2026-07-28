import type { QuestionSeed } from "../types";

export const questions: QuestionSeed[] = [
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A team building an agent gives it access to four different capabilities: a custom get_account_balance tool the team wrote and executes on their own servers, Anthropic's built-in text editor tool, a hosted web-search capability that Anthropic's platform runs directly, and a couple of tools from a partner's MCP server. For which capability does the calling application never intercept or execute the underlying call itself, because Anthropic's own platform carries it out end-to-end?",
    options: [
      "get_account_balance, since it touches the team's private account database",
      "The Anthropic-defined text editor tool, since Anthropic wrote its schema",
      "The hosted web-search capability, since it is a server-side tool",
      "The partner's MCP server tools, since they run outside the team's own infrastructure",
    ],
    correctIndexes: [2],
    explanation:
      "Server-side tools like hosted web search run entirely within Anthropic's own platform, so the calling application never intercepts or executes the call. get_account_balance is a user-defined tool executed by the app itself. The text editor tool is Anthropic-defined but still executes client-side, inside the application's environment. MCP tools execute on a separate MCP server that the application's client still dispatches to, which is a different arrangement from a server-side tool that bypasses the application entirely.",
    eli10:
      "Imagine four different helpers: one you built yourself, one Anthropic designed but you still run, one Anthropic runs completely on its own with no help from you, and one that lives on someone else's computer. Only the third one, the fully Anthropic-run helper, never needs your app to lift a finger.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
    type: "SINGLE",
    prompt:
      "A developer is deciding whether to connect their coding agent to a newly published MCP server that exposes tools for modifying files in a cloud storage bucket. Before granting broad trust to whatever these tools claim to do, what should most directly inform how much the developer trusts the tool calls?",
    options: [
      "Whether the tool descriptions happen to mention safety considerations",
      "The reputation and track record of whoever operates that MCP server",
      "Whether the tools have clear, descriptive, well-chosen names",
      "Whether the JSON schema properly marks its required fields",
    ],
    correctIndexes: [1],
    explanation:
      "Because MCP tools execute on a separate server, trust in their behavior has to come from who operates that server, not from surface-level factors. A safety note in a description, good naming, or well-formed required fields are all good hygiene, but none of them constrain what code actually runs when the server receives a call.",
    eli10:
      "It's like deciding whether to hand your house key to someone: what matters is whether you actually trust that person, not whether they wrote a nice note about being careful with keys.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "Two engineers write descriptions for a create_calendar_event tool. Engineer A writes: 'Creates a calendar event.' Engineer B writes: 'Creates an event on the current user's primary calendar. Use for scheduling meetings with a specific start and end time; do not use for recurring series, which requires create_recurring_event. Expects start and end as ISO 8601 timestamps, for example 2026-03-01T14:00:00-05:00. Returns the created event_id and a confirmation link.' Which description will produce more reliable tool selection and correct inputs, and why?",
    options: [
      "Engineer A's, because shorter descriptions reduce token overhead and confusion",
      "Engineer B's, because it states the purpose, boundaries, input format, and output",
      "Both are equivalent, since the JSON schema types already convey everything the model needs",
      "Engineer A's, because models perform better with minimal, open-ended instructions",
    ],
    correctIndexes: [1],
    explanation:
      "Engineer B's description covers what the tool does, when to use it, when not to (pointing elsewhere for recurring events), a concrete input format example, and what the output contains — the core ingredients of a strong tool description. Engineer A's leaves the model guessing at timestamp format and scope. Schema types alone don't convey semantic boundaries like timezone formatting or which tool handles recurrence, so brevity here actively costs accuracy rather than saving it.",
    eli10:
      "Telling a friend 'make a party' leaves out a lot; telling them 'make a party this Saturday at 3pm, not a repeating one, and text me the address after' gives them what they actually need to do it right.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A support agent's issue_refund tool currently accepts a free-text customer_name field and searches for a matching account before issuing the refund. Two customers named 'Pat Nguyen' exist in the system, and a refund was recently applied to the wrong one. What redesign most directly addresses this class of bug?",
    options: [
      "Add a confirmation dialog that asks the customer to re-type and verify their full name",
      "Require a find_customer lookup that returns a stable customer_id for issue_refund to use",
      "Make customer_name a required field with a minimum character length requirement before saving",
      "Log every refund call in an audit trail so a supervisor can review it manually later",
    ],
    correctIndexes: [1],
    explanation:
      "This is the lookup-then-act pattern: resolving ambiguous free text to a stable identifier first means the action tool never has to guess which of two same-named accounts was meant. Re-typing a name doesn't resolve the ambiguity between two identical names, a minimum length requirement doesn't disambiguate anything, and auditing only catches the mistake after the money has already moved.",
    eli10:
      "If two kids in class are both named Sam, you shouldn't hand out a prize by shouting 'Sam!' — you should check which Sam's seat number it is first, then give the prize to that exact seat.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A fitness app has one log_workout tool with an activity_type field plus a large set of optional parameters: pace and distance for runs, sets, reps, and weight for strength training, and elevation and route for hikes, where each group only makes sense for certain activity_type values and several combinations are actually invalid together. What is the recommended fix?",
    options: [
      "Add validation error messages explaining which fields are invalid for each activity_type",
      "Split the tool into separate tools per activity, such as log_run, log_strength_session, and log_hike",
      "Convert all optional parameters into one freeform notes string for the model to fill in as it sees fit",
      "Keep one tool but mark every parameter as required to force the model to always provide full context",
    ],
    correctIndexes: [1],
    explanation:
      "When a tool's parameters have constraints that depend on another field's value, splitting into narrower, purpose-specific tools removes the conditional logic entirely instead of patching around it with error messages. A freeform notes field would throw away structure that downstream code needs. Forcing every field to be required would push nonsensical values, like reps for a hike, into unrelated activity types.",
    eli10:
      "Instead of one messy form that changes its own rules depending on what you check at the top, it's easier to just have three separate simple forms: one for running, one for lifting, one for hiking.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A logistics tool returns a shipment's origin_warehouse_id, and separately returns an estimated_transit_days value computed at call time from current traffic conditions. A downstream rerouting tool needs to accept a reference to the shipment's warehouse. Which value should that downstream tool accept as input, and why?",
    options: [
      "estimated_transit_days, because it reflects the most current traffic conditions",
      "origin_warehouse_id, because it's a stable identifier that keeps its meaning",
      "Both values combined together into a single composite reference string",
      "Neither; the downstream tool should independently recompute both values itself",
    ],
    correctIndexes: [1],
    explanation:
      "origin_warehouse_id is a stable identifier that keeps the same meaning across calls, which is exactly what a downstream action tool should be built around. estimated_transit_days is a derived, time-sensitive figure that can go stale the moment conditions change, making it a poor thing to treat as a fixed reference. Combining the two or recomputing from scratch adds complexity without solving the underlying mismatch.",
    eli10:
      "A warehouse's address doesn't change, but 'how long the drive will take today' changes all the time. You want to hand someone the address, not today's guess about traffic.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    type: "SINGLE",
    prompt:
      "A document-search tool used in an extraction pipeline returns an empty array both when a query legitimately matches nothing in the corpus and when the search backend fails to respond. An agent using this tool recently treated a backend outage as if there were simply no matching documents, and went on to write a report claiming no data existed. What is the most direct fix?",
    options: [
      "Make the tool retry more aggressively several times before finally giving up and returning",
      "Have the tool return a distinct status for a genuine empty match versus a backend failure",
      "Change the tool description to warn the model that this kind of ambiguity can occur",
      "Require the model to always double-check results with a second, independent search tool call",
    ],
    correctIndexes: [1],
    explanation:
      "The core defect is that a real empty result and an outright failure look identical in the output. Making the two cases structurally distinguishable removes the ambiguity at its source. More aggressive retrying doesn't fix the output shape, a warning in the description gives the model nothing concrete to check, and requiring a second tool call is a workaround rather than a fix for the underlying design flaw.",
    eli10:
      "If a search comes back blank, the tool needs to actually say 'I looked and found nothing' instead of leaving the same blank answer for both 'nothing there' and 'I couldn't even look.'",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "An internal API used by a support tool returns results in pages of 50. A developer wires the tool so that whenever the model asks for 'all open tickets,' the tool loops internally and concatenates every page before returning one giant array. With a queue of 3,000 open tickets, what problem does this design create?",
    options: [
      "It violates the MCP protocol, which explicitly forbids tools from ever returning arrays",
      "It floods the model's context with the full result set instead of one paged response",
      "It has no real downside, since the model simply receives complete information in one call",
      "It will always exceed the underlying API's own page-size limit and therefore fail outright",
    ],
    correctIndexes: [1],
    explanation:
      "Silently auto-fetching and concatenating every page is exactly the anti-pattern the pagination guidance warns against; the tool should instead return a first page along with a total_count (or estimate) and a cursor, letting the model decide whether to page further. There is no protocol rule against returning arrays, and the design won't necessarily fail outright — it will simply hand back an unwieldy result that wastes context and can crowd out other reasoning.",
    eli10:
      "If someone asks for 'all the mail,' dumping all 3,000 letters on their desk at once isn't as helpful as handing them the first stack of 50 and saying 'there are 2,950 more if you want them.'",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
    type: "SINGLE",
    prompt:
      "As an internal platform accumulates over 200 narrow automation tools across many teams, a developer proposes collapsing them all behind one call_platform_tool(operation_name, params) tool to keep the active tool list manageable. What is the main problem with this approach compared to progressive tool availability?",
    options: [
      "It technically exceeds the maximum number of tools that a model is allowed to be given at once",
      "It hides the real tool surface behind one generic entry point, hurting tool selection",
      "It requires every team across the platform to rewrite their existing tool schemas from scratch",
      "It prevents the underlying tools from ever being used by more than one agent at a time",
    ],
    correctIndexes: [1],
    explanation:
      "Collapsing many distinct capabilities behind one aggregator tool obscures which concrete tool actually fits a task, and tends to produce worse tool selection overall. The better approach is a small discovery tool that returns a ranked shortlist of candidates, with the actual matching tool revealed on a later turn. There's no hard technical limit implied here, no requirement to rewrite every schema, and nothing about restricting use to a single agent.",
    eli10:
      "If you shrink a toolbox with 200 clearly labeled tools down into one mystery box where you have to guess the tool's name to get it out, it's actually harder to find the right one, not easier.",
    difficulty: "HARD",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    type: "SINGLE",
    prompt:
      "A receipt-parsing tool flags requires_review whenever its confidence score falls below a cutoff the engineering team picked because '0.7 felt about right.' After launch, receipts near that cutoff are inconsistently flagged: some clearly wrong ones pass through untagged while some clearly correct ones get needlessly queued for review. What does this indicate about the threshold?",
    options: [
      "Confidence scores should be removed from the tool's output entirely and not exposed at all",
      "The threshold should have been calibrated against a labeled validation set, not intuition",
      "requires_review should simply always default to true no matter what the confidence score is",
      "The tool should stop returning a numeric confidence score and only return a plain boolean",
    ],
    correctIndexes: [1],
    explanation:
      "Confidence thresholds need to be calibrated against real labeled data to reflect actual accuracy, and an intuition-based cutoff is exactly what produces the inconsistent behavior described. Removing confidence scores or flagging everything for review throws away the value of a graded signal entirely, and collapsing to a plain boolean removes the very information needed to calibrate a threshold correctly in the first place.",
    eli10:
      "If a teacher guesses 'a 70 out of 100 feels like a passing grade' without checking real test results, some kids who deserve to pass won't, and some who don't deserve it will. You need to check against real examples first.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A workspace-management tool is defined as delete_workspace(workspace_id, dry_run: boolean), where dry_run: true just prints what would happen. A reviewer worries this is unsafe as an agent-facing design. What is the core risk, and what's the recommended alternative?",
    options: [
      "The risk is that dry_run defaults to false in the schema; the fix is simply flipping that default so it defaults to true",
      "The risk is nothing stops a second call with dry_run: false; the fix is a preview tool issuing a one-time token, plus an execute tool requiring it",
      "The risk is that workspace_id values are sequential and could be easily guessed by an outside attacker; the fix is switching to randomly generated UUIDs instead",
      "The risk is unnecessary performance overhead from running the safety check twice; the fix is simply caching the dry-run result for later reuse",
    ],
    correctIndexes: [1],
    explanation:
      "A bare dry_run boolean provides no structural barrier to real deletion — the same tool can simply be called again with dry_run: false. The recommended pattern splits preview and execution into two separate tools joined by a one-time confirmation token bound to the specific previewed action, forcing an actual human confirmation before anything irreversible happens. The other options address concerns, like default values, identifier guessing, or performance, that don't touch the actual structural gap.",
    eli10:
      "If the only thing stopping a big red delete button from firing is a little switch anyone can flip, that's not real safety. It's safer to first show someone exactly what will happen and get a one-time ticket, and only accept that exact ticket to actually do it.",
    difficulty: "HARD",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A team building an MCP server for their internal wiki needs to expose three things: a static list of team-space names that rarely changes, a live 'search the wiki right now' capability, and a canned onboarding walkthrough that a new hire's assistant should run only when the new hire explicitly asks for it. How should these map onto MCP's three building blocks?",
    options: [
      "All three should be Tools, since Tools are the only building block MCP actually supports in practice",
      "Team-space list as a Resource, live search as a Tool, and onboarding walkthrough as a Prompt",
      "The team-space list as a Tool, the live search as a Resource, and the onboarding walkthrough as a Tool",
      "All three should just be Resources, since none of them ever modify any state at all",
    ],
    correctIndexes: [1],
    explanation:
      "The static, rarely-changing list is passive reference material an agent might consult, which fits a Resource. The live search needs fresh computation at the moment of use, which fits a Tool. The explicitly user-invoked walkthrough is a reusable, user-selected template, which fits a Prompt. MCP genuinely supports all three block types, so treating everything as a Tool or everything as a Resource ignores that the search needs live computation and the walkthrough is meant to be deliberately chosen rather than just read.",
    eli10:
      "A phone book you flip through, a live weather check you run right now, and a recipe card you only pull out when you decide to bake — those are three different kinds of things, and MCP has a matching box for each one.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
    type: "SINGLE",
    prompt:
      "An MCP server advertises a purge_cache tool with the annotation readOnlyHint: true. A host application is deciding whether to auto-approve calls to this tool without any user confirmation, reasoning that the annotation guarantees the tool is safe. What is the correct assessment?",
    options: [
      "Auto-approval is completely safe, since readOnlyHint is always a protocol-enforced guarantee the server truly cannot ever misreport",
      "Auto-approval is risky, since annotations are self-reported hints a server chooses to set and could be wrong or malicious",
      "Auto-approval is safe as long as the tool's name doesn't literally contain a word like 'delete' or 'purge'",
      "Auto-approval is risky, but only if the tool happens to come from an unofficial, non-Anthropic MCP server",
    ],
    correctIndexes: [1],
    explanation:
      "Annotations like readOnlyHint are self-reported metadata that a server chooses to set, not something the protocol verifies or enforces, so a buggy or malicious server could mislabel a destructive action as read-only. Real approval decisions need to rest on actual server trust, user policy, and assessed operation risk. Tool naming gives no real guarantee, and the risk that an annotation might be wrong applies to any server, not only unofficial ones, since the annotation itself is never independently verified.",
    eli10:
      "Just because a box has a sticker that says 'nothing breakable inside' doesn't mean it's true — you still have to trust who packed the box, not just read the sticker.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "SINGLE",
    prompt:
      "A multi-agent research assistant has a pipeline that: (1) fetches a webpage and extracts its raw text, (2) summarizes the extracted text, and (3) decides whether to include that summary in a final report shared with the user. The team is deciding which steps to merge into single tool calls versus keep as separate decision points. Which statement reflects good practice here?",
    options: [
      "Deciding whether to include the summary in the report should stay a separate decision point, not folded into summarization",
      "All three steps should always be merged into a single tool call to minimize the total number of tool calls made",
      "Summarization should never be exposed as a tool at all, since only fetching a page ever counts as a genuine tool action",
      "Because latency always matters most, every network-touching step should always be split into its own separate, standalone tool",
    ],
    correctIndexes: [0],
    explanation:
      "Deciding to include a summary in a user-facing report is an editorial judgment call, so it should stay a distinct step rather than being silently absorbed into an earlier mechanical action (fetching and extracting the page text, by contrast, is mechanical and always paired, so those two are a good pair to compose into one tool). Merging all three ignores that the inclusion decision needs its own checkpoint; summarization can legitimately be exposed as its own tool; and latency alone doesn't dictate splitting every network step regardless of whether the steps are mechanical and always paired.",
    eli10:
      "Grabbing a book off the shelf and opening to the right page can happen in one smooth motion, but deciding whether to actually read that page out loud to the class is its own choice that shouldn't happen automatically.",
    difficulty: "HARD",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A team is categorizing failure modes for their order-management tool: (1) the backend database connection times out, (2) the model passes an invalid three-letter country code, (3) the customer's account is genuinely not eligible for the requested action under company policy, and (4) the calling agent's credentials lack permission for this operation. Which statement describes correct handling?",
    options: [
      "The database timeout (1) should be retried inside the tool with backoff, not surfaced immediately to the model as a failure",
      "The invalid country code (2) should trigger the exact same human-escalation path used for the permission error (4)",
      "All four of these cases should be retried automatically, since retries are always considered safe for order-management tools",
      "The permission error (4) should be silently retried by the tool over and over until it eventually succeeds",
    ],
    correctIndexes: [0],
    explanation:
      "A transient timeout belongs to tool-level retry with backoff rather than immediately failing in front of the model (the ineligibility case is a separate, non-retryable situation that instead just needs a structured result with a clear explanation of the policy, since nothing about retrying changes that outcome). The invalid country code is a validation error the model can self-correct, not something needing the same human-escalation path as a genuine permission problem. Blanket automatic retries ignore that non-transient failures won't be fixed by trying again, and a permission error needs an escalation path rather than silent endless retries, which could never succeed without a credential change anyway.",
    eli10:
      "If the phone line drops, try calling back. If you're simply not allowed into a room, calling back a hundred times won't open the door — someone needs to actually give you permission first.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "An MCP-connected client encounters four situations: (1) it calls a tool name the server doesn't recognize, (2) a real tool call reaches the server but hits a downstream 404 for a record that doesn't exist, (3) it sends arguments that fail the tool's declared schema before any tool logic runs, and (4) a real tool call reaches the server and hits a temporary 503 from a dependency. Which statement correctly classifies these?",
    options: [
      "Situations (1) and (3) are protocol-level errors, since the request never becomes valid enough to reach real tool logic",
      "Situation (2) should also be reported as a protocol-level error, since the requested record genuinely doesn't exist at all",
      "All four of these situations are essentially equivalent, and the client should handle each of them identically",
      "Situation (4) should always be treated as a permanent failure with absolutely no possibility of a later retry",
    ],
    correctIndexes: [0],
    explanation:
      "An unrecognized tool name and schema-invalid arguments never reach genuine tool logic, which makes both protocol-level errors (a downstream 404 and a transient 503, by contrast, both occur only after a valid call reached real backend logic, so those belong inside a normal tool result as execution errors instead). Treating the 404 as a protocol error miscategorizes a legitimate execution-time outcome, the four cases clearly call for different handling rather than identical treatment, and a 503 is transient by nature rather than a permanently unretriable failure.",
    eli10:
      "If you dial a phone number that doesn't exist, that's a different kind of problem than dialing correctly but the person you called happens to be busy right now. One means try a different number; the other means maybe try again later.",
    difficulty: "HARD",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A developer has a server named 'analytics' configured at both project scope, in the repository's committed .mcp.json, and local scope, in their own per-project configuration, with different command paths and different environment variables in each. Which statement correctly describes how Claude Code resolves this?",
    options: [
      "The local-scope definition wins entirely, since local scope has higher precedence than project scope",
      "Claude Code merges the two definitions field by field, taking the command path from whichever scope defined it first",
      "Because project scope is checked into version control and shared with the team, it always overrides local scope for consistency",
      "Since the two definitions share the same server name, Claude Code refuses to load either until the conflict is manually resolved",
    ],
    correctIndexes: [0],
    explanation:
      "Local scope outranks project scope, so the local-scope definition for 'analytics' applies in full (with no project or local entry present at all, a user-scope entry would simply be what gets used instead, since it'd be the only definition available). Scopes are never merged field by field — the highest-precedence definition wins entirely. Project scope does not override local scope despite being shared; precedence runs local over project over user. And Claude Code doesn't require manual conflict resolution — the precedence rule resolves it automatically without blocking either definition from loading.",
    eli10:
      "If your own personal note and a shared team note both use the same label, your personal note is the one that counts, not a mix of both, and not the team one just because more people saw it.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A ticket-routing tool accepts a priority parameter typed as a free-text string. In practice, callers have sent 'high', 'High', 'URGENT', 'sev1', and 'asap', and the downstream routing logic has to guess at each variant's meaning, sometimes incorrectly. What is the most direct fix?",
    options: [
      "Add a longer description explaining the intended values without changing the parameter's type",
      "Convert priority to an enum with a fixed set: low, medium, high, critical",
      "Rename the parameter to priority_level so that its purpose becomes clearer to callers",
      "Keep priority as free text but validate that the submitted string is non-empty and trimmed",
    ],
    correctIndexes: [1],
    explanation:
      "For a stable, closed set of values like priority tiers, an enum constrains input to a small known list, which is exactly what removes the guessing problem at its source. A longer description doesn't stop callers from sending fresh spelling variants, a rename doesn't change what values are legal, and requiring non-empty text still lets any of the same inconsistent variants through.",
    eli10:
      "Instead of hoping everyone spells 'urgent' the same way, give them a short list of buttons to pick from, like low, medium, high, critical, so there's no way to say it a different way.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A reporting tool exposes a single parameter, filter_expression: string, where callers are expected to write things like \"status=open AND assigned_to=alice AND created_after=2026-01-01\". The model frequently gets the syntax slightly wrong, producing malformed expressions that fail to parse. Which redesign best follows recommended parameter design?",
    options: [
      "Add a detailed grammar reference and several worked examples for filter_expression inside the description",
      "Replace filter_expression with typed parameters like a status enum, assignee_id, and a date field",
      "Keep filter_expression as-is but return a clearer, more specific parsing-error message when syntax is wrong",
      "Ask the model to first call a separate tool that validates filter_expression's syntax before making the real call",
    ],
    correctIndexes: [1],
    explanation:
      "Replacing one generic, hand-parsed string with parameters shaped like the actual domain concepts, a status enum, an assignee id, a date, removes the syntax-guessing problem entirely, since the model no longer has to construct a fragile mini-language. A grammar reference in the description still relies on the model reliably generating free-form syntax; better error messages only react after a malformed call already happened; and a separate validation tool adds an extra round trip to work around a problem that typed parameters avoid from the start.",
    eli10:
      "Instead of asking someone to write 'status=open AND assigned=alice' as one tricky sentence that's easy to get wrong, just give them separate boxes to fill in, one for status and one for who it's assigned to. Much harder to mess up.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A scheduling tool defines a parameter named start_time_iso8601_utc_string, but the tool's description and schema say nothing further about the expected format. What is the problem with relying on the parameter name alone to communicate this?",
    options: [
      "There is no real problem, since a descriptive parameter name fully replaces the need for stating format in the description",
      "Naming conventions are not a substitute for explicitly stating the format, since the model may not reliably infer it",
      "Parameter names longer than roughly 20 characters will silently degrade the model's overall tool-calling performance",
      "JSON Schema explicitly rejects any parameter name that contains more than one underscore character",
    ],
    correctIndexes: [1],
    explanation:
      "Packing format expectations only into a parameter's name is a known pitfall; the model is far more reliably steered by an explicit statement and example in the tool description than by inferring meaning from an identifier. There's no length-based performance cliff, and JSON Schema places no such restriction on underscores in names, so the tool will register and run fine, it will simply be more error-prone in practice than if the format were stated plainly.",
    eli10:
      "Naming a box 'Fragile_Glass_DoNotDrop' doesn't actually tell the mover how to handle it if nobody explains what those words mean. You have to say the instructions out loud, not just hope the label's wording does all the work.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A support-ticket lookup tool returns its result as one sentence: 'Ticket #4471 for customer Dana Cole is currently marked resolved.' A separate reopen_ticket tool needs a ticket_id to act, and engineers notice the model sometimes transposes digits when copying the number out of the sentence into the next call. What is the most direct fix?",
    options: [
      "Ask the model to always carefully re-read the sentence twice before it calls reopen_ticket",
      "Have the lookup tool return structured fields, like ticket_id, customer_name, and status",
      "Shorten the sentence and reformat it so that the ticket number is easier to copy accurately",
      "Add a checksum digit to every ticket number so that typos can be automatically caught afterward",
    ],
    correctIndexes: [1],
    explanation:
      "Returning structured, named fields lets a downstream tool reference the identifier directly instead of relying on the model to re-transcribe it out of prose, which is the actual source of the transposition errors. Re-reading or shortening the sentence doesn't remove the transcription step at all, and a checksum only detects a problem after the fact rather than preventing the miscopy from happening in the first place.",
    eli10:
      "Telling someone a phone number out loud versus handing them a card with the number printed on it, the printed card is much harder to mess up copying. Give the next tool the actual card, not a sentence to transcribe.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "An agent calls a charge_card tool to bill a customer. The HTTP request times out with no response, but logs later show the charge was likely submitted to the payment processor before the timeout occurred. The agent's retry logic is about to call charge_card again with the same amount. What is the correct handling?",
    options: [
      "Retry immediately and automatically every time, since timeouts are always transient infrastructure errors",
      "Treat the outcome as uncertain instead of retrying blindly, since a retry could duplicate the charge",
      "Skip charging entirely and mark the invoice as paid, since the timeout implies the charge succeeded",
      "Treat it as a permanent validation error and ask the model to go change the charge input",
    ],
    correctIndexes: [1],
    explanation:
      "A write whose completion status is genuinely unknown after a timeout must be surfaced as uncertain rather than automatically retried, because a blind retry risks a duplicate charge, a real financial harm the ordinary transient-timeout playbook doesn't account for. Assuming success outright is just as unfounded as assuming failure, since neither is actually known. And this isn't a validation error at all; the input was fine, and the failure occurred purely at the infrastructure level.",
    eli10:
      "If you're not sure whether your text actually sent before your phone froze, sending it again might mean the person gets it twice. Better to check first than to assume and repeat something that may have already happened.",
    difficulty: "HARD",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
    type: "SINGLE",
    prompt:
      "A team is building a single internal agent that calls a bespoke deployment script specific to their own pipeline, one that no other team or agent will ever need. A developer proposes wrapping this script as a full MCP server anyway, reasoning that 'MCP is the standard so everything should use it.' What is the most reasonable assessment?",
    options: [
      "This is a good use of MCP, since MCP servers always simplify authentication and error handling for any tool they expose",
      "A plain custom tool likely fits better, since MCP's main advantage is reusability, which this workflow doesn't need",
      "MCP must always be used here, since production tools are only ever meant to be exposed through MCP servers",
      "Neither approach works; the script must instead be rewritten as an Anthropic-defined client-side tool",
    ],
    correctIndexes: [1],
    explanation:
      "MCP earns its overhead when an integration needs to be reused across multiple clients or agents; a single-agent, deeply specific workflow like this one doesn't benefit from that reusability and is usually simpler and faster to build as a plain custom tool. MCP by itself doesn't automatically solve authentication or error handling, so it isn't an automatic simplification. There's no rule confining production tools exclusively to MCP, and Anthropic-defined client-side tools are a separate, unrelated category, like bash or the text editor tool, not a substitute for wrapping a custom internal script.",
    eli10:
      "If only one person will ever use a particular tool, it doesn't need a fancy shared toolbox with a shared catalog and lock. Just keep it as a simple tool for that one job.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A team adopts an MCP server to expose their internal ticketing system to several agents. After launch, they're surprised to hit rate-limit errors from the underlying ticketing API and see inconsistent behavior when two agents call the same tool at the same time. What does this reveal about a common misconception?",
    options: [
      "That MCP servers are fundamentally incompatible with concurrent access and must serve only one caller",
      "That adopting MCP alone does not automatically provide rate limiting, caching, or concurrency handling",
      "That the team should have used a server-side tool instead, since only those tools ever handle rate limits",
      "That MCP tools simply cannot call any backend APIs that already enforce their own rate limits",
    ],
    correctIndexes: [1],
    explanation:
      "MCP standardizes how tools are exposed and discovered, but it doesn't inherently provide rate limiting, caching, retries, or authorization; those concerns still need to be engineered into the server or the system it wraps. MCP servers aren't restricted to single-caller use, so concurrent access isn't the actual problem. Server-side tools are a different execution model entirely with no special built-in rate-limit handling that MCP tools lack. And MCP tools can absolutely call rate-limited APIs; the rate limit is simply a real constraint the implementation still has to handle.",
    eli10:
      "Giving a bunch of kids one shared water fountain doesn't automatically stop them from all pushing the button at once, someone still has to set up a line. MCP is the shape of the fountain, not the line-forming rule.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A developer wants to connect Claude Code to an MCP server that requires their personal API key. They don't want the key checked into the shared repository or visible to the rest of the team, but they still want the server available while working in this particular project. Which MCP configuration scope best fits this need?",
    options: [
      "Project scope, since it's specific only to this one repository",
      "User scope, since it applies across every project the developer works on",
      "Local scope, since it's per-user, per-project, and not checked into the shared repository",
      "There's no way to keep a credential out of the shared repo while still using it in this project",
    ],
    correctIndexes: [2],
    explanation:
      "Local scope is scoped to both the individual developer and the specific project without being committed to the shared repository, which is exactly the fit for a personal credential the developer doesn't want teammates to see. Project scope lives in the committed .mcp.json and is shared with the whole team, the opposite of what's needed here. User scope would apply the same server to every project rather than just this one. And Claude Code does support exactly this need through local scope, so there is a way to do it.",
    eli10:
      "If you have a secret key you only want to use for one specific project and don't want to leave lying around for the whole team to see, you keep it in your own personal drawer for that project, not in the shared team folder.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    type: "SINGLE",
    prompt:
      "A code reviewer is auditing a newly written send_notification tool. The tool's description reads only 'Sends a notification.' Its parameters are message: string, recipient: string, and options: string, where options is meant to hold things like urgency and delivery channel packed together as free text. Which statement correctly identifies a problem with this design?",
    options: [
      "The description fails to state when to use the tool, when not to, or what it returns, leaving the model to guess",
      "The tool is basically fine as written, since message and recipient are both correctly typed as strings",
      "recipient should also stay free text, since notification recipients vary far too much to type strictly",
      "The real fix here is simply renaming the options parameter to config_options for extra clarity",
    ],
    correctIndexes: [0],
    explanation:
      "The bare one-line description gives no guidance on when to use it, when to avoid it, expected input specifics, or output shape, exactly the gap good tool descriptions are meant to close (bundling urgency and channel into the single free-text options field is a second, separate gap — that structure could be enforced with small enums instead). The tool is not fine as written given those gaps; recipient could very reasonably be tightened to a stable identifier depending on the domain rather than assumed to require free text; and a rename alone adds no missing structure.",
    eli10:
      "A tool that just says 'sends a notification' and lets you shove 'urgent, by text' into one blank box is like a form with no instructions and only one giant blank line instead of separate labeled boxes for each piece of information.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    scenarioKey: "CODE_GENERATION_CLAUDE_CODE",
    type: "SINGLE",
    prompt:
      "A developer connects five different MCP servers to their coding assistant, and three of them each expose a similarly named create_task tool with overlapping but slightly different behavior. The assistant frequently picks the wrong one. Which response is the recommended way to address this?",
    options: [
      "Sharpen each create_task tool's description so it states its specific purpose and how it differs from the others",
      "Disconnect four of the five MCP servers, since only one server per capability can be connected at a time",
      "Merge all three create_task tools behind one aggregator tool with a server_name parameter for fewer top-level tools",
      "Rename all three tools to the exact same name so the assistant treats them as fully interchangeable options",
    ],
    correctIndexes: [0],
    explanation:
      "Clear, differentiated descriptions are an established remedy for tools competing for the model's attention (introducing progressive availability, such as a discovery step surfacing a short ranked list of matches first, is a separate, complementary fix). There's no hard server-count limit forcing a developer to disconnect servers. Collapsing distinct tools behind one aggregator with a server_name parameter is the anti-pattern the guidance warns against rather than the fix, since it hides rather than clarifies the real tool surface. And making the names identical would make the three tools even harder to tell apart, not easier.",
    eli10:
      "If three stores in a mall all had a sign that just said 'Shop,' you'd get confused about which one to walk into. Better signs describing what's actually different about each store, plus asking a helpful directory first, work a lot better than smashing all three stores into one confusing megastore.",
    difficulty: "HARD",
  },
];
