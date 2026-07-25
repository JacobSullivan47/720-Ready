import type { QuestionSeed } from "../types";

// Original practice questions written for this app covering Prompt
// Engineering & Structured Output. These are NOT real exam questions and do
// not reproduce any real exam's content — they are original scenarios
// designed to test the same underlying concepts. Wording and scenarios are
// original. See /about for licensing notes.
export const questions: QuestionSeed[] = [
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A developer builds a six-turn conversation with the Messages API. They attach their system prompt (containing the assistant's persona and scope rules) only to the very first request, assuming the model will 'remember' it for the rest of the session. Starting on turn two, the assistant's persona and tone noticeably disappear. What best explains this?",
    options: [
      "The system prompt has a built-in one-turn expiration and must be resent with a special 'refresh' flag once that first turn has passed.",
      "The Messages API is stateless, so every request needs its own copy of the system prompt; nothing carries over automatically between calls.",
      "The model gradually forgets instructions over a fixed number of tokens, so the persona fading is expected regardless of whether the system prompt is resent.",
      "The persona disappeared because the messages array exceeded the maximum number of turns allowed in a single conversation session.",
    ],
    correctIndexes: [1],
    explanation:
      "The Messages API keeps no server-side memory between calls, so any instruction not included in a given request simply isn't seen by the model for that request — this is exactly why the drop starting on turn two is immediate rather than gradual. There's no expiration flag (option A), no turn-count limit being hit here (option D), and the described behavior is about statelessness, not a token-based forgetting curve (option C).",
    eli10:
      "Imagine texting a substitute teacher instructions before class starts, but only for the first period. If you don't text them again before second period, they have no idea what you told them earlier — they're not ignoring you, they just never got the message that time. The API works the same way: it only knows what's in the message you send it right now.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A team wants a turn where the model must definitely make a tool call, but they're fine with the model choosing between a 'lookup_order' tool and a 'lookup_shipment' tool depending on which fits the user's message better. Which tool_choice setting matches this requirement?",
    options: [
      "auto, because it lets the model pick the best-fitting tool",
      "any, because it forces some tool call while leaving the choice of tool open",
      "none, because it disables tool selection logic and always uses the first tool listed",
      "A named/specific tool setting pointed at 'lookup_order', because it guarantees a tool call happens",
    ],
    correctIndexes: [1],
    explanation:
      "any is the setting that both mandates a tool call this turn and leaves the choice of which tool up to the model — exactly the two requirements stated. auto is wrong because it makes tool use optional, so a plain-text reply could occur with no tool call at all. none disables tool use entirely, the opposite of what's needed. A named tool would guarantee a call but would eliminate the model's ability to pick between the two tools, forcing 'lookup_order' even for shipment questions.",
    eli10:
      "Think of it like telling a kid 'you must pick a snack, but you get to choose which one.' That's different from 'you can have a snack if you want' (optional) or 'you must eat the apple, no other choice' (one specific item forced). The team wants the 'must choose, but you decide which' version.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "During a multi-step checkout flow, a developer needs one particular turn to always call the 'submit_payment' tool and nothing else — never a different tool, and never a plain-text reply. Which tool_choice configuration achieves this?",
    options: [
      "auto, which leaves both whether to call a tool and which tool to use up to the model's own judgment",
      "any, which forces some tool call to happen this turn but still leaves the choice of tool open to the model",
      "A named/specific tool setting pointed at 'submit_payment', which forces exactly that tool call and nothing else",
      "none, which disables tool use for that turn and guarantees a text-only reply instead",
    ],
    correctIndexes: [2],
    explanation:
      "Pinning tool_choice to the specific 'submit_payment' tool is the only setting that removes both kinds of freedom — whether to use a tool at all, and which one to use. auto leaves both open, any forces a tool call but still lets the model pick among any available tool, and none disables tool use altogether, which is the opposite of the goal.",
    eli10:
      "It's like telling someone 'you must press this exact button, no other button, and you can't just talk instead.' That's more restrictive than 'press some button' or 'press whatever button you want, or don't.'",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    type: "SINGLE",
    prompt:
      "A pipeline extracts shipping addresses from customer emails and feeds the result directly into a downstream mailing system. Early on, the team asked the model in prose to 'reply with a JSON object containing street, city, and zip' and occasionally got extra commentary before the JSON or a slightly different field name. What is the most effective fix?",
    options: [
      "Add the word 'IMPORTANT' in capital letters before the JSON instruction so the model takes it more seriously this time",
      "Replace the prose instruction with a JSON Schema the response must conform to",
      "Ask the model to apologize and automatically retry the request whenever any commentary appears before the JSON",
      "Lower the temperature setting, since formatting problems like this are always caused by excess randomness",
      "Switch every field name to a single-letter abbreviation so there's less for the model to get wrong",
    ],
    correctIndexes: [1],
    explanation:
      "Schema-validated output is specifically the more reliable mechanism for production pipelines compared to prose formatting requests — it enforces structure rather than hoping the model complies with a written description. Adding emphasis words doesn't guarantee compliance, asking for an apology-and-retry doesn't address the root formatting issue, temperature isn't described as the cause here, and shrinking field names doesn't address the underlying reliability gap at all.",
    eli10:
      "Asking in words for a form to be filled out a certain way is less reliable than handing over an actual form with boxes that must be filled in correctly. The 'actual form' approach is the schema — it doesn't just ask nicely, it checks the shape.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    type: "SINGLE",
    prompt:
      "A contract-review tool uses strict tool-use mode so that every extraction call's input is guaranteed to match its schema exactly — right field names, right types, nothing missing. A reviewer later finds a contract where the tool call returned a perfectly well-formed {\"renewal_term_months\": 12} but the actual contract clause says the renewal term is 24 months. What does this best illustrate?",
    options: [
      "Strict mode failed here, since a tool call with the exact right shape and field types should never contain a wrong value",
      "Schema compliance only guarantees the response is structurally valid — it doesn't guarantee the extracted value is factually correct",
      "The contract itself must have been ambiguous or poorly worded, since strict mode cannot make mistakes on clearly written text",
      "This kind of mismatch is expected only when tool_choice is set to auto, and wouldn't happen under any other tool_choice setting",
    ],
    correctIndexes: [1],
    explanation:
      "Strict tool-use mode guarantees structural conformance to the schema, not that the extracted value is factually right — schema compliance and semantic correctness are separate guarantees, and this example is a textbook case of the first holding while the second fails. Strict mode did exactly what it promises (option A is wrong), the contract's clarity isn't implicated by this failure mode (option C is an unsupported assumption), and the tool_choice setting used has no bearing on whether an extracted value is correct (option D confuses two unrelated concepts).",
    eli10:
      "Imagine a form is filled out perfectly — right boxes, right kind of answer in each one — but one of the numbers written in is just wrong. The form being 'filled out correctly' and the form having 'the right facts' are two different things, and passing the first doesn't guarantee the second.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    type: "SINGLE",
    prompt:
      "A developer maintaining an older integration recalls that previous-generation Claude models supported sending a partial, unfinished assistant message at the end of a request to force the reply to start a certain way. They try this same approach against a current-generation model and it now returns a validation error instead of working as before. What should they do to get equivalent behavior today?",
    options: [
      "Keep retrying the same partial trailing assistant message with small wording tweaks until the error stops appearing",
      "Use a schema-constrained output (or an enum field for classification), since prefill is deprecated on current models",
      "Add the partial content as a tool_result block instead of an assistant message, since tool_result blocks aren't validated the same way",
      "Switch tool_choice to none instead, so the model is forced to continue writing the partial text automatically from where it left off",
    ],
    correctIndexes: [1],
    explanation:
      "Assistant message prefill is deprecated on current-generation models, and a trailing partial assistant message now typically triggers a validation error rather than being honored — the documented modern replacements are schema-constrained output, an enum field for classification, or a system instruction to suppress preamble. Retrying the same broken approach won't fix a structural incompatibility, tool_result blocks serve a completely different purpose (returning tool output, not shaping assistant text), and tool_choice: none only disables tool use — it has no relationship to continuing partial assistant text.",
    eli10:
      "Old phones let you leave a text message unfinished and have the other person 'pick up where you left off.' Newer software doesn't allow that trick anymore and just says 'that's not a valid message.' Instead, today you get the same result a different way — like filling out a form with an already-limited set of answer choices, or telling the assistant up front 'skip the small talk.'",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A prompt includes two complete, fully-written example question-and-answer exchanges earlier in the conversation history to demonstrate the desired answer style, before the user's real question is asked. Is this the same technique as assistant message prefill?",
    options: [
      "Yes — both techniques insert assistant-authored content into the conversation, so they count as functionally identical and are equally deprecated",
      "No — these are complete worked examples (few-shot prompting), which stays valid; prefill means an unfinished trailing message meant to be continued, and that pattern is deprecated",
      "Yes, because any assistant-role content anywhere in the conversation that isn't the very first message technically counts as prefill by definition, regardless of whether it happens to be complete or only partial",
      "No, because few-shot examples must always live in the system prompt instead of the messages array, which is where prefill-style content belongs",
    ],
    correctIndexes: [1],
    explanation:
      "Complete example exchanges placed earlier in the conversation are few-shot prompting, a distinct and still-valid technique; prefill specifically means a partial, trailing assistant message intended to be continued, and that specific pattern is what's deprecated. The two are not the same technique despite both involving assistant-authored text (ruling out options A and C), and few-shot examples aren't restricted to the system prompt — they're commonly placed as ordinary turns in the messages array (ruling out option D).",
    eli10:
      "Showing someone two finished example answers before asking your real question is like handing over sample homework so they see the style you want. That's different from handing someone a half-written sentence and saying 'finish this' — which is the specific old trick that no longer works.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A team is deciding whether to add a fourteenth optional field to a tool that's only actually invoked on roughly one in every fifty requests. One engineer argues it's essentially free since the tool is rarely called. Why is this reasoning incomplete?",
    options: [
      "It's incomplete because tool definitions are only sent to the model on the very first request of a whole conversation, so later requests aren't affected by it either way",
      "It's incomplete because every tool's full schema is sent in the payload on every call, invoked or not, so the field adds cost on all fifty requests, not just the one where it's used",
      "It's incomplete because adding more optional fields to a tool's schema always causes tool_choice to silently and automatically switch over from auto to any, without any developer input or awareness",
      "It's incomplete because optional fields are billed at a meaningfully higher per-token rate than required fields, so the field's rarity doesn't offset that added cost",
    ],
    correctIndexes: [1],
    explanation:
      "Tool schemas are part of every request's payload, so their token cost is paid on every call, not only on the call where the tool happens to be invoked — a rarely-used tool's schema is still 'rarely-used' in terms of invocation, but its token overhead applies universally. Tool definitions aren't sent only once at conversation start given the API is stateless (option A misunderstands statelessness), schema size has no described effect on tool_choice's setting (option C is fabricated), and there's no differential billing rate for optional versus required fields (option D is fabricated).",
    eli10:
      "Imagine a form that includes a section nobody usually fills out. Even if almost nobody checks that box, the form itself is still longer every single time someone has to read through it — the extra section costs something just by being printed on the page, whether or not it gets used.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A system prompt for a writing assistant currently says: 'Adjust your explanation depth based on how experienced the user seems to be.' A reviewer suggests replacing this with fifteen numbered if-then rules covering specific phrasings and experience signals, believing more explicit coverage is always better. What's the most accurate assessment of that suggestion?",
    options: [
      "It's a good idea, since explicit numbered conditionals always outperform general guiding principles, no matter how nuanced or context-dependent the situation is",
      "It's risky, since adapting to expertise is contextual-judgment behavior principles handle well, and over-translating nuance into rules bloats the prompt",
      "It's necessary, because a system prompt is structurally incapable of containing any general, non-conditional guidance — every behavior needs its own explicit rule",
      "It's irrelevant, because tone-adaptation behavior of this particular kind is simply not something any system prompt wording could ever meaningfully influence one way or the other",
    ],
    correctIndexes: [1],
    explanation:
      "Judgment-based behavior like calibrating depth to a user's demonstrated expertise is a good fit for a general principle rather than an exhaustive rule list; trying to enumerate every nuance as its own conditional is a known anti-pattern that bloats the prompt and can degrade overall behavior. Explicit conditionals aren't universally superior (option A overstates it) — they're better reserved for safety-critical, must-always-hold requirements. A system prompt absolutely can and does contain general guidance (option C is false), and tone adaptation is a normal, prompt-influenceable behavior (option D is false).",
    eli10:
      "Telling someone 'explain things at the right level for who you're talking to' usually works better than handing them a fifteen-page rulebook trying to cover every possible person they might meet — the rulebook gets so long and specific that it actually gets harder to follow well.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A healthcare-adjacent assistant's system prompt includes the instruction: 'If the user describes what sounds like an immediate medical emergency, direct them to emergency services.' The team wants this behavior to hold without exception, every single time, no matter how the conversation is phrased. What's the most defensible way to treat this requirement?",
    options: [
      "Leave it exactly as a single prose sentence in the system prompt, since a clearly and carefully written prose instruction is every bit as guaranteed as code",
      "Remove it from the prompt entirely, since even mentioning safety-critical behavior in a system prompt is itself considered an unnecessary liability",
      "Keep it as explicit prompt guidance, but back anything that must hold 100% of the time with application-level logic or tooling too, not prompt text alone",
      "Convert it into a vaguer general principle like 'be sensitive to user distress,' since general principles are always more reliable than explicit rules",
    ],
    correctIndexes: [2],
    explanation:
      "Explicit, unconditional rules are the right category of guidance for safety-critical requirements, but even explicit prompt instructions remain a probabilistic influence rather than an ironclad guarantee — so a true 100%-reliability requirement is safer backed up in code or tooling as well. A prose instruction alone isn't equivalent to a guarantee (option A is false), omitting safety-critical guidance entirely would be worse, not better (option B), and vague principles are a poor substitute for an unconditional rule in a safety-critical case, not a general improvement (option D).",
    eli10:
      "Telling a babysitter 'always call 911 if something is really wrong' is good, but for something this important, you'd also want an actual emergency button installed, not just a spoken reminder — because reminders can occasionally get missed, and this one can't afford to be.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A support assistant has run for over 150 messages in a single session. Early in the conversation, its system prompt instructed it to always format monetary amounts with a currency symbol. By message 150, it has started omitting the symbol on some replies, even though the exact same system prompt is still being sent with every request. What's the most accurate explanation?",
    options: [
      "The API silently truncates or drops the oldest parts of the system prompt automatically, once a conversation grows past some fixed length in turns or tokens",
      "The instruction was never actually valid to begin with, and the early replies that happened to include the symbol were simply a coincidental fluke",
      "Adherence to early instructions can weaken over a long conversation, since many intervening turns compete with instructions from far earlier — even though the full prompt is still sent",
      "The system prompt's influence is completely fixed and totally independent of conversation length, so this drift must instead be caused by some change in the underlying model version",
    ],
    correctIndexes: [2],
    explanation:
      "This is prompt dilution: the system prompt isn't being dropped (it's resent in full every time), but a long accumulation of turns — including the model's own earlier responses — competes with instructions from far earlier in the session, weakening apparent adherence over time. Nothing here indicates silent truncation is happening (option A is a different, unsupported failure mode), the instruction clearly did work initially so it wasn't invalid from the start (option B), and drift over conversation length is a documented phenomenon, not something that requires a model-version change to explain (option D).",
    eli10:
      "If a teacher gives an instruction at the very start of a long school year, it's technically still 'in effect,' but after hundreds of days full of other things happening, students might follow it less closely just because so much else has happened since — not because the rule was erased from the board.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A customer message says: 'Please cancel my subscription.' The account has exactly one active subscription, it's a low-friction monthly plan that's easy to reactivate, and nothing else in the message is ambiguous. What is the most appropriate response strategy?",
    options: [
      "Ask a clarifying question first, since any account action should always be confirmed with a question no matter how clear the request is",
      "Proceed with the cancellation — the request is unambiguous, only one subscription exists, and it's easy to reverse if needed",
      "Escalate to a human immediately instead, since cancellation requests of any kind always require human sign-off no matter the circumstances",
      "Ignore the request entirely and ask the customer to rephrase it in a more formal tone before any action is taken on the account",
    ],
    correctIndexes: [1],
    explanation:
      "This case is exactly the profile where proceeding on a reasonable read of the request makes sense: the intended meaning is unambiguous, only one subscription exists, and reactivating is low-friction if something was misunderstood. Treating every account action as needing a clarifying question regardless of clarity (option A) ignores that unnecessary questions have a cost too, blanket human escalation for all cancellations isn't indicated by anything in this scenario (option C), and there's no stated reason the request needs to be rephrased (option D) is simply obstructive.",
    eli10:
      "If a friend clearly asks you to cancel their one and only pizza subscription, and canceling is easy to undo later if they change their mind, you'd just do it — you wouldn't grill them with questions first when there's nothing actually unclear about what they want.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A customer writes: 'Please close my account.' The account has both a personal profile and a linked business profile under the same login, closing either one is difficult to reverse once processed, and it isn't clear from the message which profile the customer means. What is the best way to handle this?",
    options: [
      "Proceed by closing both profiles at once without asking, since that approach covers every reasonable interpretation of what 'my account' could mean",
      "Ask one focused clarifying question — which of the two profiles the customer means — before acting, since the outcomes are very different and hard to reverse",
      "Guess based on whichever profile was used most recently and proceed without asking, since clarifying questions always frustrate customers unnecessarily",
      "Send a list of four separate questions covering every conceivable detail about both profiles before taking any action at all on the account today",
    ],
    correctIndexes: [1],
    explanation:
      "This is a clear case for asking, since the two interpretations lead to substantially different outcomes and the action is hard to reverse — and a single focused question is the right shape for it, since the situation isn't so irreversible or regulated that a longer up-front intake is required. Closing both profiles to 'cover all bases' risks doing an unwanted, hard-to-reverse action (option A), guessing and proceeding ignores the stated ambiguity and irreversibility (option C), and a four-question barrage is more than this single ambiguity actually calls for (option D).",
    eli10:
      "If someone asks you to 'delete my account' but you know they actually have two different accounts and deleting is permanent, you'd ask one quick question — 'which one?' — instead of guessing, deleting both just in case, or interrogating them with a whole checklist.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A customer tells a support assistant: 'I want the fastest possible shipping option, and I also want the cheapest possible shipping option.' These two goals genuinely trade off against each other for this order. What is the best response?",
    options: [
      "Silently pick a mid-tier shipping option that isn't the cheapest or the fastest, since it's a reasonable-looking compromise between the two stated goals",
      "Point out that the two goals are in tension for this order and ask the customer which one should take priority",
      "Pick the cheapest option only, since cost is mentioned second and therefore takes precedence",
      "Refuse to proceed with the order until the customer resolves the contradiction on their own without any input from the assistant",
    ],
    correctIndexes: [1],
    explanation:
      "When two requested goals genuinely conflict, the correct move is to name the tension explicitly and ask which one should govern, rather than quietly averaging them into an unstated compromise that may satisfy neither goal well. Picking a vague middle option without saying anything about the trade-off (option A) hides the conflict instead of resolving it, prioritizing one goal arbitrarily based on mention order has no real justification (option C), and refusing to help at all is unnecessarily unhelpful when a single clarifying question would resolve it (option D).",
    eli10:
      "If a friend says 'get me there as fast as possible' and 'spend as little money as possible' about a trip where those two things fight each other, the honest move is to say 'those two don't really go together here — which one matters more to you?' instead of silently picking something in between and hoping it's fine.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    type: "MULTI",
    prompt:
      "An invoice-extraction pipeline forces a tool call via tool_choice and validates every response's fields in application code even though the response already passed schema validation. On one invoice, the extraction comes back schema-valid but the application-level check flags 'due_date' as not being a real calendar date. Select the two actions that best follow the recommended correction pattern for this failure.",
    options: [
      "Immediately re-send the exact same original request completely unchanged and simply hope the model happens to produce a different, valid date this time around",
      "Send a new request with the original invoice text, the invalid extraction, and the specific 'due_date' validation error, asking the model to correct it",
      "Force a tool call on this correction turn too (rather than leaving tool use optional), so the correction reliably produces another structured extraction to check",
      "Disable application-level validation for this invoice going forward entirely, since the extraction already passed schema validation successfully once",
      "Silently substitute today's date in place of the invalid 'due_date' value, without telling the model anything or re-checking the result afterward",
    ],
    correctIndexes: [1, 2],
    explanation:
      "The recommended pattern for a validation failure is a targeted correction request that includes the source document, the invalid output, and the specific error — and continuing to force tool use (rather than leaving it optional) keeps the correction attempt structured and re-checkable. A blind retry with no added information (option A) doesn't give the model anything new to fix the mistake with, disabling validation because a response was schema-valid conflates schema compliance with correctness (option D), and silently fabricating a replacement value (option E) hides an error rather than correcting it and bypasses the model and validation entirely.",
    eli10:
      "If a form comes back with a date that doesn't actually exist on any calendar, the right fix is to hand it back with a note explaining exactly what's wrong so it can be redone correctly — not to resubmit the same blank form and hope for luck, not to stop checking dates afterward, and not to just quietly write in a made-up date yourself.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "MULTI",
    prompt:
      "A team keeps noticing that their assistant's replies all start with the same repetitive opening phrase, and they want a durable fix. Select the two approaches that are described as genuinely effective for controlling response format like this.",
    options: [
      "Maintain a continuously growing blacklist of specific banned opening words and phrases as the main mechanism for controlling this",
      "Give a concrete system-prompt instruction to skip any introductory phrase and lead directly with substance",
      "Provide a small number of positive example responses in the desired style alongside that instruction",
      "Rely on writing the instruction in all capital letters with the word 'NEVER,' since capitalization alone reliably guarantees compliance",
      "Increase the maximum output token limit, since repetitive openers are caused by the response length being capped too low",
    ],
    correctIndexes: [1, 2],
    explanation:
      "A concrete instruction to skip preamble and lead with substance, combined with positive style examples, is the durable and effective combination described for this kind of formatting problem. A long blacklist of banned phrases is described as less durable than a positive instruction plus examples (option A), capitalized emphasis words help with salience but don't by themselves guarantee the instruction is always followed (option D), and there's no described connection between output token limits and repetitive openers (option E is an unrelated, fabricated cause).",
    eli10:
      "If someone always starts their emails the same repetitive way, the better fix is telling them clearly 'just get straight to the point' and showing them a couple of good examples of what that looks like — rather than listing every single word they're banned from ever saying, or just typing your request in all caps and assuming that alone will work.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "MULTI",
    prompt:
      "A developer is reviewing best practices for how a long-lived assistant's system prompt should be maintained across a very long conversation. Select the two statements that are accurate.",
    options: [
      "Structuring a system prompt into clearly labeled sections — role, style, safety — helps the model attend to each part correctly, especially where the same word would carry different meanings in each section",
      "Once the system prompt has been included on the very first API call of a conversation, it's safe to omit it from later calls in that same conversation, since the model retains it from that point on",
      "Briefly reinforcing a key instruction at a natural breakpoint — such as a phase change, a topic switch, or after a long idle gap — is a reasonable way to counter weakening adherence over a long conversation",
      "Prompt dilution happens because the API automatically and silently deletes the oldest portion of the system prompt once a conversation crosses some certain length threshold",
      "Translating every conceivable behavioral nuance into its own explicit conditional rule is the most reliable way to prevent instructions from weakening over a long conversation",
    ],
    correctIndexes: [0, 2],
    explanation:
      "Labeled sections improve attention and reduce ambiguity between similarly-worded instructions in different parts of the prompt, and reinforcing key instructions at natural breakpoints is a real, recommended mitigation for weakening adherence over long conversations. Omitting the system prompt after the first call (option B) misunderstands statelessness — nothing is retained between calls. Prompt dilution isn't caused by automatic deletion of prompt content (option D); the full system prompt is still sent every time. And turning every nuance into its own explicit conditional is described as a bloating anti-pattern that can hurt adherence rather than protect it (option E).",
    eli10:
      "Good ideas here are: writing instructions in clearly labeled sections (like a table of contents), and giving a quick reminder of the important stuff partway through a really long conversation. Bad ideas are: assuming the assistant remembers something you only said once at the very beginning without resending it, blaming a 'auto-delete' that isn't actually happening, or trying to write a rule for every single possible situation, which just makes things worse, not better.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A developer inspects the exact JSON payload the Messages API sends for a turn where the assistant previously requested a tool call and the application already ran the tool and now has the result ready to send back. Which structural description of that payload is accurate?",
    options: [
      "The tool result must instead be sent as a brand-new top-level request parameter called 'tool_result', kept entirely separate from both the 'system' and 'messages' parameters.",
      "The prior tool call appears as a tool_use block in the assistant message, and the output returns as a tool_result block in the next user message — the system prompt stays its own top-level parameter.",
      "The system prompt must instead be embedded as its own separate message with role 'system' inside the messages array, positioned directly ahead of the tool_result content block.",
      "Sending a tool_result block removes the need to resend the top-level 'system' parameter for that particular turn only, since the tool call itself already establishes sufficient context all on its own.",
    ],
    correctIndexes: [1],
    explanation:
      "A tool_use block lives in the assistant message that requested the call, and the corresponding tool_result is returned inside the next user message — the top-level system parameter is unaffected by any of this and is still required on every request. There is no separate top-level 'tool_result' parameter (option A is fabricated), there is no 'system' role usable inside the messages array (option C), and nothing about sending a tool_result changes the requirement to resend the system prompt (option D).",
    eli10:
      "When an assistant asks to use a tool, that request is tucked inside its own turn, and the answer that comes back from the tool is tucked inside the next turn — like a note passed back and forth. The instructions you gave at the very start still have to be included every single time, no matter what notes are being passed.",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A support assistant's system prompt includes a labeled 'Order State' section noting that a customer's order is currently 'Processing.' Mid-conversation, the warehouse marks the order as 'Shipped.' What is the best way to make sure the assistant's next reply reflects the new status?",
    options: [
      "Do nothing extra, since the model will naturally infer the updated status from the flow of conversation without being told directly.",
      "Update the labeled state section in the next request so it reflects 'Shipped' — state changes must be explicitly represented each call, not assumed to carry over.",
      "Insert a new message with role 'system' into the messages array announcing the change, since the top-level system parameter can't be modified between turns.",
      "Wait until the customer explicitly asks about shipping before mentioning the update, since proactively changing the prompt could confuse the model.",
      "Re-send the exact same unmodified system prompt as before, since state updates are only ever reflected once the entire conversation session restarts from scratch.",
    ],
    correctIndexes: [1],
    explanation:
      "Because the API is stateless, a changed real-world fact like order status has to be represented in what's actually sent — updating a labeled state section (or block) is the natural way to do that for the next call. The model has no channel to 'infer' an update it was never given (option A), there's no 'system' role inside the messages array — the top-level system parameter can simply be changed between calls (option C), delaying the update serves no purpose and risks the assistant giving stale information (option D), and nothing requires restarting the conversation to reflect new state (option E).",
    eli10:
      "If a substitute teacher was told 'the test is Friday' and then the test gets moved to Monday, someone has to actually tell them the new date before their next class — they won't magically know, and you don't need to start the whole day over, you just update what you tell them.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A team wants their extraction assistant to correctly flag a field as missing when a source document genuinely doesn't contain that information, rather than inventing a plausible-sounding value to fill the gap. Several rewrites of a prose instruction describing this distinction haven't reliably fixed the behavior. What is most likely to work better?",
    options: [
      "Provide two worked examples: one where the field is present and extracted, and one where it's genuinely absent and flagged as missing rather than fabricated.",
      "Repeat the exact same prose instruction three or four separate times in a row within the system prompt, purely for additional emphasis and weight.",
      "Remove the instruction from the system prompt entirely, since additional wording rarely changes model behavior on subtle edge cases like this one.",
      "Lower the max_tokens value instead, so there's simply less room left in the response for the model to ever write out a fabricated value in the first place.",
    ],
    correctIndexes: [0],
    explanation:
      "Concrete worked examples are often more effective than prose at teaching a subtle distinction like 'missing vs. present,' since they show the exact desired behavior in both cases rather than describing it abstractly. Repeating the same prose wording isn't the same technique as providing examples and isn't described as an effective fix (option B), removing the instruction entirely would only make the problem worse (option C), and shortening the allowed output length doesn't address a fabrication tendency and could just as easily truncate a legitimate value (option D).",
    eli10:
      "If someone keeps mixing up two similar situations no matter how you explain the difference in words, showing them one clear example of each situation side by side usually clicks better than saying the same sentence over and over, giving up on the instruction, or just telling them to write less.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A classification task sorts each incoming ticket into exactly one of five fixed categories. The team previously tried to reduce inconsistent free-text answers by supplying a partial, unfinished assistant message at the end of the request so the reply would start with an opening JSON brace — and on current-generation models this now returns a validation error. What is a better modern approach for this specific classification task?",
    options: [
      "Define the output schema with a field constrained to an enum of the five valid category values, so the response can only ever be one of those five options.",
      "Instruct the model in the system prompt to 'always answer in exactly one word' and simply hope the wording stays consistent across every incoming ticket.",
      "Retry the same partial trailing assistant message but shorten it, since shorter prefill strings are still accepted on current models.",
      "Post-process every response afterward with a regular expression that strips out any text that isn't one of the five category names.",
    ],
    correctIndexes: [0],
    explanation:
      "An enum-constrained field is one of the documented modern replacements for prefill specifically for classification tasks — it structurally restricts the output to the valid set rather than hoping for compliance. Prose wording alone is a weaker guarantee than schema enforcement (option B), prefill is deprecated regardless of how short the partial string is — there's no length-based exception (option C), and a regex cleanup step doesn't stop the model from choosing an invalid category in the first place, it only reacts to the problem after the fact (option D).",
    eli10:
      "If you want someone to only ever answer with one of five specific words, the clean way is to hand them a form with exactly five checkboxes and nothing else, so there's no other option available. That beats hoping they remember to keep it short, trying an old trick that no longer works, or cleaning up their answer after the fact.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A developer wants one specific conversational turn where the assistant must reply with plain text only and must not call any tool, even though several tools remain defined for the conversation as a whole. Which tool_choice setting fits this requirement?",
    options: [
      "auto, since the model is generally trusted to decide when a tool call isn't needed",
      "any, since it lets the model freely pick whichever available tool seems least disruptive",
      "none, since it disables tool use for that turn, guaranteeing a plain-text reply",
      "A named/specific tool setting, since naming one tool ensures the others are ignored",
    ],
    correctIndexes: [2],
    explanation:
      "none is the setting that disables tool use for a turn, which is the only option that guarantees a plain-text reply with no tool call possible. auto still leaves the door open for the model to call a tool if it judges one is needed, any explicitly mandates that some tool call happen, and a named/specific tool setting would force exactly that tool's call rather than preventing tool use altogether.",
    eli10:
      "If you want to be completely sure someone doesn't press any buttons this round and just talks, you'd tell them 'no buttons this time' — that's different from 'use your judgment,' 'you must press something,' or 'press this one specific button.'",
    difficulty: "EASY",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "SINGLE",
    prompt:
      "In a multi-agent research pipeline, a lead agent hands each new sub-agent it spawns a progressively longer transcript of every prior sub-agent's findings, reasoning that 'more context can only help.' No new tools are added at any point, yet after several rounds both token cost and latency climb noticeably. What best explains the climb?",
    options: [
      "Token cost and latency scale with what's sent on each call, including conversation size — so a larger transcript raises both, even with a fixed tool set.",
      "Latency is determined solely by the number of tools defined for a call, so a growing transcript with no new tools added shouldn't affect it at all.",
      "This must indicate an underlying bug, since token cost is fixed per conversation from the start regardless of how much message content gets included.",
      "The API automatically caps the total context size allowed, so a climb like this can't be explained by growing input length in a correctly configured system.",
    ],
    correctIndexes: [0],
    explanation:
      "Cost and latency grow with the size of a conversation or context passed on each call, independent of whether the tool set changed — a steadily lengthening transcript is exactly the kind of growth that produces this effect. Latency isn't solely a function of tool count (option B is an invented restriction), token cost is not fixed regardless of content length (option C), and there's no described automatic context cap that would prevent this outcome (option D is fabricated).",
    eli10:
      "If you keep handing someone a thicker and thicker stack of notes to read before they can answer, it naturally takes longer and costs more effort each time — even if you never gave them any new tools to use. The stack itself is what's growing.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    scenarioKey: "CLAUDE_CODE_CI_CD",
    type: "SINGLE",
    prompt:
      "An agent wired into a CI/CD pipeline receives a single message: 'deploy the update.' It's unclear which of two pending branches should ship, which environment (staging or production) is meant, and what the rollback plan is — and a production deploy is difficult to reverse once traffic has shifted. The team generally prefers one focused clarifying question over a long list. Is that general preference still the best approach here?",
    options: [
      "Yes — always ask exactly one question at a time regardless of the stakes involved, since asking more than a single question is essentially never appropriate.",
      "No — for a costly, hard-to-reverse action like a production deploy, asking several questions up front is safer, even though one focused question is usually preferred.",
      "No — the agent should just deploy to production using its best guess on all three unclear points, since stopping to ask questions slows down a CI/CD pipeline.",
      "Yes, and the one question worth asking should be about the rollback plan only, since the branch and target environment can both be safely assumed.",
      "No — the agent should silently deploy to staging only instead, since staging deploys never require any clarification regardless of the request's wording.",
    ],
    correctIndexes: [1],
    explanation:
      "Irreversible, costly, or regulated actions are the specific exception where asking several clarifying questions up front, rather than one at a time, is the safer default — a production deploy with an unclear branch, environment, and rollback plan fits that profile exactly. Rigidly capping every situation at one question ignores that exception (option A), guessing on all three unclear points before an effectively irreversible action is exactly the risk the guidance warns against (option C), picking only one of three equally unclear points to ask about leaves the other two just as risky (option D), and silently redirecting to staging substitutes an unrequested assumption for actually resolving the ambiguity (option E).",
    eli10:
      "Normally it's best to ask one clear question at a time so you don't overwhelm someone. But if you're about to do something big and hard to undo — like actually launching a rocket instead of a toy one — it's worth double-checking a few key things first, even if that means more than one question this time.",
    difficulty: "HARD",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "SINGLE",
    prompt:
      "A document-processing service always needs a structured extraction result whenever it calls the model for a given document — a plain-text reply would break the downstream pipeline — and exactly one extraction tool is defined for these calls. Which statement about tool_choice for this call is accurate?",
    options: [
      "auto is the right choice here, since the model should always remain completely free to decide for itself whether structured extraction is really needed for this particular document.",
      "Either any or naming the one extraction tool directly forces a tool call, and since only one tool is defined, both settings guarantee the same outcome.",
      "none is sufficient here, since forcing a tool call is unnecessary as long as the prompt clearly and explicitly asks for JSON-formatted output in prose.",
      "any should be avoided here in favor of auto, because the any setting simply cannot be used when only a single tool is defined for a conversation.",
    ],
    correctIndexes: [1],
    explanation:
      "any mandates some tool call while leaving the choice of tool open, and naming the single available tool directly forces that same exact call — with only one tool defined, both settings converge on the identical guaranteed result. auto would leave tool use optional, which risks a plain-text reply that breaks the pipeline (option A), none disables tool use altogether and prose-only JSON requests are a weaker guarantee than enforced tool use (option C), and there's no restriction preventing any from being used with just one tool defined (option D is fabricated).",
    eli10:
      "If there's only one snack in the cupboard, telling someone 'grab a snack, your choice' and telling them 'grab the granola bar' end up meaning the same thing, since there's nothing else to pick. That's different from saying 'grab a snack only if you feel like it,' which leaves open the chance of no snack at all.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "MULTI",
    prompt:
      "A team is documenting guidance on when their assistant should ask a clarifying question versus proceed on its own judgment. Select the two statements that accurately describe that guidance.",
    options: [
      "Asking a clarifying question is warranted when the user's message has multiple plausible interpretations that would lead to substantially different actions.",
      "It's best to proceed on a reasonable assumption without asking when the action is low-risk, context strongly implies the intended meaning, and the user could easily correct a wrong guess.",
      "A single ambiguous phrase always justifies asking three or four questions at once, so that nothing is ever missed.",
      "If the user's stated requirements genuinely conflict with each other, the assistant should silently pick whichever interpretation seems most common and proceed without mentioning the conflict.",
      "Missing information that's actually necessary to complete a request is never a valid reason to ask a clarifying question, since the assistant should always proceed on a best guess instead.",
    ],
    correctIndexes: [0, 1],
    explanation:
      "Substantially different plausible interpretations is a documented trigger for asking, and proceeding without asking is the right call when the risk is low, context implies intent, and mistakes are easy to correct — these two statements describe complementary halves of the same guidance. Defaulting to a long list of three or four questions for any ambiguity overstates the guidance, which actually favors one focused question outside of high-stakes cases (option C); silently resolving a genuine conflict between stated requirements instead of naming the tension is the opposite of the recommended handling (option D); and missing necessary information is explicitly one of the valid reasons to ask, not a reason to skip asking (option E).",
    eli10:
      "Good rules of thumb: ask a question when a request could really mean two very different things, but don't bother asking when the answer is obvious, low-stakes, and easy to fix later if you guessed wrong. Bad ideas: always firing off a big list of questions for any tiny unclear bit, quietly picking a side when two requests actually clash instead of just saying so, or refusing to ever ask even when truly important information is missing.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "PROMPT_ENGINEERING",
    type: "MULTI",
    prompt:
      "A developer is reviewing how the four tool_choice settings — auto, any, a named/specific tool, and none — actually behave. Select the two accurate statements.",
    options: [
      "auto is the default setting and leaves both whether to call a tool at all, and which tool to call, up to the model.",
      "any guarantees that some tool call happens this turn but still leaves the choice of which available tool to use up to the model.",
      "A named/specific tool setting still allows the model to reply with plain text instead, if it determines no tool is truly necessary for the user's message.",
      "auto and any are functionally identical in every situation, since both settings were designed to eventually result in a tool call.",
      "Setting tool_choice to none disables tool use for that turn and also removes the tool schemas from that request's payload entirely, since they're considered unnecessary once tool use is disabled.",
    ],
    correctIndexes: [0, 1],
    explanation:
      "auto is the default and leaves both decisions — whether to call a tool, and which one — open to the model, while any narrows that to 'a tool call is mandatory' but still leaves the choice of tool open; these are two accurate, complementary descriptions. A named/specific tool setting removes the plain-text option entirely rather than still permitting it (option C is false), treating auto and any as identical is exactly the common confusion the two settings are meant to be distinguished from, since auto makes tool use optional while any makes it mandatory (option D is false), and none disabling tool use for a turn says nothing about the tool schemas being stripped from the payload — that's an unsupported extra claim (option E is false).",
    eli10:
      "Two true facts: 'use your judgment, tools optional' is the default setting, and a different setting means 'you must use some tool, but you still get to pick which one.' It's wrong to think those two settings are the same thing, wrong to think naming one exact tool still lets someone just talk instead, and wrong to assume turning tools off for a turn also erases the tool descriptions from what gets sent.",
    difficulty: "HARD",
  },
];
