import type { QuestionSeed } from "../types";

export const questions: QuestionSeed[] = [
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A team notices their agent's transcript is only using a third of the available context window, yet the assistant still seems to forget a constraint the user stated at the very start of a long conversation. Which statement best explains what is likely happening?",
    options: [
      "The context window must be full, since forgetting only happens once the token budget is exhausted",
      "Having unused token capacity does not guarantee the model attends equally to content placed far earlier in a long transcript versus more recent content",
      "The model can only remember information from the last message it received",
      "This indicates a bug in the API that requires switching to a smaller context window",
    ],
    correctIndexes: [1],
    explanation:
      "Unused capacity is not the same as uniform attention — early content in a long transcript can be effectively deprioritized relative to recent content even with plenty of room left. The window is not full (ruling out option A), the model can reference more than just the last message (ruling out option C), and this is an expected attention pattern, not an API defect (ruling out option D).",
    eli10:
      "Just because your backpack still has room doesn't mean you remember what's buried at the very bottom as well as what you just put in. The model has space left, but old stuff can still feel 'farther away' to it.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A support chatbot only ever sends the last 10 messages of a conversation to the model. Most sessions work fine, but one user says 'like I mentioned earlier, cancel the plan I upgraded to, not my original one' and the bot has no idea which plan that refers to because the upgrade discussion was 14 messages ago. What is the most accurate diagnosis?",
    options: [
      "The model has a hard-coded memory limit of 10 messages regardless of application design",
      "This is a textbook sliding window failure — a fixed recent-message window dropped an older detail the user later relied on",
      "The bot should have used a larger token limit per message instead",
      "This only happens when the user changes topics too quickly",
      "This is an unavoidable side effect of any context management approach",
    ],
    correctIndexes: [1],
    explanation:
      "Keeping only the last N messages is precisely the tradeoff a sliding window makes: cheap and simple, but it silently loses anything older that a later message ends up referencing. The 10-message cap is an application design choice, not an inherent model limit (ruling out A), enlarging per-message tokens wouldn't fix a windowing gap (ruling out C), and other strategies like structured summarization are specifically designed to avoid this failure (ruling out D and E).",
    eli10:
      "Imagine only keeping the last 10 sticky notes from a conversation and throwing older ones away. If the user talks about something written on note 14, which got thrown out, the assistant just can't see it anymore.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A developer compresses an older stretch of a long conversation into the summary 'the user discussed a few preferences about their trip.' Later, the assistant can no longer say whether the user wanted a window or aisle seat. What change would best fix this?",
    options: [
      "Switch to keeping the entire raw conversation forever with no summarization at all",
      "Replace the vague narrative summary with a structured summary containing explicit fields, such as a seat-preference field with the exact stated value",
      "Shorten the summary even further to save tokens",
      "Remove summarization and rely purely on a sliding window instead",
    ],
    correctIndexes: [1],
    explanation:
      "The problem is that the summary was vague and narrative, not that summarization itself was the wrong tool — a structured summary with explicit fields (like 'Seat preference: aisle') preserves the exact detail that a prose summary blurred away. Keeping everything forever (A) defeats the purpose of summarizing and doesn't scale; shortening further (C) would make the problem worse; and a sliding window (D) has its own separate failure mode and doesn't address why a compressed fact was lost.",
    eli10:
      "Saying 'they talked about trip stuff' loses the actual answer. Writing 'Seat: aisle' as its own labeled note keeps the important detail instead of blurring it into a vague sentence.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "An apartment-search assistant keeps a structured object tracking the user's budget, desired neighborhood, and must-have amenities. Partway through the conversation, the user says something that directly contradicts a must-have they stated earlier. What is the correct behavior?",
    options: [
      "Quietly update the structured object to the newest value and continue without mentioning the change",
      "Ignore the new statement since the structured object already reflects the 'official' preference",
      "Point out to the user that this appears to conflict with what they said earlier and ask which one should hold",
      "Delete the structured object and start inferring preferences fresh from the rest of the conversation",
    ],
    correctIndexes: [2],
    explanation:
      "A genuine contradiction between stated preferences should be surfaced to the user rather than silently resolved in either direction — silently overwriting (A) or silently ignoring the new statement (B) both risk acting on an assumption the user never confirmed, and discarding the whole object (D) throws away otherwise-valid tracked state. Asking which preference should take priority keeps the user in control of resolving the conflict.",
    eli10:
      "If someone first says 'I love spicy food' and later says 'no spicy food at all,' the right move is to ask 'wait, which one did you mean?' instead of silently guessing or pretending you didn't hear the second thing.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "MULTI",
    prompt:
      "A single support chat thread covers three separate open tickets from the same customer, each with its own ticket number, dollar amount, and current resolution status. Which two practices best keep these from getting mixed up as the conversation continues?",
    options: [
      "Track each ticket as its own record with fields for ticket ID, amount, and status, updated independently as things change",
      "Rely on the order messages appear in the transcript to infer which ticket is currently being discussed",
      "Reference each ticket by its explicit ticket ID whenever discussing or updating it, rather than by vague terms like 'the first one'",
      "Merge all three tickets into a single combined status once any one of them changes",
      "Summarize the entire thread into one paragraph and re-derive ticket details from that paragraph as needed",
    ],
    correctIndexes: [0, 2],
    explanation:
      "Independently tracked records keyed by explicit IDs are exactly how multi-issue conversations stay reliable — each ticket's state is unambiguous no matter how the conversation flows. Relying on message order (B) is fragile once the user jumps between tickets, merging separate tickets (D) destroys the distinction that matters, and re-deriving specifics from a single prose summary (E) reintroduces the precision loss that structured tracking is meant to avoid.",
    eli10:
      "If you're juggling three different homework assignments, it helps to label each one clearly and check on each one by name — not to just guess which assignment someone means from the order you started talking about them, and not to smoosh them into one big assignment.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "After calling a tool that returns a customer's full account record — including internal routing flags, duplicate metadata, and a long internal event log — an application keeps only the customer's name, plan tier, and current balance in context. What is this practice an example of?",
    options: [
      "Progressive summarization of the conversation",
      "A sliding window applied to tool calls",
      "Tool result compression, extracting the relevant fields and discarding the rest",
      "System prompt versioning",
    ],
    correctIndexes: [2],
    explanation:
      "Keeping only the fields the task actually needs from a verbose tool payload, while discarding internal or irrelevant fields, is the definition of tool result compression — distinct from summarizing conversational turns. It is not a sliding window (which discards by recency across messages, not by field relevance) and it has nothing to do with system prompt versions, so B and D don't fit; it's also not progressive summarization since no conversation history is being condensed here, ruling out A.",
    eli10:
      "If a tool hands back a giant messy report, you don't need to keep the whole thing — you just jot down the three numbers that actually matter and toss the rest.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A legal-review assistant has been summarizing a long document review conversation as it goes. When asked to quote the exact indemnification clause discussed 40 turns ago, it paraphrases instead of quoting it precisely. What is the best explanation and fix?",
    options: [
      "Summaries are inherently lossy for exact wording, so the assistant should retrieve and quote directly from the original document rather than rely on the running summary",
      "The summary should simply be made twice as long to include more words verbatim",
      "This is expected and there is no reliable fix for preserving exact quotes across a long conversation",
      "The assistant should switch to a pure sliding window so recent turns are always exact",
    ],
    correctIndexes: [0],
    explanation:
      "Summarization is interpretive by nature, so exact facts and precise wording should be retrieved from the original source on demand rather than trusted to survive compression. Simply lengthening the summary (B) doesn't guarantee precision and wastes tokens; claiming there's no fix (C) ignores the well-established retrieval pattern; and a sliding window (D) doesn't help once the original clause has scrolled out of the window either.",
    eli10:
      "If you want to quote a book exactly, you go back and read the actual page instead of trusting someone's rough retelling of it, even a pretty good one.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A platform feature automatically condenses the earlier portion of a long-running session into a summary once the conversation approaches its context-window limit, without the application writing any custom summarization logic. What is this feature best described as?",
    options: [
      "Context editing",
      "A sliding window",
      "Compaction",
      "A structured state object",
    ],
    correctIndexes: [2],
    explanation:
      "Automatically summarizing earlier history into a compact block as the limit approaches is what compaction refers to. Context editing instead removes stale content under rules rather than summarizing it, so A is a different mechanism; a sliding window drops whole older messages by recency rather than condensing them, ruling out B; and a structured state object is an application-maintained data structure, not an automatic platform summarization feature, ruling out D.",
    eli10:
      "It's like the app automatically writing a short 'story so far' recap once things get too long, without you having to program that recap yourself.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A developer wants old tool outputs and superseded reasoning removed from a long agentic session's context based on configurable rules, without those removed pieces being reduced to a summary anywhere. Which API-native mechanism matches this goal?",
    options: [
      "Progressive summarization",
      "Context editing",
      "Compaction",
      "A persistent reference section",
    ],
    correctIndexes: [1],
    explanation:
      "Context editing clears out stale content according to rules rather than compressing it into a summary, which matches the requirement that nothing be preserved in condensed form. Compaction (C) specifically summarizes rather than deletes, so it does not fit 'without being reduced to a summary'; progressive summarization (A) is an application-level pattern that also produces a summary; and a persistent reference section (D) is about retaining, not removing, content.",
    eli10:
      "Instead of writing a shorter version of old notes, this just throws the old, no-longer-needed notes away completely, following rules about what counts as no-longer-needed.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "MULTI",
    prompt:
      "A team is deciding between building their own application-level structured state object versus leaning on an API-native context-management feature. Which two statements accurately describe the tradeoff?",
    options: [
      "Application-level structured state gives the developer more direct control and keeps exact facts intact verbatim",
      "API-native mechanisms are always strictly more accurate at preserving exact numeric facts than any application-level approach",
      "API-native mechanisms reduce how much custom context-management plumbing the application needs to build, at the cost of being more of a black box",
      "Application-level approaches can never be combined with API-native mechanisms in the same system",
      "API-native mechanisms guarantee the application never needs to think about context limits again",
    ],
    correctIndexes: [0, 2],
    explanation:
      "The real tradeoff is control and exact-fact fidelity (favoring application-level state) versus reduced implementation burden with less visibility into internals (favoring API-native features) — both A and C capture this accurately. Option B overstates API-native accuracy as an absolute guarantee, which isn't supported; option D is false since a robust design often composes both; and option E overstates what any automatic feature guarantees.",
    eli10:
      "Building your own tracking system gives you full control and keeps numbers exact, while using a built-in automatic feature saves you work but you can't see exactly how it decides things. Both can be true at once, and you can often use both together.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "An application's request to the model fails because the accumulated conversation exceeds the context window. The developer's first instinct is to immediately resend the exact same request, hoping it succeeds on a retry. Why is this the wrong move?",
    options: [
      "Exceeding the context window is a transient network issue, so retrying with a short delay is actually the correct fix",
      "Hitting the context limit is a signal that the context needs to be trimmed, summarized, or compacted first — resending the identical oversized request will not resolve an actual capacity problem",
      "The request should be retried with a smaller max_tokens value only, leaving the conversation history untouched",
      "There is no reliable way to recover once the context window has been exceeded",
    ],
    correctIndexes: [1],
    explanation:
      "Exceeding the window is a structural signal to reduce what's being sent — through trimming, summarization, or compaction — not a flaky, retry-worthy error. It is not a transient network issue, so A is wrong; shrinking only the output budget (C) does nothing about an oversized input; and there are well-established recovery patterns, so D is overly pessimistic.",
    eli10:
      "If your backpack is too full to zip, unzipping and rezipping it the exact same way won't make it fit — you actually have to take some stuff out first.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "A customer returns to an old support conversation two days after an order lookup tool reported their package was 'processing.' Without doing anything else, the assistant resumes the conversation and tells the customer their order is still processing, based on that earlier tool result. What is wrong with this approach?",
    options: [
      "Nothing is wrong; prior tool results remain valid indefinitely within the same conversation",
      "The tool result may now be stale after two days, so the assistant should re-fetch current order status before making any claim about it",
      "The assistant should have used a sliding window to forget the earlier tool result entirely",
      "The assistant should ask the customer to describe the current status themselves instead of using any tool",
    ],
    correctIndexes: [1],
    explanation:
      "Time has passed, so a tool result fetched two days ago may no longer reflect reality — the correct move is a fresh, targeted re-fetch before asserting current status, not just replaying old data. Treating the old result as still valid (A) ignores exactly the risk that made it stale; a sliding window (C) addresses message recency, not tool-result freshness, and doesn't guarantee refetching; and asking the customer to self-report status (D) abandons a tool the assistant has direct access to.",
    eli10:
      "If you checked the weather two days ago and it said 'sunny,' you wouldn't just repeat that today — you'd check again, because two days is enough time for it to have changed.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A returning conversation used five different tools earlier in the session (customer lookup, loyalty-tier check, address lookup, order lookup, and payment status). Only the order's shipping status is actually relevant to what the user is asking about now. What is the most appropriate way to refresh state before responding?",
    options: [
      "Re-call all five tools from scratch to be thorough, regardless of what the user is currently asking about",
      "Re-call only the order lookup tool, since that is the piece of state actually relevant and likely to have changed",
      "Re-call none of the tools and rely entirely on the earlier results already in the transcript",
      "Ask the user to manually provide their current shipping status instead of using any tool",
    ],
    correctIndexes: [1],
    explanation:
      "A targeted refresh of just the state that's actually relevant and likely stale is both efficient and sufficient — re-calling everything (A) wastes effort on data that isn't in question, doing nothing (C) risks acting on outdated information, and offloading the lookup to the user (D) ignores the tool access the assistant already has.",
    eli10:
      "If you only need to know if it's raining right now, you check the sky — you don't also re-check the temperature, the wind, and last week's forecast just because you checked those before too.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    type: "SINGLE",
    prompt:
      "While a customer support conversation is paused mid-session, a billing webhook fires indicating the customer's plan was just upgraded. The conversation resumes an hour later with the customer asking a question unrelated to billing. What is the correct way to handle the webhook event?",
    options: [
      "Have the assistant proactively send the customer an unsolicited message announcing the plan change as soon as the webhook fires",
      "Ignore the webhook entirely since the customer didn't ask about billing",
      "Include the updated plan information as fresh, authoritative state in the next request sent to the model, even though the customer's current question is unrelated",
      "Wait for the customer to explicitly ask about their plan before ever mentioning the update",
    ],
    correctIndexes: [2],
    explanation:
      "The model only learns about external events if the application feeds them in, so folding the updated plan state into the next request as current, authoritative context is correct even if the immediate question is unrelated — that way the assistant won't act on stale plan info if it comes up later. Proactively messaging the customer out of turn (A) assumes a notification feature the product may not support; ignoring the update (B) risks the assistant referencing an outdated plan later in the same session; and waiting indefinitely (D) is really just a variant of ignoring it, since the state should already be current in context regardless of whether it's mentioned.",
    eli10:
      "If something changes behind the scenes while you're mid-conversation, someone needs to whisper the update to the assistant before its next reply — the assistant can't sense the change on its own, but that doesn't mean it should suddenly interrupt to announce it either.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "SINGLE",
    prompt:
      "A long-running research assistant product updates its system prompt to adopt a notably different tone and policy. Several research conversations that began weeks ago under the old system prompt are still active. What is the recommended approach?",
    options: [
      "Apply the new system prompt to every active conversation immediately, regardless of when it started",
      "Keep each ongoing conversation associated with the system prompt version it started under, and apply a deliberate migration approach for transitioning older conversations",
      "Never update the system prompt once any conversation has started using the product",
      "Let each user manually paste in the new system prompt themselves if they want the update",
    ],
    correctIndexes: [1],
    explanation:
      "Versioning system prompts and tying an ongoing conversation to the version it began under, with a considered migration path, avoids abruptly introducing a contradictory persona or policy mid-session. Swapping instantly for all conversations (A) risks exactly that contradiction; refusing to ever update (C) is impractical for a long-lived product; and pushing the burden onto users to self-manage prompt versions (D) isn't a realistic or intended pattern.",
    eli10:
      "If a game changes its rules partway through, it's confusing to change the rules on someone mid-match. Better to let current matches finish under the old rules and start new matches under the new ones, with a real plan for switching over.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    type: "MULTI",
    prompt:
      "A multi-agent research workflow has been running for hours, issuing dozens of web searches and accumulating retrieved passages, plus tracking a handful of exact figures (like specific statistics) it needs to cite precisely later. Which two practices best manage this session's context?",
    options: [
      "Apply a sliding window to retrieved results, keeping only the last few retrieval batches instead of every search result ever fetched",
      "Keep every retrieved passage from every search made during the session in context indefinitely, just in case it's needed",
      "Maintain a small structured store of the exact figures that need precise citation, rather than relying on a rolling narrative summary to preserve them",
      "Fold the exact statistics into the same prose summary used for general conversational continuity",
      "Stop performing new searches once the context is more than half full",
    ],
    correctIndexes: [0, 2],
    explanation:
      "Windowing retrieval results to the most recent, relevant batches keeps search-heavy context from ballooning with superseded results, and a dedicated structured store for exact figures protects precision that a general summary would blur. Keeping every retrieval forever (B) is exactly the accumulation problem windowing is meant to prevent; folding exact numbers into a prose summary (D) risks losing precision; and arbitrarily halting new searches at a fixed fill threshold (E) isn't a real context-management technique described here.",
    eli10:
      "For a long research project, it helps to only keep your most recent batches of notes handy instead of every scrap ever collected, and to keep the exact numbers you'll need to quote later in their own clearly labeled list instead of burying them in a general summary.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A creative-writing assistant maintains a short block listing established character ages, key locations, and world rules for an ongoing story, and this block is deliberately kept out of the rolling conversation summary. What best describes the purpose of this block?",
    options: [
      "It functions as a persistent reference section, protecting compact but critical facts from being reworded or dropped during summarization",
      "It is a sliding window applied to story details",
      "It is an example of context editing removing stale content",
      "It replaces the need for any conversation history at all",
    ],
    correctIndexes: [0],
    explanation:
      "Keeping a small set of stable, must-not-change facts in their own retained block — separate from the summary that gets compressed or rewritten — is exactly the role of a persistent reference section. It isn't a sliding window, since nothing is being dropped by recency (ruling out B); it isn't context editing, since the block is being preserved rather than cleared (ruling out C); and it doesn't replace conversation history, it supplements it (ruling out D).",
    eli10:
      "It's like keeping an index card of 'facts that must never change' — character names, ages, world rules — off to the side, so it never gets accidentally shortened or garbled when the rest of the conversation gets summarized.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "MULTI",
    prompt:
      "A team designing a long-lived assistant wants a context-management architecture that composes multiple strategies well. Which two design choices reflect the recommended way to combine application-level and API-native approaches?",
    options: [
      "Maintain an application-level structured object for facts that must remain exact, such as confirmed order details or active configuration values",
      "Rely solely on an API-native compaction feature for every kind of information, including exact numeric facts, to minimize engineering effort",
      "Use an API-native mechanism like compaction to absorb general context-window pressure from ordinary conversational back-and-forth",
      "Avoid API-native features entirely, since only application-level code can be trusted",
      "Let the structured object be silently overwritten by whatever compaction produces, so there is only one source of truth",
    ],
    correctIndexes: [0, 2],
    explanation:
      "The well-supported pattern is to keep exact-fact-bearing state in an application-maintained structured object while letting an API-native mechanism like compaction handle general conversational overflow — that's exactly A and C. Relying on compaction alone for exact facts (B) risks the precision loss summarization is prone to; refusing API-native features altogether (D) discards a useful tool for reducing plumbing; and letting compaction overwrite the structured object (E) undermines the entire point of keeping exact facts protected in their own store.",
    eli10:
      "It works best to keep the must-be-exact stuff in your own clearly labeled notes, and let the app's automatic 'shorten the old chat' feature handle the everyday chit-chat — not the other way around, and not by throwing away one approach entirely.",
    difficulty: "HARD",
  },
];
