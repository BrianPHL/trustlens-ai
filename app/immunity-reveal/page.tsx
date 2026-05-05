'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HighlightedText } from '@/components/shared/highlighted-text'
import { type AnalysisResult } from '@/lib/scam-analyzer'

export default function ImmunityRevealPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [challenge, setChallenge] = useState<AnalysisResult | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSelected = sessionStorage.getItem('trustlens-selected')
      if (storedSelected) {
        try { setSelectedIds(new Set(JSON.parse(storedSelected))) } catch {}
      }
      
      const storedChallenge = sessionStorage.getItem('trustlens-challenge')
      if (storedChallenge) {
        try { setChallenge(JSON.parse(storedChallenge)) } catch {}
      }
    }
  }, [])

  const segments = challenge?.segments || []
  const signals = challenge?.signals || []

  const allRedFlagIds = new Set(
    segments.filter(s => s.isRedFlag && s.signalId).map(s => s.signalId!)
  )
  const correctIds = new Set([...selectedIds].filter(id => allRedFlagIds.has(id)))
  const missedIds = new Set([...allRedFlagIds].filter(id => !selectedIds.has(id)))
  const score = allRedFlagIds.size > 0 ? Math.round((correctIds.size / allRedFlagIds.size) * 100) : 100

  const getScoreLabel = (s: number) => {
    if (s >= 90) return { label: 'Excellent', color: 'text-emerald-600' }
    if (s >= 70) return { label: 'Good Awareness', color: 'text-blue-600' }
    if (s >= 50) return { label: 'Needs Caution', color: 'text-amber-600' }
    return { label: 'Needs Practice', color: 'text-red-600' }
  }
  const scoreInfo = getScoreLabel(score)

  // Build breakdown
  const breakdown = signals.map(signal => ({
    ...signal,
    found: selectedIds.has(signal.id),
    isRedFlag: allRedFlagIds.has(signal.id)
  })).filter(s => s.isRedFlag)

  // Tips for missed items
  const missedSignals = signals.filter(s => missedIds.has(s.id))

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">TrustLens AI</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-[7fr_3fr] gap-8">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Scam Immunity Results</h1>

            {/* Message with reveal colors */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Message Analysis</h2>
              {challenge ? (
                <HighlightedText segments={segments} revealMode correctIds={correctIds} missedIds={missedIds} />
              ) : (
                <div className="h-40 bg-muted/30 rounded-xl animate-pulse" />
              )}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-800 inline-block" /> Correctly identified</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 dark:bg-red-800 inline-block" /> Missed red flag</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted inline-block" /> Normal text</span>
              </div>
            </div>

            {/* Breakdown */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
                <div className="space-y-3">
                  {breakdown.map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${item.found ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                      {item.found ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.category}</p>
                        <p className="text-xs text-muted-foreground truncate">&ldquo;{item.phrase}&rdquo;</p>
                      </div>
                      <span className={`text-xs font-semibold ${item.found ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.found ? 'Correct' : 'Missed'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips for missed */}
            {missedSignals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Personalized Tips
                </h2>
                {missedSignals.map((signal) => (
                  <Card key={signal.id} className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-foreground mb-1">
                        You missed: &ldquo;{signal.phrase}&rdquo;
                      </p>
                      <p className="text-sm text-muted-foreground">{signal.tip}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild size="lg" className="flex-1">
                <Link href="/immunity-mode">Try Another Challenge</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/education">View Full Safety Tips</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/analyze">Analyze New Message</Link>
              </Button>
            </div>
          </div>

          {/* Score Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <h3 className="font-semibold mb-4">Scam Immunity Score</h3>
                <div className="relative w-28 h-28 mb-3">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-muted" />
                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className={score >= 70 ? 'stroke-emerald-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500'} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{score}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${scoreInfo.color}`}>{scoreInfo.label}</p>
                <div className="mt-4 pt-4 border-t border-border w-full grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{correctIds.size}</p>
                    <p className="text-xs text-muted-foreground">Found</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{missedIds.size}</p>
                    <p className="text-xs text-muted-foreground">Missed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
