export const MessageType = {
  GET_SELECTED_TEXT: "trustlens/get-selection",
  ANALYZE_SELECTED_TEXT: "trustlens/analyze-selection",
  SCAN_PAGE: "trustlens/scan-page",
  CLEAR_HIGHLIGHTS: "trustlens/clear-highlights",
  TOGGLE_AUTO_HIGHLIGHT: "trustlens/toggle-auto-highlight",
  GET_LAST_ANALYSIS: "trustlens/get-last-analysis",
  PAGE_ANALYSIS: "trustlens/page-analysis",
  GET_PAGE_ANALYSIS: "trustlens/get-page-analysis",
  OPEN_FULL_ANALYSIS: "trustlens/open-full-analysis",
  OPEN_POPUP: "trustlens/open-popup",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];
