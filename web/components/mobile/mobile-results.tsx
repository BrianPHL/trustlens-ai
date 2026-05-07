'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Lock,
  ShieldAlert,
  Globe,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RiskBadge } from '@/components/shared/risk-badge'
import { DetectionFlag } from '@/components/shared/detection-flag'
import { HighlightedText } from '@/components/shared/highlighted-text'
import { ExplanationCard } from '@/components/shared/explanation-card'
import type { AnalysisResult } from '@/lib/scam-analyzer'

interface MobileResultsProps {
  result: AnalysisResult
  onStartImmunity: () => void
}

export function MobileResultsView({ result, onStartImmunity }: MobileResultsProps) {
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAnalysis = sessionStorage.getItem('trustlens-analysis')
      if (storedAnalysis) {
        try {
          const parsed = JSON.parse(storedAnalysis)
          setIsGuest(parsed.isGuestView || false)
        } catch (e) {
          console.error("Error parsing analysis context", e)
        }
      }
    }
  }, [])

  return (
    <div className="flex flex-col gap-5 p-4 pb-24 font-geist bg-background">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analysis Results</h1>
        {!isGuest && <RiskBadge level={result.riskLevel} animated />}
      </div>

      {/* 2. Hero Analysis Card (Web Design Ported) */}
      <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-background to-muted/30">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            {/* Circular Score Display */}
            <div className="relative flex items-center justify-center w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                <circle
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * result.riskScore) / 100}
                  className={`${result.riskLevel === 'high' ? 'text-destructive' : 'text-amber-500'} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black tracking-tighter">{result.riskScore}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Score</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className={`flex items-center justify-center gap-2 ${result.riskLevel === 'high' ? 'text-destructive' : 'text-amber-500'}`}>
                <ShieldAlert className="w-5 h-5" />
                <h2 className="text-2xl font-black uppercase tracking-tight italic">
                  {result.riskLevel === 'high' ? 'High Risk' : 'Medium Risk'}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">TrustLens has completed its analysis.</p>
            </div>

            {/* Signal & Confidence Badges */}
            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-3 text-left">
                <p className="text-[9px] uppercase font-bold text-destructive/60 tracking-widest">Signals</p>
                <p className="text-xl font-bold">{result.signals.length}</p>
                <p className="text-[10px] text-muted-foreground">Detected flags</p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 text-left">
                <p className="text-[9px] uppercase font-bold text-primary/60 tracking-widest">Confidence</p>
                <p className="text-xl font-bold">{result.confidence || 94}%</p>
                <p className="text-[10px] text-muted-foreground">AI reliability</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Risk Distribution Card */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold mb-4 text-foreground/80 uppercase tracking-wide">Risk Distribution</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0">
              <div className="absolute inset-0 rounded-full border-[6px] border-emerald-500 opacity-20" />
              <div
                className="absolute inset-0 rounded-full border-[6px] border-t-destructive border-r-amber-400 border-b-transparent border-l-transparent"
                style={{ transform: `rotate(${(result.percentages.scam * 3.6)}deg)` }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-black">{result.percentages.scam + result.percentages.suspicious}%</span>
                <span className="text-[8px] uppercase font-bold text-muted-foreground tracking-tighter">Danger</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Scam</span>
                </div>
                <span className="text-sm font-bold">{result.percentages.scam}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Suspicious</span>
                </div>
                <span className="text-sm font-bold">{result.percentages.suspicious}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Safe</span>
                </div>
                <span className="text-sm font-bold">{result.percentages.safe}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Original Message (Highlighted Segments) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold">Original Message</h3>
          </div>
          <span className="text-[10px] text-muted-foreground italic flex items-center gap-1">
            <Info className="w-3 h-3" /> Signals highlighted
          </span>
        </div>
        <div className={`transition-all duration-500 relative ${isGuest ? 'max-h-[120px] overflow-hidden' : ''}`}>
          <div className={`p-4 rounded-2xl bg-muted/20 border border-border/40 leading-relaxed ${isGuest ? 'blur-[3px] opacity-40 select-none' : ''}`}>
            <HighlightedText segments={result.segments} />
          </div>

          {/* Guest Unlock Overlay (Inside the message box area) */}
          {isGuest && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Card className="border-primary/20 bg-background/90 backdrop-blur-sm shadow-xl mx-4">
                <CardContent className="p-4 text-center">
                  <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-[11px] font-bold mb-3">Sign in to see highlighted signals</p>
                  <Button asChild size="sm" className="h-8 text-[10px] font-bold px-6">
                    <Link href="/login">Unlock Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {!isGuest && (
        <>
          {/* 5. Detailed Breakdown (Web Feature) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wide">Detailed Signals</h3>
            <div className="space-y-2">
              {result.signals.map((signal) => (
                <DetectionFlag
                  key={signal.id}
                  label={signal.explanation}
                  category={signal.category}
                  icon={signal.icon}
                  severity={signal.severity}
                />
              ))}
            </div>
          </div>

          {/* 6. Why this message is risky (Explanation Card) */}
          <ExplanationCard
            title="Why this is risky"
            explanation={result.explanation}
            variant={result.riskLevel === 'high' ? 'danger' : result.riskLevel === 'medium' ? 'warning' : 'success'}
          />
        </>
      )}

      {/* 7. Recommended Actions */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <p className="text-sm font-bold uppercase tracking-wider text-foreground/80">Recommended Actions</p>
          {isGuest && <Lock className="w-3.5 h-3.5 text-muted-foreground/30" />}
        </div>
        <div className="space-y-4">
          {(isGuest ? result.recommendedActions.slice(0, 2) : result.recommendedActions).map((action) => (
            <div key={action.number} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {action.number}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground leading-snug">{action.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Main CTA */}
      <div className="pt-4">
        <Button
          onClick={onStartImmunity}
          className="w-full h-14 rounded-2xl gap-2 font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {isGuest ? "Get Full Protection" : "Start Immunity Mode"}
          <Zap className="w-5 h-5 fill-current" />
        </Button>
        <Link href="/analyze" className="block text-center mt-4 text-xs font-bold text-muted-foreground hover:text-foreground">
          Analyze Another Message
        </Link>
      </div>
    </div>
  )
}
