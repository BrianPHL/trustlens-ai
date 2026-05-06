import env from "../../../env.config";
import { defineBackground } from "#imports";
import { browser } from "wxt/browser";
import { MessageType, type PageAnalysis } from "~/lib/messages";

const analysisByTabId = new Map<number, PageAnalysis>();
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

const getActiveTabId = async () => {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab?.id ?? null;
};

const getSelectionFromActiveTab = async () => {
  const tabId = await getActiveTabId();

  if (!tabId) {
    return { text: "" };
  }

  try {
    const response = await browser.tabs.sendMessage(tabId, {
      type: MessageType.GET_SELECTION,
    });

    return response ?? { text: "" };
  } catch (error) {
    console.warn("Unable to read selection:", error);
    return { text: "" };
  }
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

    switch (message.type) {
      case MessageType.PAGE_ANALYSIS: {
        const tabId = sender.tab?.id;

        if (tabId) {
          analysisByTabId.set(tabId, message.payload as PageAnalysis);
        }

        return undefined;
      }

      case MessageType.GET_PAGE_ANALYSIS:
        return getActiveTabId().then((tabId) =>
          tabId ? analysisByTabId.get(tabId) ?? null : null,
        );

      case MessageType.OPEN_FULL_ANALYSIS:
        return openAnalysis(message.payload?.text ?? "");

      case MessageType.OPEN_POPUP:
        return openPopup();

      case MessageType.GET_SELECTION:
        return getSelectionFromActiveTab();

      default:
        return undefined;
    }
  });
});
