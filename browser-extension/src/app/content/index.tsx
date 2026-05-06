import { browser } from "wxt/browser";
import { defineContentScript } from "#imports";
import { analyzeText, getSignalMatches } from "~/lib/scam-analyzer";
import { MessageType } from "~/lib/messages";
import { StorageKey, getStorage } from "~/lib/storage";

const STYLE_ID = "trustlens-style";
const TOOLTIP_ID = "trustlens-tooltip";
const BADGE_ID = "trustlens-badge";
const ROOT_ATTR = "data-trustlens-root";
const HIGHLIGHT_ATTR = "data-trustlens-highlight";
const MAX_TEXT_LENGTH = 8000;
const SCAN_DEBOUNCE_MS = 1200;

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
]);

let highlightEnabled = true;
let scanTimeout: number | null = null;
let isScanning = false;
let tooltipElement: HTMLDivElement | null = null;
let badgeElement: HTMLButtonElement | null = null;
let activeTooltipTarget: HTMLElement | null = null;

const contentStyles = `
  .trustlens-highlight {
    cursor: help;
    border-radius: 3px;
    padding: 0 2px;
    transition: background-color 0.15s ease;
  }

  .trustlens-highlight[data-severity="low"] {
    text-decoration: underline dotted #f59e0b;
    text-underline-offset: 2px;
  }

  .trustlens-highlight[data-severity="medium"] {
    background: rgba(251, 191, 36, 0.22);
    border-bottom: 2px solid #f59e0b;
  }

  .trustlens-highlight[data-severity="high"] {
    background: rgba(239, 68, 68, 0.22);
    border-bottom: 2px solid #ef4444;
  }

  #${TOOLTIP_ID} {
    position: fixed;
    z-index: 2147483647;
    max-width: 240px;
    background: #0f172a;
    color: #f8fafc;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    font-family: system-ui, -apple-system, Segoe UI, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }

  #${TOOLTIP_ID} .trustlens-tooltip-title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  #${BADGE_ID} {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 2147483646;
    background: #0f172a;
    color: #f8fafc;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    font-family: system-ui, -apple-system, Segoe UI, sans-serif;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
    cursor: pointer;
  }
`;

const injectStyles = () => {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = contentStyles;
  document.head.appendChild(style);
};

const ensureTooltip = () => {
  if (tooltipElement) {
    return;
  }
  if (!document.body) {
    return;
  }
  const tooltip = document.createElement("div");
  tooltip.id = TOOLTIP_ID;
  tooltip.setAttribute(ROOT_ATTR, "true");
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);
  tooltipElement = tooltip;
};

const ensureBadge = () => {
  if (badgeElement) {
    return;
  }
  if (!document.body) {
    return;
  }
  const badge = document.createElement("button");
  badge.id = BADGE_ID;
  badge.type = "button";
  badge.setAttribute(ROOT_ATTR, "true");
  badge.style.display = "none";
  badge.addEventListener("click", () => {
    void browser.runtime.sendMessage({ type: MessageType.OPEN_POPUP });
  });
  document.body.appendChild(badge);
  badgeElement = badge;
};

const updateBadge = (count: number) => {
  if (!badgeElement) {
    return;
  }

  if (!highlightEnabled || count === 0) {
    badgeElement.style.display = "none";
    return;
  }

  const label = count === 1 ? "signal" : "signals";
  badgeElement.textContent = `TrustLens: ${count} ${label}`;
  badgeElement.style.display = "block";
};

const showTooltip = (target: HTMLElement) => {
  if (!tooltipElement) {
    return;
  }

  const category = target.dataset.category ?? "Suspicious";
  const explanation = target.dataset.explanation ?? "";

  tooltipElement.innerHTML = "";
  const title = document.createElement("div");
  title.className = "trustlens-tooltip-title";
  title.textContent = category;
  const body = document.createElement("div");
  body.textContent = explanation;
  tooltipElement.append(title, body);

  tooltipElement.style.display = "block";
  activeTooltipTarget = target;
  positionTooltip(target);
};

const hideTooltip = () => {
  if (!tooltipElement) {
    return;
  }
  tooltipElement.style.display = "none";
  activeTooltipTarget = null;
};

const positionTooltip = (target: HTMLElement) => {
  if (!tooltipElement) {
    return;
  }
  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  const offset = 12;

  let top = rect.bottom + offset;
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;

  if (top + tooltipRect.height > window.innerHeight) {
    top = rect.top - tooltipRect.height - offset;
  }

  if (left < 8) {
    left = 8;
  }
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
    if (!highlight) {
      return;
    }
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

const isEligibleElement = (element: HTMLElement | null) => {
  if (!element) {
    return false;
  }

  if (element.closest(`[${ROOT_ATTR}]`)) {
    return false;
  }

  if (element.closest(`[${HIGHLIGHT_ATTR}]`)) {
    return false;
  }

  if (SKIP_TAGS.has(element.tagName)) {
    return false;
  }

  if (element.isContentEditable) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  return true;
};

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

const clearHighlights = () => {
  const highlights = document.querySelectorAll(`[${HIGHLIGHT_ATTR}]`);
  highlights.forEach((highlight) => {
    const element = highlight as HTMLElement;
    const text = document.createTextNode(element.textContent ?? "");
    element.replaceWith(text);
  });
};

const applyHighlights = (textNode: Text) => {
  const text = textNode.nodeValue;
  if (!text) {
    return 0;
  }

  const sortedMatches = getSignalMatches(text).sort(
    (a, b) => a.start - b.start,
  );
  const matches = [] as typeof sortedMatches;
  let lastEnd = -1;
  for (const match of sortedMatches) {
    if (match.start >= lastEnd) {
      matches.push(match);
      lastEnd = match.end;
    }
  }

  if (matches.length === 0) {
    return 0;
  }

  const fragment = document.createDocumentFragment();
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      fragment.append(text.slice(cursor, match.start));
    }

    const span = document.createElement("span");
    span.className = "trustlens-highlight";
    span.setAttribute(HIGHLIGHT_ATTR, "true");
    span.dataset.category = match.pattern.category;
    span.dataset.explanation = match.pattern.explanation;
    span.dataset.severity = match.pattern.severity;
    span.textContent = text.slice(match.start, match.end);
    fragment.append(span);
    cursor = match.end;
  }

  if (cursor < text.length) {
    fragment.append(text.slice(cursor));
  }

  textNode.replaceWith(fragment);
  return matches.length;
};

const buildSourceText = (nodes: Text[]) => {
  let result = "";

  for (const node of nodes) {
    const value = node.nodeValue?.trim();
    if (!value) {
      continue;
    }
    if (result.length + value.length > MAX_TEXT_LENGTH) {
      const remaining = MAX_TEXT_LENGTH - result.length;
      result += `${result ? "\n" : ""}${value.slice(0, remaining)}`;
      break;
    }
    result += `${result ? "\n" : ""}${value}`;
  }

  return result;
};

const sendAnalysis = (payload: {
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  signals: ReturnType<typeof analyzeText>["signals"];
  totalMatches: number;
  sourceText: string;
}) => {
  void browser.runtime.sendMessage({
    type: MessageType.PAGE_ANALYSIS,
    payload: {
      ...payload,
      highlightEnabled,
      updatedAt: Date.now(),
    },
  });
};

const scanPage = () => {
  if (!highlightEnabled) {
    return;
  }

  if (!document.body) {
    return;
  }

  isScanning = true;

  clearHighlights();

  const nodes = collectTextNodes(document.body);
  const sourceText = buildSourceText(nodes);
  const analysis = analyzeText(sourceText);

  let totalMatches = 0;
  for (const node of nodes) {
    totalMatches += applyHighlights(node);
  }

  updateBadge(totalMatches);
  sendAnalysis({
    riskLevel: analysis.riskLevel,
    riskScore: analysis.riskScore,
    signals: analysis.signals,
    totalMatches,
    sourceText,
  });

  isScanning = false;
};

const scheduleScan = () => {
  if (!highlightEnabled) {
    return;
  }
  if (isScanning) {
    return;
  }
  if (scanTimeout) {
    window.clearTimeout(scanTimeout);
  }
  scanTimeout = window.setTimeout(scanPage, SCAN_DEBOUNCE_MS);
};

const observeMutations = () => {
  const observer = new MutationObserver(() => scheduleScan());
  if (!document.body) {
    return;
  }
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

const handleHighlightToggle = (enabled: boolean) => {
  highlightEnabled = enabled;
  if (!enabled) {
    if (scanTimeout) {
      window.clearTimeout(scanTimeout);
      scanTimeout = null;
    }
    clearHighlights();
    updateBadge(0);
    hideTooltip();
    sendAnalysis({
      riskLevel: "low",
      riskScore: 0,
      signals: [],
      totalMatches: 0,
      sourceText: "",
    });
    return;
  }

  scanPage();
};

const init = async () => {
  injectStyles();
  ensureTooltip();
  ensureBadge();
  setupTooltipEvents();

  const highlightStorage = getStorage(StorageKey.HIGHLIGHT_ENABLED);
  highlightEnabled = await highlightStorage.getValue();
  highlightStorage.watch((value) => {
    handleHighlightToggle(value ?? true);
  });

  if (highlightEnabled) {
    scanPage();
  } else {
    handleHighlightToggle(false);
  }

  observeMutations();
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

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === MessageType.GET_SELECTION) {
    const text = window.getSelection()?.toString() ?? "";
    return Promise.resolve({ text });
  }
  return undefined;
});

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    start();
  },
});
