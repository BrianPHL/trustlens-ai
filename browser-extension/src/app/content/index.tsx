import { browser } from "wxt/browser";
import { defineContentScript } from "#imports";
import { analyzeMessage, getSignalMatches } from "~/lib/analyzeMessage";
import { MessageType } from "~/lib/messages";
import { StorageKey, getStorage } from "~/lib/storage";
import type { AnalysisResult } from "~/lib/types";

// ── Constants ───────────────────────────────────────────────────────

const STYLE_ID = "trustlens-style";
const TOOLTIP_ID = "trustlens-tooltip";
const BADGE_ID = "trustlens-badge";
const ROOT_ATTR = "data-trustlens-root";
const HIGHLIGHT_ATTR = "data-trustlens-highlight";
const MAX_TEXT_LENGTH = 8000;
const SCAN_DEBOUNCE_MS = 1500;
const MIN_SCAN_TEXT_LENGTH = 20;

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION",
  "CODE",
  "PRE",
  "SVG",
  "CANVAS",
  "IFRAME",
]);

// ── State ───────────────────────────────────────────────────────────

let autoHighlightEnabled = false;
let scanTimeout: number | null = null;
let isScanning = false;
let tooltipElement: HTMLDivElement | null = null;
let badgeElement: HTMLButtonElement | null = null;
let activeTooltipTarget: HTMLElement | null = null;
let lastAnalysis: AnalysisResult | null = null;
let mutationObserver: MutationObserver | null = null;

// ── Injected Styles ─────────────────────────────────────────────────

const contentStyles = `
  .trustlens-highlight {
    cursor: help;
    border-radius: 3px;
    padding: 0 2px;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    position: relative;
  }

  .trustlens-highlight[data-severity="low"] {
    text-decoration: underline dotted #f59e0b;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
  }

  .trustlens-highlight[data-severity="medium"] {
    background: rgba(251, 191, 36, 0.18);
    border-bottom: 2px solid #f59e0b;
    text-decoration: underline wavy #d97706;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }

  .trustlens-highlight[data-severity="high"] {
    background: rgba(239, 68, 68, 0.15);
    border-bottom: 2px solid #ef4444;
    text-decoration: underline wavy #dc2626;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }

  .trustlens-highlight:hover {
    filter: brightness(0.95);
  }

  #${TOOLTIP_ID} {
    position: fixed;
    z-index: 2147483647;
    max-width: 280px;
    background: #0f172a;
    color: #f1f5f9;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 12px 14px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 12.5px;
    line-height: 1.5;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  #${TOOLTIP_ID}.trustlens-tooltip-visible {
    opacity: 1;
    transform: translateY(0);
  }

  #${TOOLTIP_ID} .trustlens-tooltip-category {
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  #${TOOLTIP_ID} .trustlens-tooltip-category::before {
    content: "⚠";
    font-size: 13px;
  }

  #${TOOLTIP_ID} .trustlens-tooltip-explanation {
    color: #cbd5e1;
    margin-bottom: 8px;
  }

  #${TOOLTIP_ID} .trustlens-tooltip-tip {
    color: #94a3b8;
    font-size: 11.5px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  #${TOOLTIP_ID} .trustlens-tooltip-tip::before {
    content: "💡 ";
  }

  #${BADGE_ID} {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483646;
    border: none;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    cursor: default;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
  }

  #${BADGE_ID}.trustlens-badge-visible {
    opacity: 1;
    transform: translateY(0);
  }

  #${BADGE_ID}.trustlens-badge-low {
    background: #065f46;
    color: #d1fae5;
    box-shadow: 0 4px 16px rgba(6, 95, 70, 0.35);
  }

  #${BADGE_ID}.trustlens-badge-medium {
    background: #92400e;
    color: #fef3c7;
    box-shadow: 0 4px 16px rgba(146, 64, 14, 0.35);
  }

  #${BADGE_ID}.trustlens-badge-high {
    background: #991b1b;
    color: #fee2e2;
    box-shadow: 0 4px 16px rgba(153, 27, 27, 0.35);
  }
`;

// ── DOM Helpers ──────────────────────────────────────────────────────

const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = contentStyles;
  document.head.appendChild(style);
};

const ensureTooltip = () => {
  if (tooltipElement) return;
  if (!document.body) return;

  const tooltip = document.createElement("div");
  tooltip.id = TOOLTIP_ID;
  tooltip.setAttribute(ROOT_ATTR, "true");
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);
  tooltipElement = tooltip;
};

const ensureBadge = () => {
  if (badgeElement) return;
  if (!document.body) return;

  const badge = document.createElement("div");
  badge.id = BADGE_ID;
  badge.setAttribute(ROOT_ATTR, "true");
  badge.setAttribute("aria-label", "TrustLens AI scan results");
  document.body.appendChild(badge);
  badgeElement = badge;
};

// ── Tooltip Logic ───────────────────────────────────────────────────

const showTooltip = (target: HTMLElement) => {
  if (!tooltipElement) return;

  const category = target.dataset.category ?? "Suspicious";
  const explanation = target.dataset.explanation ?? "";
  const tip = target.dataset.tip ?? "";

  tooltipElement.innerHTML = "";

  const categoryEl = document.createElement("div");
  categoryEl.className = "trustlens-tooltip-category";
  categoryEl.textContent = category;

  const explanationEl = document.createElement("div");
  explanationEl.className = "trustlens-tooltip-explanation";
  explanationEl.textContent = explanation;

  tooltipElement.append(categoryEl, explanationEl);

  if (tip) {
    const tipEl = document.createElement("div");
    tipEl.className = "trustlens-tooltip-tip";
    tipEl.textContent = tip;
    tooltipElement.append(tipEl);
  }

  tooltipElement.style.display = "block";
  activeTooltipTarget = target;
  positionTooltip(target);

  // Trigger animation
  requestAnimationFrame(() => {
    tooltipElement?.classList.add("trustlens-tooltip-visible");
  });
};

const hideTooltip = () => {
  if (!tooltipElement) return;
  tooltipElement.classList.remove("trustlens-tooltip-visible");
  setTimeout(() => {
    if (tooltipElement && !tooltipElement.classList.contains("trustlens-tooltip-visible")) {
      tooltipElement.style.display = "none";
    }
  }, 150);
  activeTooltipTarget = null;
};

const positionTooltip = (target: HTMLElement) => {
  if (!tooltipElement) return;
  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  const offset = 10;

  let top = rect.bottom + offset;
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

  if (top + tooltipRect.height > window.innerHeight) {
    top = rect.top - tooltipRect.height - offset;
  }

  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8;
  }

  tooltipElement.style.top = `${Math.max(8, top)}px`;
  tooltipElement.style.left = `${left}px`;
};

const setupTooltipEvents = () => {
  document.addEventListener("mouseover", (event) => {
    const target = event.target as HTMLElement | null;
    const highlight = target?.closest(`[${HIGHLIGHT_ATTR}]`) as
      | HTMLElement
      | undefined;
    if (!highlight) return;
    showTooltip(highlight);
  });

  document.addEventListener("mouseout", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest(`[${HIGHLIGHT_ATTR}]`)) {
      hideTooltip();
    }
  });

  document.addEventListener("mousemove", () => {
    if (activeTooltipTarget) {
      positionTooltip(activeTooltipTarget);
    }
  });
};

// ── Badge Logic ─────────────────────────────────────────────────────

const updateBadge = (count: number, riskLevel: "low" | "medium" | "high") => {
  if (!badgeElement) return;

  if (count === 0) {
    badgeElement.classList.remove("trustlens-badge-visible");
    return;
  }

  const label = count === 1 ? "signal" : "signals";

  // Set icon
  const icon = riskLevel === "high" ? "🔴" : riskLevel === "medium" ? "🟡" : "🟢";

  badgeElement.textContent = `${icon} TrustLens: ${count} ${label}`;

  // Set color class
  badgeElement.classList.remove(
    "trustlens-badge-low",
    "trustlens-badge-medium",
    "trustlens-badge-high",
  );
  badgeElement.classList.add(`trustlens-badge-${riskLevel}`);
  badgeElement.classList.add("trustlens-badge-visible");
};

// ── Element Eligibility ─────────────────────────────────────────────

const isEligibleElement = (element: HTMLElement | null) => {
  if (!element) return false;
  if (element.closest(`[${ROOT_ATTR}]`)) return false;
  if (element.closest(`[${HIGHLIGHT_ATTR}]`)) return false;
  if (SKIP_TAGS.has(element.tagName)) return false;
  if (element.isContentEditable) return false;

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return true;
};

// ── Text Node Collection ────────────────────────────────────────────

const collectTextNodes = (root: HTMLElement) => {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!isEligibleElement(node.parentElement)) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  return nodes;
};

// ── Highlight Management ────────────────────────────────────────────

const clearHighlights = () => {
  const highlights = document.querySelectorAll(`[${HIGHLIGHT_ATTR}]`);
  highlights.forEach((highlight) => {
    const element = highlight as HTMLElement;
    const text = document.createTextNode(element.textContent ?? "");
    element.replaceWith(text);
  });

  // Normalize text nodes back together
  document.body?.normalize();

  // Hide badge
  if (badgeElement) {
    badgeElement.classList.remove("trustlens-badge-visible");
  }
};

const applyHighlights = (textNode: Text) => {
  const text = textNode.nodeValue;
  if (!text || text.length < 3) return 0;

  const matches = getSignalMatches(text);

  // Sort by start, remove overlaps
  const sorted = [...matches].sort((a, b) => a.start - b.start);
  const nonOverlapping: typeof sorted = [];
  let lastEnd = -1;
  for (const match of sorted) {
    if (match.start >= lastEnd) {
      nonOverlapping.push(match);
      lastEnd = match.end;
    }
  }

  if (nonOverlapping.length === 0) return 0;

  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const match of nonOverlapping) {
    if (match.start > cursor) {
      fragment.append(text.slice(cursor, match.start));
    }

    const span = document.createElement("span");
    span.className = "trustlens-highlight";
    span.setAttribute(HIGHLIGHT_ATTR, "true");
    span.dataset.category = match.category;
    span.dataset.explanation = match.explanation;
    span.dataset.tip = match.tip;
    span.dataset.severity = match.severity;
    span.setAttribute("role", "mark");
    span.setAttribute("aria-label", `${match.category}: ${match.explanation}`);
    span.textContent = text.slice(match.start, match.end);
    fragment.append(span);
    cursor = match.end;
  }

  if (cursor < text.length) {
    fragment.append(text.slice(cursor));
  }

  textNode.replaceWith(fragment);
  return nonOverlapping.length;
};

// ── Source Text Builder ─────────────────────────────────────────────

const buildSourceText = (nodes: Text[]) => {
  let result = "";

  for (const node of nodes) {
    const value = node.nodeValue?.trim();
    if (!value) continue;
    if (result.length + value.length > MAX_TEXT_LENGTH) {
      const remaining = MAX_TEXT_LENGTH - result.length;
      result += `${result ? "\n" : ""}${value.slice(0, remaining)}`;
      break;
    }
    result += `${result ? "\n" : ""}${value}`;
  }

  return result;
};

// ── Send Analysis to Background ─────────────────────────────────────

const sendAnalysis = (analysis: AnalysisResult, sourceText: string) => {
  lastAnalysis = analysis;

  void browser.runtime.sendMessage({
    type: MessageType.PAGE_ANALYSIS,
    payload: {
      ...analysis,
      sourceText,
      highlightEnabled: autoHighlightEnabled,
      updatedAt: Date.now(),
    },
  });
};

// ── Page Scan ───────────────────────────────────────────────────────

const scanPage = () => {
  if (!document.body) return;
  if (isScanning) return;

  isScanning = true;
  clearHighlights();

  const nodes = collectTextNodes(document.body);
  const sourceText = buildSourceText(nodes);

  // Skip very short pages
  if (sourceText.length < MIN_SCAN_TEXT_LENGTH) {
    const emptyResult: AnalysisResult = {
      riskLevel: "low",
      riskScore: 0,
      totalSignals: 0,
      categories: [],
      matches: [],
      summary: "Page text too short to analyze.",
    };
    sendAnalysis(emptyResult, sourceText);
    updateBadge(0, "low");
    isScanning = false;
    return;
  }

  const analysis = analyzeMessage(sourceText);

  // Apply highlights to DOM
  let totalHighlighted = 0;
  for (const node of nodes) {
    totalHighlighted += applyHighlights(node);
  }

  updateBadge(totalHighlighted, analysis.riskLevel);
  sendAnalysis(analysis, sourceText);

  isScanning = false;
};

// ── Debounced Auto-Scan ─────────────────────────────────────────────

const scheduleScan = () => {
  if (!autoHighlightEnabled) return;
  if (isScanning) return;
  if (scanTimeout) {
    window.clearTimeout(scanTimeout);
  }
  scanTimeout = window.setTimeout(scanPage, SCAN_DEBOUNCE_MS);
};

// ── MutationObserver for Auto-Highlight ─────────────────────────────

const startObserving = () => {
  if (mutationObserver) return;
  if (!document.body) return;

  mutationObserver = new MutationObserver(() => scheduleScan());
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

const stopObserving = () => {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
};

// ── Auto-Highlight Toggle ───────────────────────────────────────────

const handleAutoHighlightToggle = (enabled: boolean) => {
  autoHighlightEnabled = enabled;

  if (!enabled) {
    if (scanTimeout) {
      window.clearTimeout(scanTimeout);
      scanTimeout = null;
    }
    stopObserving();
    clearHighlights();
    hideTooltip();

    const emptyResult: AnalysisResult = {
      riskLevel: "low",
      riskScore: 0,
      totalSignals: 0,
      categories: [],
      matches: [],
      summary: "Auto-highlight disabled.",
    };
    sendAnalysis(emptyResult, "");
    return;
  }

  // Enabled — scan and start watching
  scanPage();
  startObserving();
};

// ── Analyze Selected Text (in-place) ────────────────────────────────

const analyzeSelectedText = (text: string): AnalysisResult => {
  const analysis = analyzeMessage(text);
  sendAnalysis(analysis, text);
  return analysis;
};

// ── Init ────────────────────────────────────────────────────────────

const init = async () => {
  injectStyles();
  ensureTooltip();
  ensureBadge();
  setupTooltipEvents();

  // Load auto-highlight preference
  const highlightStorage = getStorage(StorageKey.AUTO_HIGHLIGHT_ENABLED);
  autoHighlightEnabled = await highlightStorage.getValue();

  highlightStorage.watch((value) => {
    handleAutoHighlightToggle(value ?? false);
  });

  // Only scan automatically if auto-highlight is ON
  if (autoHighlightEnabled) {
    scanPage();
    startObserving();
  }
};

const start = () => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      void init();
    });
  } else {
    void init();
  }
};

// ── Message Listener ────────────────────────────────────────────────

browser.runtime.onMessage.addListener((message) => {
  if (!message || typeof message !== "object") return undefined;

  switch (message.type) {
    case MessageType.GET_SELECTED_TEXT: {
      const text = window.getSelection()?.toString() ?? "";
      return Promise.resolve({ text });
    }

    case MessageType.ANALYZE_SELECTED_TEXT: {
      const text = (message as { text?: string }).text ?? "";
      if (!text.trim()) {
        return Promise.resolve(null);
      }
      const result = analyzeSelectedText(text);
      return Promise.resolve(result);
    }

    case MessageType.SCAN_PAGE: {
      scanPage();
      return Promise.resolve({ success: true, analysis: lastAnalysis });
    }

    case MessageType.CLEAR_HIGHLIGHTS: {
      clearHighlights();
      hideTooltip();
      return Promise.resolve({ success: true });
    }

    case MessageType.TOGGLE_AUTO_HIGHLIGHT: {
      const enabled = (message as { enabled?: boolean }).enabled ?? false;
      handleAutoHighlightToggle(enabled);
      return Promise.resolve({ success: true });
    }

    case MessageType.GET_LAST_ANALYSIS: {
      return Promise.resolve(lastAnalysis);
    }

    default:
      return undefined;
  }
});

// ── Content Script Entry Point ──────────────────────────────────────

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    start();
  },
});
