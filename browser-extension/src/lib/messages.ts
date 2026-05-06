export const MessageType = {
  PAGE_ANALYSIS: "trustlens/page-analysis",
  GET_PAGE_ANALYSIS: "trustlens/get-page-analysis",
  OPEN_FULL_ANALYSIS: "trustlens/open-full-analysis",
  OPEN_POPUP: "trustlens/open-popup",
  GET_SELECTION: "trustlens/get-selection",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export type PageAnalysis = {
  readonly riskLevel: "low" | "medium" | "high";
  readonly riskScore: number;
  readonly signals: ReadonlyArray<{
    readonly id: string;
    readonly category: string;
    readonly label: string;
    readonly phrase: string;
    readonly severity: "low" | "medium" | "high";
    readonly explanation: string;
  }>;
  readonly totalMatches: number;
  readonly sourceText: string;
  readonly highlightEnabled: boolean;
  readonly updatedAt: number;
};
