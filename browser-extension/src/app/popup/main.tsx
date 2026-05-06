import {
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  FileSearch,
  MousePointerClick,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { browser } from "wxt/browser";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { analyzeMessage } from "~/lib/analyzeMessage";
import { MessageType } from "~/lib/messages";
import { StorageKey, useStorage } from "~/lib/storage";
import type { AnalysisResult, DetectionCategory } from "~/lib/types";
import { cn } from "~/lib/utils";
import "~/assets/styles/globals.css";

// ── Constants ───────────────────────────────────────────────────────

const MAX_ANALYSIS_TEXT = 2000;
const MAX_PREVIEW_LENGTH = 120;

type PopupState = "idle" | "loading" | "results";

// ── Category Colors ─────────────────────────────────────────────────

const CATEGORY_STYLES: Record<
  DetectionCategory,
  { bg: string; text: string; border: string }
> = {
  "Urgency Manipulation": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  "Suspicious Link": {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
  "Sensitive Information Request": {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
  },
  "Account Threat": {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  "Impersonation Cue": {
    bg: "bg-violet-50",
    text: "text-violet-800",
    border: "border-violet-200",
  },
  "Isolation Tactic": {
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-200",
  },
  "Payment Pressure": {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
  "Prize/Reward Bait": {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
};

// ── Risk Styling ────────────────────────────────────────────────────

const RISK_CONFIG = {
  low: {
    label: "Low Risk",
    icon: ShieldCheck,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    scoreBg: "bg-emerald-500",
    glow: "shadow-emerald-200/50",
  },
  medium: {
    label: "Medium Risk",
    icon: ShieldAlert,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    scoreBg: "bg-amber-500",
    glow: "shadow-amber-200/50",
  },
  high: {
    label: "High Risk",
    icon: ShieldX,
    badge: "bg-red-50 text-red-700 border-red-200",
    scoreBg: "bg-red-500",
    glow: "shadow-red-200/50",
  },
} as const;

// ── Popup Component ─────────────────────────────────────────────────

const Popup = () => {
  const [state, setState] = useState<PopupState>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [sourceText, setSourceText] = useState<string>("");
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
        setState("results");
      } else {
        // Wait briefly then check analysis
        await new Promise((r) => setTimeout(r, 500));
        const pageAnalysis = (await browser.runtime.sendMessage({
          type: MessageType.GET_PAGE_ANALYSIS,
        })) as (AnalysisResult & { sourceText?: string }) | null;

        if (pageAnalysis) {
          setAnalysis(pageAnalysis);
          setSourceText(pageAnalysis.sourceText ?? "");
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
    const text = sourceText || selectedText;
    const trimmed = text.trim().slice(0, MAX_ANALYSIS_TEXT);

    if (!trimmed) {
      setError("No text available for full analysis.");
      return;
    }

    setError(null);
    await browser.runtime.sendMessage({
      type: MessageType.OPEN_FULL_ANALYSIS,
      payload: { text: trimmed },
    });
  }, [sourceText, selectedText]);

  // ── Clear Results ───────────────────────────────────────────────

  const handleClear = useCallback(() => {
    setAnalysis(null);
    setSourceText("");
    setError(null);
    setState("idle");

    void browser.runtime.sendMessage({
      type: MessageType.CLEAR_HIGHLIGHTS,
    }).catch(() => {});
  }, []);

  // ── Derived Data ────────────────────────────────────────────────

  const categories = useMemo(() => {
    if (!analysis?.categories) return [];
    return analysis.categories;
  }, [analysis]);

  const topPhrases = useMemo(() => {
    if (!analysis?.matches?.length) return [];

    const seen = new Set<string>();
    const result: { text: string; category: DetectionCategory; severity: string }[] = [];

    for (const match of analysis.matches) {
      const phrase = match.matchedText.trim();
      const lower = phrase.toLowerCase();
      if (!phrase || seen.has(lower)) continue;
      seen.add(lower);
      result.push({
        text: phrase,
        category: match.category,
        severity: match.severity,
      });
      if (result.length >= 5) break;
    }

    return result;
  }, [analysis]);

  const risk = analysis ? RISK_CONFIG[analysis.riskLevel] : null;
  const truncatedSelection =
    selectedText.length > MAX_PREVIEW_LENGTH
      ? `${selectedText.slice(0, MAX_PREVIEW_LENGTH)}…`
      : selectedText;

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="w-[360px] bg-background text-foreground overflow-hidden">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">TrustLens AI</h1>
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">
                Scam awareness assistant
              </p>
            </div>
          </div>

          {/* Auto-highlight toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Auto
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoHighlightEnabled}
              aria-label="Toggle auto-highlight scam signals"
              id="auto-highlight-toggle"
              onClick={() => {
                const newVal = !autoHighlightEnabled;
                setAutoHighlight(newVal);
                void browser.runtime.sendMessage({
                  type: MessageType.TOGGLE_AUTO_HIGHLIGHT,
                  enabled: newVal,
                }).catch(() => {});
              }}
              className={cn(
                "h-5 w-9 rounded-full transition-colors relative flex-shrink-0",
                autoHighlightEnabled ? "bg-primary" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
                  autoHighlightEnabled ? "left-[18px]" : "left-0.5",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
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

        {/* Results State */}
        {state === "results" && analysis && risk && (
          <>
            {/* Risk Badge + Score */}
            <div className="flex items-center justify-between mb-3">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold",
                  risk.badge,
                )}
              >
                {React.createElement(risk.icon, { className: "h-3.5 w-3.5" })}
                {risk.label}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-lg font-bold tabular-nums leading-none">
                    {analysis.riskScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
                <div className="h-8 w-8 rounded-full relative overflow-hidden bg-muted">
                  <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-muted"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="13"
                      fill="none"
                      strokeWidth="3"
                      strokeDasharray={`${(analysis.riskScore / 100) * 81.68} 81.68`}
                      strokeLinecap="round"
                      className={cn(
                        analysis.riskLevel === "high"
                          ? "stroke-red-500"
                          : analysis.riskLevel === "medium"
                            ? "stroke-amber-500"
                            : "stroke-emerald-500",
                      )}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Signals Count */}
            <div className="text-sm mb-3">
              <span className="font-bold">{analysis.totalSignals}</span>{" "}
              <span className="text-muted-foreground">
                scam {analysis.totalSignals === 1 ? "signal" : "signals"} detected
              </span>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                  Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const style = CATEGORY_STYLES[cat];
                    return (
                      <span
                        key={cat}
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
                          style.bg,
                          style.text,
                          style.border,
                        )}
                      >
                        {cat}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Suspicious Phrases */}
            {topPhrases.length > 0 && (
              <Card className="border-border/50 mb-3">
                <CardContent className="p-3 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Suspicious phrases
                  </p>
                  <ul className="space-y-1">
                    {topPhrases.map((phrase) => {
                      const catStyle = CATEGORY_STYLES[phrase.category];
                      return (
                        <li
                          key={phrase.text}
                          className="flex items-start gap-2 text-xs"
                        >
                          <span
                            className={cn(
                              "mt-0.5 h-2 w-2 rounded-full flex-shrink-0",
                              phrase.severity === "high"
                                ? "bg-red-500"
                                : phrase.severity === "medium"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500",
                            )}
                          />
                          <div className="min-w-0">
                            <span className="font-medium text-foreground truncate block">
                              "{phrase.text}"
                            </span>
                            <span
                              className={cn(
                                "text-[10px]",
                                catStyle.text,
                              )}
                            >
                              {phrase.category}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            {analysis.summary && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-3 px-0.5">
                {analysis.summary}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full gap-2 h-9 text-[13px]"
                onClick={handleOpenFullAnalysis}
                id="open-full-analysis-btn"
              >
                <ExternalLink className="h-4 w-4" />
                Open Full Analysis
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5 h-8 text-[12px]"
                  onClick={handleScanPage}
                  id="rescan-btn"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Re-scan
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5 h-8 text-[12px]"
                  onClick={handleClear}
                  id="clear-btn"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
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

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 border-t border-border/40 bg-muted/30">
        <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
          Analysis runs locally. Text is only sent to the web app when you choose full analysis.
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
