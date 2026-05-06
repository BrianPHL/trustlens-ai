// ── Risk & Detection Types ──────────────────────────────────────────

export type RiskLevel = "low" | "medium" | "high";

export type DetectionCategory =
  | "Urgency Manipulation"
  | "Suspicious Link"
  | "Sensitive Information Request"
  | "Account Threat"
  | "Impersonation Cue"
  | "Isolation Tactic"
  | "Payment Pressure"
  | "Prize/Reward Bait";

export type DetectionSeverity = "low" | "medium" | "high";

export type DetectionMatch = {
  readonly id: string;
  readonly category: DetectionCategory;
  readonly severity: DetectionSeverity;
  readonly matchedText: string;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly explanation: string;
  readonly tip: string;
  readonly score: number;
};

export type AnalysisResult = {
  readonly riskLevel: RiskLevel;
  readonly riskScore: number;
  readonly totalSignals: number;
  readonly categories: DetectionCategory[];
  readonly matches: DetectionMatch[];
  readonly summary: string;
};

// ── Extension Messages ──────────────────────────────────────────────

export type ExtensionMessage =
  | { type: "GET_SELECTED_TEXT" }
  | { type: "ANALYZE_SELECTED_TEXT"; text: string }
  | { type: "SCAN_PAGE" }
  | { type: "CLEAR_HIGHLIGHTS" }
  | { type: "TOGGLE_AUTO_HIGHLIGHT"; enabled: boolean }
  | { type: "GET_LAST_ANALYSIS" }
  | { type: "GET_PAGE_ANALYSIS" }
  | { type: "PAGE_ANALYSIS"; payload: PageAnalysisPayload }
  | { type: "OPEN_FULL_ANALYSIS"; payload: { text: string } }
  | { type: "OPEN_POPUP" };

export type PageAnalysisPayload = AnalysisResult & {
  readonly sourceText: string;
  readonly highlightEnabled: boolean;
  readonly updatedAt: number;
};
