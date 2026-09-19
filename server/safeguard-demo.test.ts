import { describe, expect, it } from "vitest";
import { scanMessage, scoreRisk } from "../shared/safeguard";

describe("SafeGuard risk engine", () => {
  it("raises a new-payee urgent late-night payment to high risk", () => {
    const result = scoreRisk({
      isNewPayee: true,
      amount: 45000,
      averageTransfer: 2200,
      balance: 100000,
      hour: 23,
      note: "urgent penalty fee",
    });
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.tier).toBe("high");
    expect(result.reasons).toHaveLength(4);
  });

  it("blocks when coercion signals are added to a risky payment", () => {
    const result = scoreRisk({
      isNewPayee: true,
      amount: 45000,
      averageTransfer: 2200,
      balance: 100000,
      hour: 23,
      note: "urgent penalty fee",
      scamCheckAnswers: { called: true, secret: true },
    });
    expect(result.score).toBe(100);
    expect(result.tier).toBe("blocked");
    expect(result.reasons).toContain("Being asked to keep a payment secret is a major warning sign.");
  });

  it("auto-blocks a flagged payee or a frozen account", () => {
    expect(scoreRisk({ isFlaggedPayee: true, amount: 100, averageTransfer: 500, balance: 10000 }).tier).toBe("blocked");
    expect(scoreRisk({ transfersFrozen: true, amount: 100, averageTransfer: 500, balance: 10000 }).tier).toBe("blocked");
  });
});

describe("SafeGuard message scanner", () => {
  it("finds urgency, blocked-account, OTP, and shortened-link patterns", () => {
    const result = scanMessage("URGENT: your account will be blocked. Click here and share your OTP at bit.ly/verify.");
    expect(result.verdict).toBe("dangerous");
    expect(result.flaggedPhrases).toEqual(expect.arrayContaining(["urgent", "your account will be blocked", "click here", "otp", "bit.ly/"]));
  });

  it("returns safe for an ordinary personal message", () => {
    expect(scanMessage("Dinner is ready. Please call me when you get home.").verdict).toBe("safe");
  });
});
