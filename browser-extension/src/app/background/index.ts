import env from "../../../env.config";
import { defineBackground } from "#imports";
import { browser } from "wxt/browser";
import { MessageType } from "~/lib/messages";
import type { AnalysisResult, PageAnalysisPayload } from "~/lib/types";

const analysisByTabId = new Map<number, PageAnalysisPayload>();
const MAX_ANALYSIS_TEXT = 2000;

const getWebAppBaseUrl = () => {
  const base = env.VITE_WEB_APP_URL || "http://localhost:3000";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const buildAnalyzeUrl = (text: string) => {
  const base = getWebAppBaseUrl();
  return `${base}/analyze?text=${encodeURIComponent(text)}`;
};

const openAnalysis = async (text: string) => {
  const trimmed = text.trim().slice(0, MAX_ANALYSIS_TEXT);

  if (!trimmed) {
    return false;
  }

  await browser.tabs.create({ url: buildAnalyzeUrl(trimmed) });
  return true;
};

const getActiveTab = async () => {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab ?? null;
};

const getActiveTabId = async () => {
  const tab = await getActiveTab();
  return tab?.id ?? null;
};

const sendMessageToActiveTab = async (message: Record<string, unknown>) => {
  const tabId = await getActiveTabId();
  if (!tabId) return null;

  try {
    return await browser.tabs.sendMessage(tabId, message);
  } catch (error) {
    console.warn("Failed to send message to tab:", error);
    return null;
  }
};

const getSelectionFromActiveTab = async () => {
  const response = await sendMessageToActiveTab({
    type: MessageType.GET_SELECTED_TEXT,
  });
  return (response as { text?: string } | null) ?? { text: "" };
};

const openPopup = async () => {
  if (browser.action?.openPopup) {
    try {
      await browser.action.openPopup();
      return true;
    } catch (error) {
      console.warn("openPopup failed, falling back to tab:", error);
    }
  }

  await browser.tabs.create({ url: browser.runtime.getURL("/popup.html") });
  return false;
};

const setupContextMenu = async () => {
  try {
    await browser.contextMenus.removeAll();
  } catch (error) {
    console.warn("Failed to reset context menus:", error);
  }

  await browser.contextMenus.create({
    id: "trustlens-analyze-selection",
    title: "Analyze selection with TrustLens",
    contexts: ["selection"],
  });
};

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    void setupContextMenu();
  });

  browser.runtime.onStartup.addListener(() => {
    void setupContextMenu();
  });

  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId !== "trustlens-analyze-selection") {
      return;
    }

    const selection = info.selectionText?.trim();

    if (!selection) {
      return;
    }

    void openAnalysis(selection);
  });

  browser.tabs.onRemoved.addListener((tabId) => {
    analysisByTabId.delete(tabId);
  });

  browser.runtime.onMessage.addListener((message, sender) => {
    if (!message || typeof message !== "object") {
      return undefined;
    }

    const msg = message as Record<string, unknown>;

    switch (msg.type) {
      // Content script sends analysis results
      case MessageType.PAGE_ANALYSIS: {
        const tabId = sender.tab?.id;
        if (tabId) {
          analysisByTabId.set(tabId, msg.payload as PageAnalysisPayload);
        }
        return undefined;
      }

      // Popup requests current tab analysis
      case MessageType.GET_PAGE_ANALYSIS:
        return getActiveTabId().then((tabId) =>
          tabId ? analysisByTabId.get(tabId) ?? null : null,
        );

      // Popup requests selected text from active tab
      case MessageType.GET_SELECTED_TEXT:
        return getSelectionFromActiveTab();

      // Popup tells content script to analyze selected text
      case MessageType.ANALYZE_SELECTED_TEXT: {
        const text = (msg as { text?: string }).text ?? "";
        return sendMessageToActiveTab({
          type: MessageType.ANALYZE_SELECTED_TEXT,
          text,
        }) as Promise<AnalysisResult | null>;
      }

      // Popup triggers manual page scan
      case MessageType.SCAN_PAGE:
        return sendMessageToActiveTab({
          type: MessageType.SCAN_PAGE,
        });

      // Popup clears highlights
      case MessageType.CLEAR_HIGHLIGHTS:
        return sendMessageToActiveTab({
          type: MessageType.CLEAR_HIGHLIGHTS,
        });

      // Open full analysis in web app
      case MessageType.OPEN_FULL_ANALYSIS:
        return openAnalysis(
          ((msg.payload as { text?: string })?.text ?? ""),
        );

      // Badge click -> open popup
      case MessageType.OPEN_POPUP:
        return openPopup();

      // Get last analysis from content script
      case MessageType.GET_LAST_ANALYSIS:
        return sendMessageToActiveTab({
          type: MessageType.GET_LAST_ANALYSIS,
        });

      default:
        return undefined;
    }
  });
});
