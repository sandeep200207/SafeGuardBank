export type RiskTier = "safe" | "caution" | "high" | "blocked";

export type RiskInput = {
  isFlaggedPayee?: boolean;
  isNewPayee?: boolean;
  amount: number;
  averageTransfer: number;
  balance: number;
  hour: number;
  note?: string;
  transfersLastHour?: number;
  transfersFrozen?: boolean;
  scamCheckAnswers?: { called?: boolean; secret?: boolean; urgent?: boolean };
};

export type RiskResult = { score: number; tier: RiskTier; reasons: string[] };

const scamKeywords = ["urgent", "penalty", "tax", "arrest", "prize", "lottery", "verify", "otp", "refund", "gift card", "crypto", "blocked account", "immediately", "secret"];

export function scoreRisk(input: RiskInput): RiskResult {
  let score = 0;
  const reasons: string[] = [];
  const note = (input.note ?? "").toLowerCase();
  if (input.isFlaggedPayee) {
    score += 100;
    reasons.push("This account has been reported for scams by other customers.");
  }
  if (input.transfersFrozen) {
    score += 100;
    reasons.push("You told us someone was pressuring you. Payments are paused for your safety.");
  }
  if (input.isNewPayee) {
    score += 25;
    reasons.push("You've never sent money to this person before.");
  }
  if (input.averageTransfer > 0 && input.amount > input.averageTransfer * 3) {
    score += 20;
    reasons.push("This is much larger than what you usually send.");
  }
  if (input.balance > 0 && input.amount > input.balance * 0.5) {
    score += 15;
    reasons.push("This is more than half of your savings.");
  }
  if (input.hour >= 22 || input.hour < 6) {
    score += 10;
    reasons.push("It's late at night — scammers often pressure people at this time.");
  }
  if (scamKeywords.some(keyword => note.includes(keyword))) {
    score += 20;
    reasons.push("The payment note contains words scammers often use.");
  }
  if ((input.transfersLastHour ?? 0) >= 3) {
    score += 15;
    reasons.push("You've sent several payments in a short time.");
  }
  if (input.scamCheckAnswers?.called) {
    score += 25;
    reasons.push("Real banks and government offices never call and demand payment.");
  }
  if (input.scamCheckAnswers?.secret) {
    score += 25;
    reasons.push("Being asked to keep a payment secret is a major warning sign.");
  }
  if (input.scamCheckAnswers?.urgent) {
    score += 15;
    reasons.push("Pressure to act quickly is how scammers stop you from thinking.");
  }
  const finalScore = Math.min(100, score);
  const tier: RiskTier = finalScore >= 90 ? "blocked" : finalScore >= 65 ? "high" : finalScore >= 40 ? "caution" : "safe";
  return { score: finalScore, tier, reasons };
}

export type ScanResult = { verdict: "safe" | "suspicious" | "dangerous"; flaggedPhrases: string[] };

const scanPatterns = [
  "your account will be blocked",
  "verify your",
  "click here",
  "otp",
  "pin",
  "urgent",
  "prize",
  "lottery",
  "keep this secret",
  "immediately",
  "bit.ly/",
  "tinyurl.com/",
];

export function scanMessage(input: string): ScanResult {
  const normalized = input.toLowerCase();
  const flaggedPhrases = scanPatterns.filter(pattern => normalized.includes(pattern));
  const hasPrivateInfoRequest = /\b(otp|pin|password)\b/i.test(input);
  const hasUrgency = /urgent|immediately|blocked|act now/i.test(input);
  const verdict = flaggedPhrases.length >= 2 || (hasPrivateInfoRequest && hasUrgency) ? "dangerous" : flaggedPhrases.length === 1 ? "suspicious" : "safe";
  return { verdict, flaggedPhrases };
}
