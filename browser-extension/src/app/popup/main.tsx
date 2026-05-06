import { AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { browser } from "wxt/browser";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { MessageType, type PageAnalysis } from "~/lib/messages";
import { StorageKey, useStorage } from "~/lib/storage";
import { cn } from "~/lib/utils";
import "~/assets/styles/globals.css";

const MAX_ANALYSIS_TEXT = 2000;

const riskStyles = {
  low: {
    label: "Low Risk",
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
    icon: ShieldCheck,
  },
  medium: {
    label: "Medium Risk",
    className: "text-amber-700 bg-amber-50 border-amber-200",
    icon: AlertTriangle,
  },
  high: {
    label: "High Risk",
    className: "text-red-600 bg-red-50 border-red-200",
    icon: AlertTriangle,
  },
} as const;

const Popup = () => {
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: highlightEnabled, set: setHighlightEnabled } = useStorage(
    StorageKey.HIGHLIGHT_ENABLED,
  );

  const loadAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = (await browser.runtime.sendMessage({
        type: MessageType.GET_PAGE_ANALYSIS,
      })) as PageAnalysis | null;
      setAnalysis(response ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalysis();
  }, []);

  const categories = useMemo(() => {
    if (!analysis?.signals.length) {
      return [];
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (const signal of analysis.signals) {
      if (!seen.has(signal.category)) {
        seen.add(signal.category);
        result.push(signal.category);
      }
      if (result.length >= 4) {
        break;
      }
    }
    return result;
  }, [analysis]);

  const phrases = useMemo(() => {
    if (!analysis?.signals.length) {
      return [];
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (const signal of analysis.signals) {
      const phrase = signal.phrase.trim();
      if (!phrase || seen.has(phrase)) {
        continue;
      }
      seen.add(phrase);
      result.push(phrase);
      if (result.length >= 3) {
        break;
      }
    }
    return result;
  }, [analysis]);

  const handleOpenFullAnalysis = async (text: string) => {
    const trimmed = text.trim().slice(0, MAX_ANALYSIS_TEXT);
    if (!trimmed) {
      setError("No text available for analysis.");
      return;
    }
    setError(null);
    await browser.runtime.sendMessage({
      type: MessageType.OPEN_FULL_ANALYSIS,
      payload: { text: trimmed },
    });
  };

  const handleAnalyzeSelection = async () => {
    const response = (await browser.runtime.sendMessage({
      type: MessageType.GET_SELECTION,
    })) as { text?: string } | null;

    const selectedText = response?.text?.trim() ?? "";
    if (!selectedText) {
      setError("Select text on the page first, then try again.");
      return;
    }

    await handleOpenFullAnalysis(selectedText);
  };

  const risk = analysis ? riskStyles[analysis.riskLevel] : null;
  const riskIcon = risk?.icon ?? AlertTriangle;
  const hasSourceText = Boolean(analysis?.sourceText?.trim());

  return (
    <div className="min-w-[20rem] max-w-[22rem] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">TrustLens AI</p>
          <p className="text-xs text-muted-foreground">
            Real-time scam awareness
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={highlightEnabled}
          aria-label="Toggle highlighting"
          onClick={() => setHighlightEnabled(!highlightEnabled)}
          className={cn(
            "h-6 w-11 rounded-full transition-colors relative",
            highlightEnabled ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-4 w-4 rounded-full bg-white transition-all",
              highlightEnabled ? "left-6" : "left-1",
            )}
          />
        </button>
      </div>

      <Card className="mt-4 border-border/60">
        <CardContent className="p-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Scanning page...</p>
          ) : analysis ? (
            <>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold",
                  risk?.className ?? "bg-muted text-foreground",
                )}
              >
                {React.createElement(riskIcon, { className: "h-3.5 w-3.5" })}
                {risk?.label}
              </div>

              <div className="text-sm">
                <span className="font-semibold">{analysis.totalMatches}</span>{" "}
                {analysis.totalMatches === 1 ? "signal" : "signals"} detected
              </div>

              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No scam-like phrases found on this page.
                </p>
              )}

              {phrases.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] uppercase text-muted-foreground">
                    Top phrases
                  </p>
                  <ul className="text-xs text-foreground space-y-1">
                    {phrases.map((phrase) => (
                      <li key={phrase} className="truncate">
                        "{phrase}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No scan data yet. Visit a page to start detection.
            </p>
          )}
        </CardContent>
      </Card>

      {!highlightEnabled && (
        <p className="mt-2 text-xs text-amber-600">
          Highlighting is off. Turn it on to scan this page.
        </p>
      )}

      <div className="mt-4 space-y-2">
        <Button
          className="w-full gap-2"
          onClick={() => handleOpenFullAnalysis(analysis?.sourceText ?? "")}
          disabled={!hasSourceText}
        >
          <ExternalLink className="h-4 w-4" />
          Open Full Analysis
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAnalyzeSelection}
        >
          Analyze Selected Text
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        Do not click suspicious links or share OTPs, passwords, PINs, or personal
        details. Verify through official channels.
      </p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
