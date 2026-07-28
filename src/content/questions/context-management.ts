import type { QuestionSeed } from "../types";

export const questions: QuestionSeed[] = [
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A team notices their agent's transcript is only using a third of the available context window, yet the assistant still seems to forget a constraint the user stated at the very start of a long conversation. Which statement best explains what is likely happening?",
    options: [
      "The context window must be full already, since forgetting only happens once the entire token budget gets exhausted",
      "Unused token capacity doesn't guarantee equal attention — early content can be deprioritized relative to what's recent",
      "The model can only remember information contained in the single most recent message it received, nothing further back",
      "This indicates a bug in the API that requires switching over to a noticeably smaller context window size",
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
      "The model itself has a hard-coded memory limit of exactly 10 messages, regardless of application design",
      "This is a sliding window failure — a fixed recent-message window dropped a detail the user needed later",
      "The bot should have used a noticeably larger token limit allotted per individual message instead of trimming history",
      "This kind of gap only happens when the user changes topics unusually quickly during the conversation",
      "This is simply an unavoidable side effect that comes with using any context management approach at all",
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
      "Switch to keeping the entire raw conversation forever in context, with no summarization applied at all",
      "Replace the vague summary with a structured summary that has explicit fields, like an exact seat-preference value",
      "Shorten the existing summary even further than it already is, in order to save additional tokens",
      "Remove summarization entirely and rely purely on a sliding window over the most recent messages instead",
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
    type: "SINGLE",
    prompt:
      "A single support chat thread covers three separate open tickets from the same customer, each with its own ticket number, dollar amount, and current resolution status. Which practice best keeps these from getting mixed up as the conversation continues?",
    options: [
      "Track each ticket as its own record with fields for ticket ID, amount, and status, and reference each ticket by its explicit ticket ID rather than by vague terms like 'the first one'",
      "Rely on the order messages happen to appear in the transcript to infer which ticket is meant",
      "Merge all three tickets into a single combined status the moment any one of them changes",
      "Summarize the entire thread into one paragraph and try to re-derive ticket details from that paragraph as needed",
    ],
    correctIndexes: [0],
    explanation:
      "Independently tracked records keyed by explicit IDs are exactly how multi-issue conversations stay reliable — each ticket's state is unambiguous no matter how the conversation flows. Relying on message order is fragile once the user jumps between tickets, merging separate tickets destroys the distinction that matters, and re-deriving specifics from a single prose summary reintroduces the precision loss that structured tracking is meant to avoid.",
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
      "Progressive summarization of the conversation history",
      "A sliding window strategy applied to tool calls",
      "Tool result compression, keeping only the relevant fields",
      "System prompt versioning across different application requests",
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
      "Summaries are inherently lossy for exact wording, so the assistant should retrieve and quote directly from the source document",
      "The summary should simply be made roughly twice as long so it can include more of the original words verbatim",
      "This is expected behavior and there is simply no reliable fix for preserving exact quotes across a long conversation",
      "The assistant should switch entirely to a pure sliding window so that only the most recent turns stay exact",
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
    type: "SINGLE",
    prompt:
      "A team is deciding between building their own application-level structured state object versus leaning on an API-native context-management feature. Which of the following accurately describes the tradeoff?",
    options: [
      "Application-level structured state gives the developer more direct control and keeps exact facts intact verbatim, while API-native mechanisms reduce custom context-management plumbing at the cost of being more of a black box",
      "API-native mechanisms are always strictly more accurate at preserving exact numeric facts than any application-level approach",
      "Application-level approaches can essentially never be combined with API-native mechanisms in the same overall system",
      "API-native mechanisms basically guarantee the application never needs to think about context limits again",
    ],
    correctIndexes: [0],
    explanation:
      "The real tradeoff is control and exact-fact fidelity (favoring application-level state) versus reduced implementation burden with less visibility into internals (favoring API-native features). The claim that API-native mechanisms are always strictly more accurate overstates it as an absolute guarantee, which isn't supported; the claim that the two approaches can essentially never be combined is false since a robust design often composes both; and the claim that API-native mechanisms guarantee the application never needs to think about context limits again overstates what any automatic feature provides.",
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
      "Hitting the context limit signals that the context needs to be trimmed, summarized, or compacted first, not blindly resent as-is",
      "The request should instead be retried with only a smaller max_tokens value set, leaving the full conversation history completely untouched",
      "There is simply no reliable way to recover once the context window limit has already been exceeded in a request",
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
      "Nothing is wrong here; prior tool results remain perfectly valid indefinitely within the same ongoing conversation",
      "The tool result may now be stale after two days, so the assistant should re-fetch current order status first",
      "The assistant should instead have used a sliding window to forget the earlier tool result entirely",
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
      "Re-call only the order lookup tool, since that's the piece of state most likely to have changed",
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
      "Ignore the webhook entirely and take no action at all, since the customer didn't ask about billing right now",
      "Include the updated plan info as fresh, authoritative state in the next request, regardless of the current question",
      "Wait for the customer to explicitly bring up and ask about their plan before ever mentioning the recent update",
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
      "Apply the brand-new system prompt to every active conversation immediately, regardless of when each one originally started",
      "Keep each ongoing conversation tied to the system prompt version it started under, with a deliberate migration plan for older ones",
      "Never update the system prompt again once even a single conversation has started using the current version of the product",
      "Let each individual user manually paste in the new system prompt themselves whenever they want to receive the update",
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
    type: "SINGLE",
    prompt:
      "A multi-agent research workflow has been running for hours, issuing dozens of web searches and accumulating retrieved passages, plus tracking a handful of exact figures (like specific statistics) it needs to cite precisely later. Which of the following practices best manages this session's context?",
    options: [
      "Apply a sliding window to retrieved results, keeping only the most recent batches rather than every result ever fetched, and maintain a small structured store of exact figures needing precise citation rather than a rolling narrative summary",
      "Keep every single retrieved passage from every search made during the entire session in context indefinitely, just in case",
      "Fold the exact statistics into that same prose summary used for general conversational continuity",
      "Stop performing any new searches once the context window is more than half full",
    ],
    correctIndexes: [0],
    explanation:
      "Windowing retrieval results to the most recent, relevant batches keeps search-heavy context from ballooning with superseded results, and a dedicated structured store for exact figures protects precision that a general summary would blur. Keeping every retrieval forever is exactly the accumulation problem windowing is meant to prevent; folding exact numbers into a prose summary risks losing precision; and arbitrarily halting new searches at a fixed fill threshold isn't a real context-management technique.",
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
      "It functions as a persistent reference section, protecting compact facts from being reworded during summarization",
      "It is essentially a sliding window mechanism applied specifically to the story's ongoing details as they unfold",
      "It is an example of context editing rules actively removing stale content from the conversation entirely",
      "It effectively replaces the need for keeping any prior conversation history around in context at all",
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
    type: "SINGLE",
    prompt:
      "A team designing a long-lived assistant wants a context-management architecture that composes multiple strategies well. Which design choice reflects the recommended way to combine application-level and API-native approaches?",
    options: [
      "Maintain an application-level structured object for facts that must remain exact, such as confirmed order details, and use an API-native mechanism like compaction to absorb general context-window pressure from ordinary conversational back-and-forth",
      "Rely solely on an API-native compaction feature for every kind of information, including exact numeric facts, to minimize engineering effort",
      "Avoid API-native features entirely, since only application-level code can ever really be trusted",
      "Let the structured object be silently overwritten by whatever compaction produces, so there is only one source of truth",
    ],
    correctIndexes: [0],
    explanation:
      "The well-supported pattern is to keep exact-fact-bearing state in an application-maintained structured object while letting an API-native mechanism like compaction handle general conversational overflow. Relying on compaction alone for exact facts risks the precision loss summarization is prone to; refusing API-native features altogether discards a useful tool for reducing plumbing; and letting compaction overwrite the structured object undermines the entire point of keeping exact facts protected in their own store.",
    eli10:
      "It works best to keep the must-be-exact stuff in your own clearly labeled notes, and let the app's automatic 'shorten the old chat' feature handle the everyday chit-chat — not the other way around, and not by throwing away one approach entirely.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
    type: "SINGLE",
    prompt:
      "A command-line coding assistant mostly gets questions like 'what does this command do' and 'what did I just run,' and users almost never refer back to something from dozens of commands earlier. Which context-management strategy is the best fit for this pattern, and why?",
    options: [
      "Progressive summarization, since the top priority is long-term narrative continuity maintained across the whole session",
      "A sliding window that keeps only the most recent exchanges, since follow-ups mostly depend on recent messages",
      "A structured state object that gets explicitly updated on every single command the user happens to run",
      "Context editing rules that immediately clear out every tool result the instant it is produced",
    ],
    correctIndexes: [1],
    explanation:
      "Sliding windows are a good match precisely when most follow-ups only depend on the last few exchanges, which is the case here — it's simple and cheap and doesn't need to preserve anything from far earlier. Progressive summarization (A) is built for long-term narrative continuity, which this use case doesn't need; a structured state object (C) is meant for tracking specific current values, not general conversational flow; and clearing every tool result instantly (D) would remove information the user might still ask about within the next couple of messages.",
    eli10:
      "If someone only ever asks about what just happened a moment ago, you don't need a whole notebook of everything from before — just remembering the last few things works great and is way less effort.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A team says they've implemented 'progressive summarization,' but their version actually rewrites the entire transcript — including the last two exchanges — into a single compressed summary after every turn. Users often notice the assistant misses details they stated only moments earlier. What's the problem, and what should change?",
    options: [
      "Nothing is wrong — summarizing the full transcript, including the most recent turns, every time is exactly what progressive summarization means",
      "The team should keep recent turns verbatim and only fold older, earlier blocks into the structured summary instead",
      "The team should drop summarization altogether and switch to a sliding window over the last three messages",
      "The team should summarize only the very first message of the conversation and never touch anything after that",
    ],
    correctIndexes: [1],
    explanation:
      "Progressive summarization is meant to replace older blocks with a structured summary while leaving recent turns verbatim — compressing the most recent exchanges defeats the purpose and is exactly why fresh details are getting lost. Option A describes the team's broken implementation, not the correct pattern; a sliding window (C) solves a different problem and would drop long-term narrative continuity entirely; and only ever summarizing the first message (D) doesn't address the recurring buildup of older turns over a long session.",
    eli10:
      "If you rewrite even the last thing someone just said into a short blurry note, you lose the exact detail they just gave you. The fix is to only shrink the OLD stuff and leave the newest few things written out in full.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "An IDE-integrated assistant needs to always know the developer's current formatting preferences — tabs vs. spaces, maximum line length, and preferred language — which occasionally change mid-session. What is the most reliable way to track this?",
    options: [
      "Re-read the entire conversation transcript on every request and infer the current preferences from whatever was said most recently",
      "Maintain a small explicit structured preferences object included in every request and updated only when a preference changes",
      "Summarize the last five messages into a short narrative paragraph and try to infer preferences from that paragraph",
      "Apply a sliding window and assume whichever preferences appear in the most recent ten messages are still current",
    ],
    correctIndexes: [1],
    explanation:
      "An explicit structured object that's included every request and updated precisely when a preference changes is the reliable way to track 'what's currently true,' since it doesn't depend on inference or on the preference having been mentioned recently. Re-inferring from the full transcript (A) or a recent narrative summary (C) risks misreading old versus new statements, and assuming the answer lives somewhere in the last ten messages (D) fails the moment a preference was set earlier and never repeated.",
    eli10:
      "Instead of scrolling back through the whole conversation to guess someone's current settings, just keep one clear little card that says exactly what they want right now, and update that card only when they actually change their mind.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CLAUDE_CODE_CI_CD",
    type: "SINGLE",
    prompt:
      "After a CI pipeline run finishes, a tool call returns a massive payload: full build logs, environment variable dumps, and a timestamped log line for every step. The application keeps only the overall build status and the names of any failing tests in context going forward. What does this practice illustrate?",
    options: [
      "Progressive summarization of the entire conversation history accumulated so far",
      "Tool result compression — extracting only the fields relevant to the ongoing task",
      "A sliding window strategy applied specifically to recent CI pipeline runs",
      "System prompt versioning tracked separately across different CI pipeline configurations",
    ],
    correctIndexes: [1],
    explanation:
      "Pulling out just the build status and failing test names from a huge CI payload, and dropping full logs and environment dumps, is tool result compression — keeping what's relevant to the task and discarding the verbose rest. It isn't progressive summarization since no conversational history is being condensed (A); it isn't a sliding window since nothing is being dropped by message recency (C); and it has nothing to do with system prompt versions (D).",
    eli10:
      "If a build check hands back a giant wall of logs, you don't keep the whole wall — you just note whether it passed and which tests failed, and toss the rest.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "Which of the following correctly matches a kind of information to the context-management strategy best suited for it?",
    options: [
      "Recent conversational flow that follow-ups rarely look further back than a few exchanges suits a sliding window, and current, occasionally-changing user preferences suit an explicit structured state object updated on change",
      "Exact recurring numeric facts that must stay precise suit folding them into a progressive narrative summary",
      "A persistent reference bible of world facts or safety-critical information suits a sliding window over the last few messages",
      "Long-term narrative continuity across a very long session suits deleting all older turns with no replacement",
    ],
    correctIndexes: [0],
    explanation:
      "A sliding window is well suited to conversational flow that only depends on recent exchanges, and an explicit structured state object is the right fit for current preferences that can change over time. Exact numeric facts are precisely what gets blurred by narrative summarization, a persistent reference bible needs its own retained section rather than being subject to recency-based dropping, and long-term continuity calls for progressive summarization, not outright deletion with nothing kept.",
    eli10:
      "Matching the right tool to the right job matters: quick recent chit-chat fits a 'just remember the last few things' approach, and preferences that can change fit a labeled card that gets updated — but exact numbers shouldn't be squeezed into a vague summary, and a book of core facts shouldn't just get forgotten as messages scroll by.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A team is deciding whether to build one comprehensive fact store upfront that tries to anticipate every fact a long-running assistant might ever need, versus fetching specific facts on demand only when a question actually requires them. Which approach is recommended as scaling better?",
    options: [
      "Building one comprehensive fact store upfront that anticipates every possible future need",
      "Fetching facts on demand, retrieving only what's actually needed as questions arise",
      "Folding all anticipated facts into a single narrative summary maintained from the start",
      "Applying a sliding window that keeps only the ten most recently discussed facts",
    ],
    correctIndexes: [1],
    explanation:
      "On-demand retrieval — pulling in exactly the facts a given question requires — scales better than trying to build one exhaustive store covering every conceivable future need, which tends to grow unwieldy and still risks missing something unanticipated. Pre-building a comprehensive store (A) doesn't scale as well; a narrative summary (C) isn't suited to exact facts at all; and a sliding window over facts (D) risks dropping a fact that's needed again after ten other facts have been discussed.",
    eli10:
      "It works better to look up exactly what you need, exactly when you need it, than to try to write down every possible fact you might ever need ahead of time — that second approach gets huge and still misses things.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
    type: "SINGLE",
    prompt:
      "An assistant extracts totals and line items from dozens of uploaded invoices over a long session, and is later asked to recall the exact total from an invoice processed much earlier. Which design best preserves that accuracy?",
    options: [
      "A running narrative summary describing which invoices were discussed so far and roughly what they contained",
      "A small structured fact table mapping invoice number to exact total, referenced directly instead of any summary",
      "A sliding window that keeps only the three most recently processed invoices in context",
      "Context editing rules that automatically clear out invoice details once a new invoice gets uploaded",
    ],
    correctIndexes: [1],
    explanation:
      "A structured fact table is exactly the mechanism for recurring exact figures — looking up 'invoice number -> total' directly avoids the precision loss that comes from compressing it into prose. A narrative summary (A) is interpretive and lossy for exact numbers; a sliding window (C) would drop the very invoice being asked about once three newer ones arrive; and clearing details via context editing (D) would delete the data needed to answer the question at all.",
    eli10:
      "If you need to remember exact totals from lots of receipts, it's better to keep a little table of 'receipt number -> total' than to write a fuzzy paragraph about the receipts, forget older receipts once new ones show up, or throw away each receipt's numbers as soon as the next one arrives.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "During a multi-hour coding session, a developer asks the assistant to revisit and adjust a change that was made to a file roughly two hours and many turns earlier. The session uses progressive summarization. Which underlying design correctly supports the assistant still being able to help with this?",
    options: [
      "The entire session, including even the very last exchange, gets rewritten into one short paragraph after every single turn",
      "The older portion, including that two-hour-old edit, was folded into a structured summary while recent turns stayed verbatim",
      "Only the last ten messages are ever kept in context, and everything before that gets discarded outright",
      "All context older than thirty minutes gets permanently deleted, with absolutely nothing kept in its place afterward",
    ],
    correctIndexes: [1],
    explanation:
      "This is exactly what progressive summarization is for: older material gets condensed into a structured summary — such as a running list of decisions and changed files — while recent turns stay verbatim, so a two-hour-old edit is still represented, just compactly. Rewriting even the most recent exchange into a short paragraph every turn (A) would blur recent precision; discarding everything before the last ten messages (C) is a sliding window and would lose the two-hour-old edit entirely; and deleting everything older than thirty minutes with no replacement (D) would erase it outright rather than compress it.",
    eli10:
      "For a long coding session, it helps to keep a short structured list of 'what changed and why' for the older parts, while still writing out the newest parts in full — that way even something from two hours ago is still remembered, just in a shorter form.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A collaborative fiction app lets a user and the assistant co-write a novel across many months. What matters most to the user is the overall consistency of plot and character arcs, not recalling the exact phrasing of any single sentence from chapters ago. Which strategy is the best primary fit?",
    options: [
      "A sliding window, since only the most recently written chapter should ever really matter to the unfolding story",
      "Progressive summarization, replacing older chapters with a structured summary of characters and plot threads",
      "Tool result compression, since no external tools are ever really involved in a collaborative writing session",
      "Context editing that deletes older chapters outright, leaving absolutely nothing kept in their place afterward",
    ],
    correctIndexes: [1],
    explanation:
      "Long-term narrative continuity across a long-running session is exactly what progressive summarization is designed for — condensing older chapters into a structured summary while keeping the most recent chapters verbatim preserves the arc without keeping everything at full length. A sliding window (A) would lose the overall arc since it only cares about recency; tool result compression (C) doesn't apply since there's no tool payload involved; and deleting older chapters outright (D) would lose the continuity the user actually cares about.",
    eli10:
      "For a long story written over many months, it helps to keep a short 'story so far' style recap of the older chapters — with the important characters and plot points spelled out — while still keeping the newest chapters written out in full.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    type: "SINGLE",
    prompt:
      "A due-diligence assistant reviewing many long documents over one extended session needs three things at once: a general sense of what's been covered so far, the ability to pull exact wording from any document when asked, and reliable recall of a handful of recurring numeric figures. Which design choice best satisfies all of this together?",
    options: [
      "Maintain a running narrative summary for general continuity, retrieve directly from source documents for exact quotes, and maintain a small structured fact table for the recurring numeric figures rather than trusting the narrative summary",
      "Fold the recurring numeric figures into the same narrative summary so there is only one artifact to maintain",
      "Rely on the narrative summary alone for exact quotes as well as general continuity, since it is the single most complete record",
      "Apply a sliding window to the document set, discarding any document older than the last three ever reviewed",
    ],
    correctIndexes: [0],
    explanation:
      "The recommended composition is a narrative summary for interpretive continuity, direct source retrieval for exact claims, and a dedicated structured fact table for recurring numbers. Folding the figures into the summary, or relying on the summary for exact quotes too, reintroduces the precision loss summarization is prone to, and windowing out older documents would remove documents the user might still need to reference.",
    eli10:
      "For a big review job, it helps to keep one big-picture recap for the general story, go back to the original pages whenever you need an exact quote, and keep a separate small list just for the important numbers — squishing everything into one fuzzy recap, or throwing away older documents, loses exactly the stuff you still need.",
    difficulty: "HARD",
  },
];
