import { CATEGORY_EXPLANATIONS } from "./explanations";
import { computeRiskScore } from "./riskScoring";
import { SCAM_RULES, type ScamRule } from "./scamRules";
import type {
  AnalysisResult,
  DetectionCategory,
  DetectionMatch,
} from "./types";

// ── Internal Match (with indices) ───────────────────────────────────

type RawMatch = {
  readonly rule: ScamRule;
  readonly matchedText: string;
  readonly startIndex: number;
  readonly endIndex: number;
};

// ── Get raw regex matches against text ──────────────────────────────

export const getRawMatches = (text: string): RawMatch[] => {
  const matches: RawMatch[] = [];

  for (const rule of SCAM_RULES) {
    // Create new regex with global flag for matchAll
    const regex = new RegExp(rule.regex.source, "gi");

    for (const match of text.matchAll(regex)) {
      if (match.index === undefined || !match[0]) {
        continue;
      }

      matches.push({
        rule,
        matchedText: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  return matches;
};

// ── Deduplicate overlapping matches ─────────────────────────────────
// If two matches overlap, keep the one with higher score/severity.

const deduplicateMatches = (matches: RawMatch[]): RawMatch[] => {
  const sorted = [...matches].sort((a, b) => a.startIndex - b.startIndex);
  const result: RawMatch[] = [];
  let lastEnd = -1;

  for (const match of sorted) {
    if (match.startIndex >= lastEnd) {
      result.push(match);
      lastEnd = match.endIndex;
    } else {
      // Overlapping — keep higher-score match
      const prev = result[result.length - 1];
      if (prev && match.rule.baseScore > prev.rule.baseScore) {
        result[result.length - 1] = match;
        lastEnd = match.endIndex;
      }
    }
  }

  return result;
};

// ── Build DetectionMatch array from raw matches ─────────────────────

const buildDetectionMatches = (rawMatches: RawMatch[]): DetectionMatch[] => {
  let idCounter = 0;

  return rawMatches.map((raw) => {
    const info = CATEGORY_EXPLANATIONS[raw.rule.category];
    idCounter++;

    return {
      id: `${raw.rule.id}-${idCounter}`,
      category: raw.rule.category,
      severity: raw.rule.severity,
      matchedText: raw.matchedText,
      startIndex: raw.startIndex,
      endIndex: raw.endIndex,
      explanation: info.explanation,
      tip: info.tip,
      score: raw.rule.baseScore,
    };
  });
};

// ── Build summary text ──────────────────────────────────────────────

const buildSummary = (
  riskLevel: string,
  categories: DetectionCategory[],
  totalSignals: number,
): string => {
  if (totalSignals === 0) {
    return "No scam-like signals detected. This text appears safe based on known patterns.";
  }

  const categoryList = categories.slice(0, 3).join(", ");

  if (riskLevel === "high") {
    return `High risk detected with ${totalSignals} scam signal${totalSignals > 1 ? "s" : ""}. Categories: ${categoryList}. Exercise extreme caution.`;
  }

  if (riskLevel === "medium") {
    return `Medium risk detected with ${totalSignals} signal${totalSignals > 1 ? "s" : ""}. Categories: ${categoryList}. Review carefully before proceeding.`;
  }

  return `Low risk. ${totalSignals} minor signal${totalSignals > 1 ? "s" : ""} detected. Likely safe, but stay alert.`;
};

// ── Main Analysis Function ──────────────────────────────────────────

export const createAnalysisResult = (matches: DetectionMatch[]): AnalysisResult => {
  // Extract unique categories preserving detection order
  const categorySet = new Set<DetectionCategory>();
  const categories: DetectionCategory[] = [];
  for (const match of matches) {
    if (!categorySet.has(match.category)) {
      categorySet.add(match.category);
      categories.push(match.category);
    }
  }

  const { riskScore, riskLevel } = computeRiskScore(matches);
  const summary = buildSummary(riskLevel, categories, matches.length);

  return {
    riskLevel,
    riskScore,
    totalSignals: matches.length,
    categories,
    matches,
    summary,
  };
};

export const getDetectionMatches = (text: string): DetectionMatch[] => {
  const rawMatches = getRawMatches(text);
  const deduplicated = deduplicateMatches(rawMatches);
  return buildDetectionMatches(deduplicated);
};

export const analyzeMessage = (text: string): AnalysisResult => {
  if (!text || !text.trim()) {
    return {
      riskLevel: "low",
      riskScore: 0,
      totalSignals: 0,
      categories: [],
      matches: [],
      summary: "No text provided for analysis.",
    };
  }

  const rawMatches = getRawMatches(text);
  const deduplicated = deduplicateMatches(rawMatches);
  const matches = buildDetectionMatches(deduplicated);

  return createAnalysisResult(matches);
};

// ── Convenience: get signal matches with positions (for highlighter) ─

export type SignalMatch = {
  readonly start: number;
  readonly end: number;
  readonly phrase: string;
  readonly category: DetectionCategory;
  readonly severity: "low" | "medium" | "high";
  readonly explanation: string;
  readonly tip: string;
};

export const getSignalMatches = (text: string): SignalMatch[] => {
  const rawMatches = getRawMatches(text);
  const deduplicated = deduplicateMatches(rawMatches);

  return deduplicated.map((raw) => {
    const info = CATEGORY_EXPLANATIONS[raw.rule.category];
    return {
      start: raw.startIndex,
      end: raw.endIndex,
      phrase: raw.matchedText,
      category: raw.rule.category,
      severity: raw.rule.severity,
      explanation: info.explanation,
      tip: info.tip,
    };
  });
};
