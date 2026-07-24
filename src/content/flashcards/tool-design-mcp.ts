import type { FlashcardSeed } from "../types";

export const flashcards: FlashcardSeed[] = [
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "User-defined (client-side) tool",
    definition:
      "A tool whose schema and execution logic both live inside the calling application. Claude only ever sees the name, description, and input schema — your own code decides how the call is actually carried out, so you own sandboxing and safety.",
    example:
      "A retail app defines a get_order_status tool backed by its own order database; Claude requests it, and the app's server code runs the lookup.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Anthropic-defined client-side tool",
    definition:
      "A tool whose schema is predefined by Anthropic (such as a bash shell, text editor, computer-use pointer/keyboard, or memory tool) but whose execution still happens inside the calling application's own environment.",
    example:
      "An agent using the bash tool gets a ready-made schema from Anthropic, but the host application is the one that actually spawns the shell process and returns its output.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Server-side tool",
    definition:
      "A tool that Anthropic's own platform executes directly, without the calling application intercepting each call. Web search, web fetch, and code execution are examples where the request-response cycle happens off in Anthropic's infrastructure.",
    example:
      "A developer enables a hosted web-search capability; the application never sees the raw search request, only the final result Claude incorporates.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "MCP tool trust model",
    definition:
      "Tools exposed through the Model Context Protocol run on a separate MCP server, so how much you should trust their behavior depends entirely on who operates that server, not on anything the client or Claude can verify structurally.",
    example:
      "A team happily uses an in-house MCP server for internal ticketing but requires extra review before connecting to a community-maintained MCP server for a third-party SaaS product.",
    difficulty: "MEDIUM",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Elements of a good tool description",
    definition:
      "A strong tool description states what the tool does, when to use it, when not to use it, the required input formats, what the output contains, and any limitations or safety concerns — ideally with examples for tricky input shapes.",
    example:
      "A refund_order description clarifies it only applies to orders shipped within 30 days and shows a sample order_id format, rather than just saying 'refunds an order'.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Format hints belong in the schema, not just the name",
    definition:
      "A common mistake is relying on a parameter's name alone (like start_date_yyyymmdd) to communicate its expected format. The format, including examples, should instead be spelled out in the schema description where the model reliably reads it.",
    example:
      "Instead of trusting a field named amount_usd_cents to convey its unit on its own, the description explicitly states the value is an integer number of cents and gives a sample.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Lookup-then-act pattern",
    definition:
      "For ambiguous entity references, give the model a search/resolve tool that returns a stable identifier first, then have a separate action tool operate only on that identifier, rather than accepting free-text names directly into the action tool.",
    example:
      "Instead of passing a typed customer name straight into cancel_subscription, the model first calls find_customer('the Martinez account') to get a customer_id, then passes that ID to cancel_subscription.",
    difficulty: "MEDIUM",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Domain-matched parameters",
    definition:
      "Tool parameters should mirror the real shape of the underlying domain, using structured fields, enums, and typed identifiers instead of collapsing everything into generic free-text strings, which reduces ambiguity and parsing errors.",
    example:
      "A shipping tool takes a carrier enum of {\"ground\", \"air\", \"freight\"} rather than a raw shipping_method string the model could fill with any wording.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Splitting interdependent tools",
    definition:
      "When a tool's parameters have constraints that depend on each other, so some fields only make sense for certain values of another field, it is usually better to split it into several narrower tools than to keep one tool with many conditional branches.",
    example:
      "Rather than one manage_order tool with a mode flag switching between refund, cancel, and replace behavior, expose separate issue_store_credit, cancel_subscription, and replace_damaged_item tools.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Stable identifiers over derived values",
    definition:
      "Tool inputs and outputs should favor identifiers that stay valid over time, like a record ID, rather than values computed or derived at one point in time, which can drift out of date or be recalculated inconsistently between calls.",
    example:
      "A tool returns a warehouse_id for a shipment instead of a computed estimated_distance_miles value that a later call would have to trust blindly.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Distinguishing empty results from errors",
    definition:
      "A tool's output should make a genuinely successful call that found nothing clearly distinct from a failed call, typically through separate status fields, so that an empty array never has to double as both meanings at once.",
    example:
      "A search_tickets tool returns {\"results\": [], \"status\": \"ok\"} when nothing matches, versus {\"results\": null, \"status\": \"error\", \"message\": \"...\"} when the backend call itself failed.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Pagination in tool outputs",
    definition:
      "For paginated backend APIs, a tool should return the first page of results together with a total count (or estimate) and a continuation token, rather than looping internally to fetch and dump every page into the model's context.",
    example:
      "A list_invoices tool returns 25 invoices, a total_count of 412, and a next_cursor value the model can pass back in a follow-up call if it needs more.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Tool composition — when to combine",
    definition:
      "Steps are good candidates for folding into a single tool when they are mechanical and require no judgment, when they are latency-heavy and always performed together, or when they are atomic and partial completion would leave things inconsistent.",
    example:
      "A book_flight tool internally reserves the seat and charges the card in one call, since letting either step fail alone would leave a customer half-booked.",
    difficulty: "HARD",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Tool composition — when to keep separate",
    definition:
      "Steps that involve selection, judgment, or an editorial choice should remain distinct tools or decision points, so the model, and ideally the user, gets a chance to weigh in before the next step happens.",
    example:
      "A research assistant keeps 'draft an outline' and 'publish the outline as a report' as two separate tool calls instead of one, since publishing deserves a deliberate check.",
    difficulty: "MEDIUM",
    scenarioKey: "MULTI_AGENT_RESEARCH",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Progressive tool availability",
    definition:
      "Rather than exposing a huge, ever-growing tool library all at once, start with a small discovery tool set that returns a ranked shortlist of candidates, then reveal the specific matching tool for later turns based on what was selected.",
    example:
      "An agent first calls find_relevant_operations('reset a customer password') and gets three ranked matches with names and confidence scores, then only the chosen tool is added to the active tool list next turn.",
    difficulty: "HARD",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Confidence and review flags in output",
    definition:
      "A tool can report both a computed value and a derived signal like requires_review with supporting reasons, letting downstream logic route uncertain results to a human rather than treating every output as equally trustworthy.",
    example:
      "An invoice-parsing tool returns {\"value\": 1280.50, \"confidence\": 0.62, \"requires_review\": true, \"review_reasons\": [\"amount_below_confidence_threshold\"]}.",
    difficulty: "MEDIUM",
    scenarioKey: "STRUCTURED_DATA_EXTRACTION",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Preview-then-confirm pattern",
    definition:
      "For destructive or irreversible actions, avoid a single tool with a boolean like dry_run that a model could simply flip. Instead, use a preview tool returning a redacted summary and a short-lived confirmation token, plus a separate execute tool that consumes that exact token and only proceeds after showing cost, target, schedule, and irreversible effects to a real human.",
    example:
      "preview_delete_workspace() returns a summary of what will be lost and a token; execute_delete_workspace(confirmation_token) is the only call that can actually delete, and only after a person has seen the preview and approved.",
    difficulty: "HARD",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Transient vs. permanent tool errors",
    definition:
      "Transient infrastructure failures, like timeouts, 503s, or connection resets, should be retried inside the tool itself with backoff; permanent validation errors, like a bad date format or invalid enum, should be returned to the model as structured detail so it can correct its own call.",
    example:
      "A weather tool silently retries twice after a gateway timeout before answering, but immediately returns a structured error when given a zip code that isn't five digits.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Business-rule and permission errors",
    definition:
      "Business-rule violations, like not being eligible or a duplicate request, and permission errors are both non-retryable, but need different handling: business-rule errors need a clear explanation for the user, while permission errors need an escalation or re-authorization path.",
    example:
      "A refund tool tells the user their order fell outside the return window (business rule) versus telling them the agent's key lacks refund scope and needs an admin to grant it (permission error).",
    difficulty: "MEDIUM",
    scenarioKey: "CUSTOMER_SUPPORT_AGENT",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Handling an uncertain write",
    definition:
      "When a write action's outcome is unknown, such as a payment call that times out after submission, it must be surfaced as uncertain rather than blindly retried, since retrying could duplicate the side effect. The safe path is a separate status lookup or asking the user, never an automatic 'safe to retry' assumption.",
    example:
      "A charge_card call times out after the request was sent; instead of resubmitting, the agent calls a get_payment_status lookup to confirm whether the charge actually went through.",
    difficulty: "HARD",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "Structured error result shape",
    definition:
      "Application-level failures should come back as normal tool results rather than uncaught exceptions, typically with fields like success, error_category, retryable, the offending field, a message, and a suggested repair for the model to act on.",
    example:
      "{\"success\": false, \"error_category\": \"validation\", \"retryable\": false, \"field\": \"start_date\", \"message\": \"start_date must be before end_date\", \"user_repair\": \"swap the two dates\"}.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "MCP protocol-level error vs. tool-execution error",
    definition:
      "MCP distinguishes protocol-level errors, such as an unknown tool name or malformed request, from tool-execution errors, which are reported inside a normal tool result with an isError-style flag even though the call itself was well-formed and reached real backend logic.",
    example:
      "Calling a tool that doesn't exist on the server raises a protocol-level error, while calling a real tool that then hits a remote 404 for a missing record returns a tool result flagged as an execution error.",
    difficulty: "HARD",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "MCP building blocks: Tools, Resources, Prompts",
    definition:
      "MCP defines three building blocks: Tools are model-controlled actions like search or update; Resources are application-controlled passive reference material like schemas or catalogs the agent might consult before acting; Prompts are user- or application-controlled reusable templates or workflows.",
    example:
      "A server exposes a create_ticket Tool for the model to call, a product-catalog document as a Resource to read first, and a 'weekly status report' Prompt a user explicitly selects.",
    difficulty: "EASY",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "MCP tool annotations",
    definition:
      "Annotations like readOnlyHint, destructiveHint, idempotentHint, and openWorldHint are metadata a server attaches to describe a tool's expected behavior. Because a malicious or buggy server could mislabel a destructive tool as read-only, these are useful hints for a client's UI, never a security boundary the protocol enforces.",
    example:
      "A host application still requires explicit user confirmation before running an MCP tool that touches production data, even though the server's own annotation claims the tool is read-only.",
    difficulty: "MEDIUM",
  },
  {
    domainKey: "TOOL_DESIGN_MCP",
    term: "MCP scope precedence in Claude Code",
    definition:
      "MCP servers can be configured at project scope (a shared .mcp.json checked into the repo), local scope (a per-user, per-project entry, good for sensitive credentials), or user scope (per-user, across all their projects). When the same server name exists at multiple scopes, local wins over project, which wins over user, and the winning definition is used entirely rather than merged field-by-field.",
    example:
      "A server named 'docs' defined at both project and local scope resolves entirely to the local-scope definition; none of the project-scope fields get blended in.",
    difficulty: "MEDIUM",
    scenarioKey: "DEVELOPER_PRODUCTIVITY_TOOLS",
  },
];
