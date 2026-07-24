import type { FlashcardSeed } from "../types";

export const flashcards: FlashcardSeed[] = [
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Capacity vs. attention",
    definition:
      "Having room left in the context window is not the same as the model weighing every part of that window equally. Content placed far earlier in a long transcript can receive less effective attention than recent content, even when total token usage is nowhere near the limit.",
    example:
      "A 40-turn planning conversation still has thousands of tokens of headroom, yet the assistant stops honoring a constraint the user stated in turn 3 because later turns have crowded it out of focus.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Sliding window",
    definition:
      "A context-management approach that retains only the most recent N messages of a conversation and discards older ones, keeping the request small and cheap while assuming recent turns are what future turns will reference.",
    example:
      "A chat widget only forwards the last 8 messages to the model on each turn, discarding anything earlier regardless of what it contained.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Sliding window failure mode",
    definition:
      "A sliding window breaks down when a user later refers back to a decision, number, or detail that has already scrolled out of the retained window, since that information is simply gone from what the model sees.",
    example:
      "A user agrees to a specific delivery date 15 messages ago; once the window has moved past that turn, the assistant can no longer confirm or reference that date if asked about it directly.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    term: "Windowing retrieved results",
    definition:
      "In retrieval-heavy workflows, applying a sliding window specifically to retrieved passages — keeping only the last few retrieval batches instead of every retrieval made so far — prevents the context from filling with old, possibly superseded search results.",
    example:
      "A research agent that has issued a dozen searches over a long session keeps only the two most recent sets of retrieved passages in context, letting earlier ones drop even though the conversation itself continues.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Progressive summarization",
    definition:
      "A strategy where older stretches of conversation are periodically replaced with a compact summary while newer turns remain in full, so long-running continuity is preserved without keeping every message verbatim forever.",
    example:
      "After 30 turns, the first 20 are collapsed into a short summary block, while the most recent 10 turns stay word-for-word in the request sent to the model.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Structured vs. narrative summary",
    definition:
      "A vague, prose-style summary tends to blur specifics away, while a summary organized into explicit labeled sections (such as decisions made, current preferences, open questions, and important facts) preserves far more precision for later use.",
    example:
      "Instead of writing 'the user discussed some travel preferences,' a structured summary lists 'Preferences: aisle seat, non-stop only, budget under $900' as a distinct field.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Hybrid retention window",
    definition:
      "The combination of summarizing older conversation blocks while keeping the most recent turns completely verbatim, rather than choosing an all-or-nothing extreme of summarizing everything or retaining everything forever.",
    example:
      "A long-lived planning assistant keeps the last 6 exchanges word-for-word and folds everything before that into a running structured summary that gets updated as the conversation continues.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Structured state object",
    definition:
      "An explicit, machine-readable object (such as a small JSON-like structure) representing what is currently true — for example a set of active preferences — that is included in every request and updated whenever something changes, rather than being re-inferred from scratch each turn.",
    example:
      "A shopping assistant maintains {\"budget\": 1500, \"style\": \"minimalist\", \"mustHave\": [\"standing desk\"]} and updates the relevant field the moment the user changes their mind about budget.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "Surfacing contradictions",
    definition:
      "When a newly stated preference genuinely conflicts with an earlier one held in a structured state object, the correct behavior is to flag the contradiction to the user rather than silently overwriting the old value and picking a winner on the model's own judgment.",
    example:
      "A user who earlier insisted on a pet-friendly rental later asks for a strict no-pets building; the assistant points out the conflict instead of quietly assuming the newer request wins.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "Independent multi-issue tracking",
    definition:
      "When a single conversation covers several distinct matters at once, each with its own identifier and status, each one should be tracked as a separate record rather than trusting the linear order of the chat to keep them straight.",
    example:
      "An agent handling three separate ticket numbers in one thread keeps a small table of ticket ID, amount, and resolution state per ticket instead of relying on 'the last thing mentioned' to know which ticket is being discussed.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Tool result compression",
    definition:
      "After a tool call returns a large payload, extracting only the fields actually needed for the ongoing task and discarding internal fields, redundant metadata, or unrelated history keeps the context lean around tool usage specifically.",
    example:
      "After looking up a shipment, the app keeps only carrier, tracking number, and estimated delivery date in context, dropping the dozens of internal routing-event fields the API also returned.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Retrieval over summarization for exact facts",
    definition:
      "Because summarization is inherently lossy and interpretive, exact facts and numbers are better served by fetching them from a source or structured store on demand than by trusting a compressed prose summary to have preserved them precisely.",
    example:
      "Rather than trusting a chat summary's paraphrase of a contract clause, the assistant re-opens the original document to quote the exact wording before making a claim about it.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "On-demand fact retrieval vs. one giant fact store",
    definition:
      "Retrieving relevant facts only when they are needed tends to scale better than trying to build and maintain a single comprehensive fact store that anticipates everything that might ever come up.",
    example:
      "A support tool looks up a customer's current plan tier only when a plan-related question arises, rather than pre-loading every possible account attribute into context at the start of every chat.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Persistent reference section",
    definition:
      "Compact, rarely-changing information that must not be lost or reworded — such as world-building facts, defined terminology, safety-critical details, or an active configuration value — is best kept as a small retained reference block rather than left to be re-derived or accidentally compressed away during summarization.",
    example:
      "A novel-writing assistant keeps a short 'Cast & World Facts' block (character ages, key locations, established rules of the setting) that is never folded into the rolling conversation summary.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Compaction (API-native)",
    definition:
      "A server-side context-management mechanism that condenses earlier conversation history into a compact summary block automatically as a session nears its context-window limit, reducing how much manual summarization logic the application must build.",
    example:
      "A long support session approaching its context limit has its earliest portion folded into a summary by the platform itself, without the application writing any custom summarization code.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Context editing (API-native)",
    definition:
      "A server-side mechanism that removes stale content — such as old tool results or superseded reasoning blocks — according to configurable rules, rather than compressing that content into a summary the way compaction does.",
    example:
      "A long agentic session has its earliest raw tool outputs dropped outright once newer, more relevant tool results are available, rather than those old outputs being summarized in place.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Compaction vs. context editing",
    definition:
      "Compaction preserves a condensed version of removed content through summarization, while context editing simply clears qualifying content away under a rule set; choosing between them depends on whether the discarded material's gist is still worth keeping in some form.",
    example:
      "A team wants old assistant reasoning purged entirely once a decision is finalized (context editing) but wants old user discussion preserved in gist form for later reference (compaction).",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Application-level vs. API-native management",
    definition:
      "Application-maintained mechanisms, like a hand-built structured state object, give a developer more control, portability across providers, and exact-fact fidelity, while API-native mechanisms cut down on custom plumbing but behave more like a black box.",
    example:
      "A team builds its own structured preference object so it stays identical if they ever migrate providers, while leaning on a platform's automatic summarization feature for handling generic conversational overflow.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Composing both context strategies",
    definition:
      "A robust design often pairs an application-maintained structured object for facts that must remain exact with an API-native mechanism like compaction to absorb general context-window pressure, rather than relying on only one approach.",
    example:
      "A booking assistant keeps its own structured object for the confirmed itinerary details while letting the platform's compaction feature handle the surrounding small talk and exploratory back-and-forth.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Context limit as a trigger, not an error",
    definition:
      "Reaching the context window's limit is a signal that compaction, trimming, or summarization should occur — it should not be treated like a transient failure that can be resolved by simply resending the same request.",
    example:
      "When a request fails because the transcript exceeds the window, the application triggers its summarization routine before retrying, instead of blindly resubmitting the identical oversized request.",
    difficulty: "EASY",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "Stale tool data on return",
    definition:
      "When a user resumes a conversation after time has passed, any tool results fetched earlier may no longer reflect reality, so the application should re-fetch current state before making new claims rather than assuming old results still hold.",
    example:
      "A user returns two days later asking about their refund; the assistant re-queries the payment status instead of repeating what an order lookup said at the start of the earlier session.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "Targeted refresh over full re-fetch",
    definition:
      "Rather than blindly re-calling every tool used earlier in a conversation, the more efficient and correct move is a targeted refresh of only the specific pieces of state that are actually likely to have gone stale.",
    example:
      "On a returning session, the assistant re-checks only the shipment's current status field instead of re-running the customer lookup, the loyalty-tier check, and the address lookup all over again.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
    term: "Injecting external updates",
    definition:
      "When something changes outside the conversation while it is ongoing, the model only becomes aware of it if the application explicitly includes the fresh state in the next request; the model has no independent way to detect outside events.",
    example:
      "A webhook reports that an order has shipped mid-conversation, so the application prepends the updated shipping status to the next request sent to the model before it replies again.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    term: "Authoritative current state",
    definition:
      "A safe general pattern is to make the freshest known state clearly outrank any older tool results already sitting in the transcript, so the model does not accidentally treat stale information as current just because it appeared earlier.",
    example:
      "A billing assistant's prompt frames the newly injected account-status block as the definitive current truth, explicitly superseding an earlier tool result from twenty turns back.",
    difficulty: "HARD",
  },
  {
    domainKey: "CONTEXT_MANAGEMENT",
    scenarioKey: "MULTI_AGENT_RESEARCH",
    term: "System prompt versioning",
    definition:
      "Because a system prompt may change over the lifetime of a long-running product, it helps to version system prompts and keep each ongoing conversation tied to the version it started under, migrating older conversations deliberately rather than swapping personas mid-session.",
    example:
      "A research assistant that shipped a new tone-of-voice policy keeps existing multi-day research threads on the prior system prompt version until they naturally conclude, instead of applying the new policy retroactively mid-thread.",
    difficulty: "MEDIUM",
  },
];
