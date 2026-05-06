import type { DetectionCategory, DetectionMatch, RiskLevel } from "./types";

// ── Base Category Scores ────────────────────────────────────────────

const CATEGORY_BASE_SCORES: Record<DetectionCategory, number> = {
  "Suspicious Link": 25,
  "Sensitive Information Request": 30,
  "Account Threat": 20,
  "Urgency Manipulation": 15,
  "Impersonation Cue": 15,
  "Isolation Tactic": 20,
  "Payment Pressure": 20,
  "Prize/Reward Bait": 15,
};

// ── Combo Bonus Rules ───────────────────────────────────────────────

type ComboRule = {
  readonly categories: [DetectionCategory, DetectionCategory];
  readonly bonus: number;
};

const COMBO_RULES: readonly ComboRule[] = [
  { categories: ["Urgency Manipulation", "Suspicious Link"], bonus: 15 },
  { categories: ["Account Threat", "Suspicious Link"], bonus: 20 },
  { categories: ["Sensitive Information Request", "Suspicious Link"], bonus: 20 },
  { categories: ["Sensitive Information Request", "Urgency Manipulation"], bonus: 15 },
  { categories: ["Prize/Reward Bait", "Payment Pressure"], bonus: 20 },
  { categories: ["Impersonation Cue", "Sensitive Information Request"], bonus: 20 },
];

// ── Risk Level Thresholds ───────────────────────────────────────────

const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 65) return "high";
  if (score >= 30) return "medium";
  return "low";
};

// ── Scoring Function ────────────────────────────────────────────────

export const computeRiskScore = (
  matches: DetectionMatch[],
): { riskScore: number; riskLevel: RiskLevel } => {
  if (matches.length === 0) {
    return { riskScore: 0, riskLevel: "low" };
  }

  // Sum unique category base scores (don't double-count same category)
  const detectedCategories = new Set<DetectionCategory>();
  for (const match of matches) {
    detectedCategories.add(match.category);
  }

  let score = 0;

  // Add base score per unique detected category
  for (const category of detectedCategories) {
    score += CATEGORY_BASE_SCORES[category];
  }

  // Apply combo bonuses
  for (const combo of COMBO_RULES) {
    if (
      detectedCategories.has(combo.categories[0]) &&
      detectedCategories.has(combo.categories[1])
    ) {
      score += combo.bonus;
    }
  }

  // Cap at 100
  const riskScore = Math.min(100, score);

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
  };
};
