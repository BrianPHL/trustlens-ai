import {
  AlertTriangle,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  FileSearch,
  Gift,
  Key,
  Link,
  MousePointerClick,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { browser } from "wxt/browser";

import { Button } from "~/components/ui/button";
import { analyzeMessage } from "~/lib/analyzeMessage";
import { MessageType } from "~/lib/messages";
import { StorageKey, useStorage } from "~/lib/storage";
import type {
  AnalysisResult,
  DetectionCategory,
  DetectionSeverity,
  WebAppTransferPayload,
  WebAppTransferSource,
} from "~/lib/types";
import { cn } from "~/lib/utils";
import "~/assets/styles/globals.css";

// ── Constants ───────────────────────────────────────────────────────

const MAX_ANALYSIS_TEXT = 2000;
const MAX_TRANSFER_TEXT = 8000;
const MAX_PREVIEW_LENGTH = 120;

type PopupState = "idle" | "loading" | "results";

// ── Category UI ─────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  DetectionCategory,
  { label: string; icon: LucideIcon; iconClass: string }
> = {
  "Urgency Manipulation": {
    label: "Urgency Manipulation",
    icon: Clock,
    iconClass: "text-amber-500",
  },
  "Suspicious Link": {
    label: "Suspicious Link",
    icon: Link,
    iconClass: "text-violet-500",
  },
  "Sensitive Information Request": {
    label: "OTP Request",
    icon: Key,
    iconClass: "text-amber-500",
  },
  "Account Threat": {
    label: "Account Threat",
    icon: ShieldAlert,
    iconClass: "text-blue-500",
  },
  "Impersonation Cue": {
    label: "Impersonation Cue",
    icon: User,
    iconClass: "text-indigo-500",
  },
  "Isolation Tactic": {
    label: "Isolation Tactic",
    icon: EyeOff,
    iconClass: "text-slate-500",
  },
  "Payment Pressure": {
    label: "Payment Pressure",
    icon: CreditCard,
    iconClass: "text-red-500",
  },
  "Prize/Reward Bait": {
    label: "Prize/Reward Bait",
    icon: Gift,
    iconClass: "text-amber-500",
  },
};

const SEVERITY_RANK: Record<DetectionSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const SEVERITY_LABEL_STYLES: Record<DetectionSeverity, string> = {
  low: "text-emerald-500",
  medium: "text-amber-500",
  high: "text-red-500",
};

// ── Risk Badge Styling ─────────────────────────────────────────────

const RISK_BADGE_STYLES = {
  low: {
    label: "Low Risk",
    container: "bg-emerald-100 border-emerald-200",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  medium: {
    label: "Medium Risk",
    container: "bg-amber-100 border-amber-200",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  high: {
    label: "High Risk",
    container: "bg-red-100 border-red-200",
    text: "text-red-600",
    dot: "bg-red-500",
  },
} as const;

// ── Popup Component ─────────────────────────────────────────────────

const Popup = () => {
  const [state, setState] = useState<PopupState>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [sourceText, setSourceText] = useState<string>("");
  const [analysisSource, setAnalysisSource] = useState<WebAppTransferSource>(
    "unknown",
  );
  const [error, setError] = useState<string | null>(null);

  const { data: autoHighlightEnabled, set: setAutoHighlight } = useStorage(
    StorageKey.AUTO_HIGHLIGHT_ENABLED,
  );

  // ── Load existing analysis + selection on mount ─────────────────

  useEffect(() => {
    const load = async () => {
      try {
        // Check for existing analysis from content script
        const pageAnalysis = await browser.runtime.sendMessage({
          type: MessageType.GET_PAGE_ANALYSIS,
        });

        if (
          pageAnalysis &&
          typeof pageAnalysis === "object" &&
          "riskScore" in (pageAnalysis as Record<string, unknown>)
        ) {
          const data = pageAnalysis as AnalysisResult & {
            sourceText?: string;
          };
          if (data.totalSignals > 0) {
            setAnalysis(data);
            setSourceText(data.sourceText ?? "");
            setAnalysisSource("page");
            setState("results");
          }
        }

        // Check for selected text
        const selResponse = (await browser.runtime.sendMessage({
          type: MessageType.GET_SELECTED_TEXT,
        })) as { text?: string } | null;

        const sel = selResponse?.text?.trim() ?? "";
        if (sel) {
          setSelectedText(sel);
        }
      } catch {
        // Silently fail — content script might not be injected
      }
    };

    void load();
  }, []);

  // ── Analyze Selected Text ───────────────────────────────────────

  const handleAnalyzeSelection = useCallback(async () => {
    setError(null);

    // Get selected text if we don't have it
    let text = selectedText;
    if (!text) {
      try {
        const response = (await browser.runtime.sendMessage({
          type: MessageType.GET_SELECTED_TEXT,
        })) as { text?: string } | null;
        text = response?.text?.trim() ?? "";
      } catch {
        setError("Cannot access the page. Try refreshing.");
        return;
      }
    }

    if (!text) {
      setError("Select text on the page first, then try again.");
      return;
    }

    setState("loading");

    const trimmed = text.slice(0, MAX_ANALYSIS_TEXT);

    // Run analysis locally in popup for speed
    const result = analyzeMessage(trimmed);

    // Also send to content script so it stores the analysis
    try {
      await browser.runtime.sendMessage({
        type: MessageType.ANALYZE_SELECTED_TEXT,
        text: trimmed,
      });
    } catch {
      // Content script might not be available
    }

    setAnalysis(result);
    setSourceText(trimmed);
    setAnalysisSource("selection");
    setState("results");
  }, [selectedText]);

  // ── Manual Page Scan ────────────────────────────────────────────

  const handleScanPage = useCallback(async () => {
    setError(null);
    setState("loading");

    try {
      const response = (await browser.runtime.sendMessage({
        type: MessageType.SCAN_PAGE,
      })) as { success?: boolean; analysis?: AnalysisResult } | null;

      if (response?.analysis) {
        setAnalysis(response.analysis);
        setAnalysisSource("page");
        setState("results");

        try {
          const pageAnalysis = (await browser.runtime.sendMessage({
            type: MessageType.GET_PAGE_ANALYSIS,
          })) as (AnalysisResult & { sourceText?: string }) | null;

          if (pageAnalysis?.sourceText) {
            setSourceText(pageAnalysis.sourceText);
          }
        } catch {
          // Ignore source text hydration failures
        }
      } else {
        // Wait briefly then check analysis
        await new Promise((r) => setTimeout(r, 500));
        const pageAnalysis = (await browser.runtime.sendMessage({
          type: MessageType.GET_PAGE_ANALYSIS,
        })) as (AnalysisResult & { sourceText?: string }) | null;

        if (pageAnalysis) {
          setAnalysis(pageAnalysis);
          setSourceText(pageAnalysis.sourceText ?? "");
          setAnalysisSource("page");
          setState("results");
        } else {
          setError("Could not scan this page. Try refreshing.");
          setState("idle");
        }
      }
    } catch {
      setError("Cannot access this page. Extension content script may not be loaded.");
      setState("idle");
    }
  }, []);

  // ── Open Full Analysis in Web App ───────────────────────────────

  const handleOpenFullAnalysis = useCallback(async () => {
    const baseText =
      analysisSource === "page" ? sourceText : selectedText || sourceText;
    const trimmed = baseText.trim().slice(0, MAX_TRANSFER_TEXT);

    if (!trimmed) {
      setError("No text available for full analysis.");
      return;
    }

    const payload: WebAppTransferPayload = {
      version: 1,
      origin: "extension",
      text: trimmed,
      source: analysisSource,
      createdAt: Date.now(),
      analysis: analysis ?? undefined,
    };

    setError(null);
    await browser.runtime.sendMessage({
      type: MessageType.OPEN_FULL_ANALYSIS,
      payload,
    });
  }, [analysis, analysisSource, selectedText, sourceText]);

  // ── Clear Results ───────────────────────────────────────────────

  const handleClear = useCallback(() => {
    setAnalysis(null);
    setSourceText("");
    setError(null);
    setAnalysisSource("unknown");
    setState("idle");

    void browser.runtime
      .sendMessage({
        type: MessageType.CLEAR_HIGHLIGHTS,
      })
      .catch(() => {});
  }, []);

  const handleHeaderAction = useCallback(() => {
    if (state === "results") {
      handleClear();
      return;
    }

    if (typeof window !== "undefined") {
      window.close();
    }
  }, [handleClear, state]);

  const handleToggleHighlight = useCallback(() => {
    const nextValue = !autoHighlightEnabled;
    setAutoHighlight(nextValue);
    void browser.runtime
      .sendMessage({
        type: MessageType.TOGGLE_AUTO_HIGHLIGHT,
        enabled: nextValue,
      })
      .catch(() => {});
  }, [autoHighlightEnabled, setAutoHighlight]);

  // ── Derived Data ────────────────────────────────────────────────

  const signalItems = useMemo(() => {
    if (!analysis?.matches?.length || !analysis.categories?.length) return [];

    const severityByCategory = new Map<DetectionCategory, DetectionSeverity>();

    for (const match of analysis.matches) {
      const current = severityByCategory.get(match.category);
      if (!current || SEVERITY_RANK[match.severity] > SEVERITY_RANK[current]) {
        severityByCategory.set(match.category, match.severity);
      }
    }

    return analysis.categories.map((category) => ({
      category,
      severity: severityByCategory.get(category) ?? "low",
    }));
  }, [analysis]);

  const signalCount = signalItems.length || analysis?.totalSignals || 0;
  const riskBadge = analysis ? RISK_BADGE_STYLES[analysis.riskLevel] : null;
  const sourceLabel = useMemo(() => {
    switch (analysisSource) {
      case "page":
        return "Page scan";
      case "selection":
        return "Selected text";
      case "context-menu":
        return "Context menu";
      default:
        return "Analysis";
    }
  }, [analysisSource]);
  const truncatedSelection =
    selectedText.length > MAX_PREVIEW_LENGTH
      ? `${selectedText.slice(0, MAX_PREVIEW_LENGTH)}…`
      : selectedText;

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="w-[360px] bg-background text-foreground overflow-hidden">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-border/60 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-primary/15 flex items-center justify-center">
              <Shield className="h-3 w-3 text-primary" />
            </div>
            <span className="font-bold text-xs tracking-tight">TrustLens AI</span>
          </div>
          <button
            type="button"
            onClick={handleHeaderAction}
            className="text-muted-foreground hover:text-foreground text-base leading-none w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors"
            aria-label={state === "results" ? "Clear results" : "Close popup"}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      {state === "results" && analysis && analysis.totalSignals > 0 && riskBadge ? (
        <>
          {/* Risk Badge + Signals */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
                  riskBadge.container,
                )}
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    riskBadge.dot,
                    analysis.riskLevel === "high" ? "animate-pulse" : "",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wide",
                    riskBadge.text,
                  )}
                >
                  {riskBadge.label}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {sourceLabel}
              </span>
            </div>

            <p className="text-xs font-semibold text-foreground mb-3">
              {signalCount} scam signal{signalCount === 1 ? "" : "s"} detected
            </p>

            <div className="space-y-1.5">
              {signalItems.map((item) => {
                const config = CATEGORY_CONFIG[item.category];
                const Icon = config.icon;

                return (
                  <div
                    key={item.category}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/40"
                  >
                    <Icon className={cn("h-3.5 w-3.5", config.iconClass)} />
                    <span className="text-[11px] font-medium text-foreground">
                      {config.label}
                    </span>
                    <span
                      className={cn(
                        "ml-auto text-[9px] font-bold uppercase tracking-wide",
                        SEVERITY_LABEL_STYLES[item.severity],
                      )}
                    >
                      {item.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Highlight toggle */}
          <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">
              Highlight phrases
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoHighlightEnabled}
              aria-label="Toggle auto-highlight scam signals"
              onClick={handleToggleHighlight}
              className={cn(
                "w-9 h-5 rounded-full transition-colors relative shrink-0",
                autoHighlightEnabled
                  ? "bg-primary"
                  : "bg-muted border border-border",
              )}
            >
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all duration-200 shadow-sm",
                  autoHighlightEnabled ? "left-[18px]" : "left-[3px]",
                )}
              />
            </button>
          </div>

          {/* CTA buttons */}
          <div className="p-3 border-t border-border/60 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-[10px] rounded-lg font-semibold"
              onClick={handleOpenFullAnalysis}
            >
              Explain
            </Button>
            <Button
              size="sm"
              className="flex-1 h-7 text-[10px] rounded-lg font-semibold gap-1"
              onClick={handleOpenFullAnalysis}
            >
              <ExternalLink className="h-2.5 w-2.5" />
              Full Report
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 pb-2">
              <div className="mt-2 px-2.5 py-2 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  {error}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="px-4 py-3">
          {/* Loading State */}
          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <Search className="h-4 w-4 text-primary absolute top-3 left-3" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                Analyzing for scam signals…
              </p>
            </div>
          )}

          {/* Idle State */}
          {state === "idle" && (
            <>
              {/* Selected text preview */}
              {selectedText && (
                <div className="mb-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MousePointerClick className="h-3 w-3 text-blue-600" />
                    <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                      Selected text detected
                    </span>
                  </div>
                  <p className="text-xs text-blue-900/80 leading-relaxed line-clamp-2">
                    "{truncatedSelection}"
                  </p>
                </div>
              )}

              {/* Empty state message */}
              {!selectedText && (
                <div className="text-center py-5">
                  <div className="h-12 w-12 rounded-full bg-muted/80 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    TrustLens AI is ready.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Select suspicious text or scan this page to check for scam-like signals.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2 mt-3">
                <Button
                  className="w-full gap-2 h-9 text-[13px]"
                  onClick={handleAnalyzeSelection}
                  id="analyze-selection-btn"
                >
                  <FileSearch className="h-4 w-4" />
                  Analyze Selected Text
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 h-9 text-[13px]"
                  onClick={handleScanPage}
                  id="scan-page-btn"
                >
                  <Eye className="h-4 w-4" />
                  Scan This Page
                </Button>
              </div>
            </>
          )}

          {/* No results state */}
          {state === "results" && analysis && analysis.totalSignals === 0 && (
            <div className="text-center py-3">
              <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-700">
                No scam signals detected
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This content appears safe based on known scam patterns.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-2 px-2.5 py-2 rounded-lg bg-red-50 border border-red-100">
              <p className="text-xs text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="px-3 py-2 bg-muted/40">
        <p className="text-[9px] text-muted-foreground text-center leading-relaxed">
          Educational analysis only. Always verify through official channels.
        </p>
      </div>
    </div>
  );
};

// ── Mount ───────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
