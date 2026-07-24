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
      "The system prompt has a built-in expiration of one turn and must be resent with a special 'refresh' flag after that.",
      "The Messages API is stateless, so every request — including turn two onward — needs its own copy of the system prompt and full history; nothing from turn one carries over automatically.",
      "The model gradually forgets instructions over a fixed number of tokens, so the persona fading is expected regardless of whether the system prompt is resent.",
      "The persona disappeared because the messages array exceeded the maximum number of turns allowed per conversation.",
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
      "auto",
      "any",
      "A named/specific tool setting pointed at 'submit_payment'",
      "none",
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
      "Add the word 'IMPORTANT' before the JSON instruction so the model takes it more seriously",
      "Replace the prose instruction with a JSON Schema the response must conform to, so the shape is enforced rather than requested",
      "Ask the model to apologize and retry automatically whenever commentary appears before the JSON",
      "Lower the temperature setting, since formatting problems are always caused by high randomness",
      "Switch the field names to single letters so there's less to get wrong",
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
      "Strict mode failed, since a correctly-shaped tool call should never contain a wrong value",
      "Schema compliance guarantees only that a response is structurally valid — it does not guarantee the underlying value is semantically or factually correct",
      "The contract itself must have been ambiguous, since strict mode cannot make extraction mistakes on clear text",
      "This is expected only when tool_choice is set to auto, and would not happen under any other tool_choice setting",
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
      "Use a schema-constrained output (or an enum field, for classification) and/or a system instruction to skip preamble, since prefill is deprecated on current models",
      "Add the partial content as a tool_result block instead of an assistant message, since tool_result blocks aren't validated the same way",
      "Switch tool_choice to none so the model is forced to continue the partial text automatically",
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
      "Yes, both techniques rely on inserting assistant-authored content, so they are functionally identical and equally deprecated",
      "No — these are complete worked examples placed earlier in the conversation (few-shot prompting), which remains a valid technique, whereas prefill specifically refers to an unfinished trailing assistant message meant to be continued, which is deprecated",
      "Yes, because any assistant-role content that isn't the very first message in the conversation counts as prefill by definition",
      "No, because few-shot examples must always be placed in the system prompt rather than in the messages array, unlike prefill",
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
      "It's incomplete because tool definitions are only sent to the model the first time a conversation starts, so later requests aren't affected either way",
      "It's incomplete because every tool's schema definition is included in the request payload on every call regardless of whether that tool ends up being invoked, so the added field increases token cost and latency on all fifty requests, not just the one where it's used",
      "It's incomplete because adding more fields to a tool schema always causes tool_choice to silently switch from auto to any",
      "It's incomplete because optional fields are billed at a higher token rate than required fields",
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
      "It's a good idea, since explicit conditionals always outperform general principles no matter the situation",
      "It's risky, since 'adapt to demonstrated expertise' is exactly the kind of contextual-judgment behavior principles handle well, and over-translating every nuance into explicit conditionals tends to bloat the prompt and can hurt overall adherence rather than help it",
      "It's necessary, because a system prompt cannot contain any general, non-conditional guidance at all",
      "It's irrelevant, because tone-adaptation behavior is not something a system prompt can influence either way",
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
      "Leave it exactly as a single prose sentence in the system prompt, since well-written prose instructions are just as guaranteed as code",
      "Remove it from the prompt entirely, since safety-critical behavior should never be mentioned in a system prompt",
      "Keep it as explicit prompt guidance, but recognize that anything that truly must hold 100% of the time is safer additionally enforced through application-level logic or tooling rather than relying on prompt text alone",
      "Convert it into a general principle like 'be sensitive to user distress,' since principles are always more reliable than explicit rules",
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
      "The API silently truncates or drops old parts of the system prompt once a conversation grows past a certain length",
      "The instruction was never actually valid, and the early replies that included the symbol were a fluke",
      "Adherence to early instructions can weaken over a long conversation because the growing volume of intervening turns — including the assistant's own prior replies — increasingly competes for attention with instructions given far earlier, even though the system prompt itself is still present in full on every call",
      "The system prompt's influence is fixed independent of conversation length, so this drift must be caused by a change in the model version instead",
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
      "Proceed with the cancellation, since the request is unambiguous, the account only has one subscription to cancel, and the action is easy for the customer to reverse if needed",
      "Escalate to a human immediately, since cancellations always require human sign-off regardless of context",
      "Ignore the request and ask the customer to rephrase it more formally before taking any action",
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
      "Proceed by closing both profiles at once, since that covers every reasonable interpretation of 'my account'",
      "Ask one focused clarifying question — such as which of the two profiles the customer wants closed — before taking any action, since the interpretations lead to substantially different, hard-to-reverse outcomes",
      "Guess based on which profile was used most recently and proceed without asking, since asking questions always frustrates customers",
      "Send a list of four separate questions covering every conceivable detail about both profiles before doing anything",
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
      "Immediately re-send the exact same original request unchanged and hope the model happens to produce a different, valid date this time",
      "Send a new request containing the original invoice text, the invalid extraction that was returned, and the specific validation error about 'due_date', asking the model to correct it",
      "Force a tool call for this correction turn as well (rather than leaving tool use optional), so the correction attempt reliably produces another structured extraction to re-validate",
      "Disable application-level validation for this invoice going forward, since it already passed schema validation once",
      "Silently substitute today's date for the invalid 'due_date' value without telling the model or re-checking anything",
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
      "Structuring a system prompt into clearly labeled sections, such as separate role, style, and safety sections, helps the model attend to each part correctly, which matters especially when the same word would otherwise carry different meanings in different sections",
      "Once the system prompt has been included on the very first API call of a conversation, it's safe to omit it from later calls in that same conversation, since the model retains it from that point on",
      "Briefly reinforcing a key instruction at a natural breakpoint — such as a phase change, a topic switch, or after a long idle gap — is a reasonable way to counter weakening adherence over a long conversation",
      "Prompt dilution happens because the API automatically deletes the oldest portion of the system prompt once a conversation crosses a certain length",
      "Translating every conceivable behavioral nuance into its own explicit conditional rule is the most reliable way to prevent instructions from weakening over a long conversation",
    ],
    correctIndexes: [0, 2],
    explanation:
      "Labeled sections improve attention and reduce ambiguity between similarly-worded instructions in different parts of the prompt, and reinforcing key instructions at natural breakpoints is a real, recommended mitigation for weakening adherence over long conversations. Omitting the system prompt after the first call (option B) misunderstands statelessness — nothing is retained between calls. Prompt dilution isn't caused by automatic deletion of prompt content (option D); the full system prompt is still sent every time. And turning every nuance into its own explicit conditional is described as a bloating anti-pattern that can hurt adherence rather than protect it (option E).",
    eli10:
      "Good ideas here are: writing instructions in clearly labeled sections (like a table of contents), and giving a quick reminder of the important stuff partway through a really long conversation. Bad ideas are: assuming the assistant remembers something you only said once at the very beginning without resending it, blaming a 'auto-delete' that isn't actually happening, or trying to write a rule for every single possible situation, which just makes things worse, not better.",
    difficulty: "HARD",
  },
];
