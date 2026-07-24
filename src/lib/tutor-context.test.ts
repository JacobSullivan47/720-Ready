import { describe, expect, it, vi } from "vitest";

const findUniqueMock = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: { question: { findUnique: findUniqueMock } },
}));

const { resolveFocusContext } = await import("./tutor-context");

describe("resolveFocusContext", () => {
  it("returns null when focus is undefined", async () => {
    expect(await resolveFocusContext(undefined)).toBeNull();
  });

  it("returns null for a malformed focus with no kind separator", async () => {
    expect(await resolveFocusContext("nonsense")).toBeNull();
  });

  it("returns null for an unrecognized kind", async () => {
    expect(await resolveFocusContext("bogus:AGENTIC_ARCHITECTURE")).toBeNull();
  });

  it("resolves a valid domain key to a context block naming the domain", async () => {
    const result = await resolveFocusContext("domain:AGENTIC_ARCHITECTURE");
    expect(result).toContain("Agentic Architecture");
  });

  it("returns null for an unknown domain key", async () => {
    expect(await resolveFocusContext("domain:NOT_A_REAL_DOMAIN")).toBeNull();
  });

  it("resolves a valid scenario key to a context block naming the scenario", async () => {
    const result = await resolveFocusContext("scenario:CUSTOMER_SUPPORT_AGENT");
    expect(result).toContain("Customer Support Resolution Agent");
  });

  it("returns null for an unknown scenario key", async () => {
    expect(await resolveFocusContext("scenario:NOT_A_REAL_SCENARIO")).toBeNull();
  });

  it("resolves a question id by looking it up, never trusting client-supplied text", async () => {
    findUniqueMock.mockResolvedValueOnce({
      prompt: "What does tool_choice: auto do?",
      options: ["A", "B"],
      explanation: "It lets the model decide whether to use a tool.",
    });
    const result = await resolveFocusContext("question:abc123");
    expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: "abc123" } });
    expect(result).toContain("What does tool_choice: auto do?");
    expect(result).toContain("It lets the model decide whether to use a tool.");
  });

  it("returns null when the question id doesn't exist", async () => {
    findUniqueMock.mockResolvedValueOnce(null);
    expect(await resolveFocusContext("question:does-not-exist")).toBeNull();
  });
});
