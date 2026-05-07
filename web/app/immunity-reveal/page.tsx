'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, CheckCircle, XCircle, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ImmunityRevealPage() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [questionStates, setQuestionStates] = useState<any[]>([])
  const [viewIndex, setViewIndex] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedChallenges = sessionStorage.getItem('trustlens-challenges')
    const storedResults = sessionStorage.getItem('trustlens-immunity-results')

    if (storedChallenges && storedResults) {
      try {
        setChallenges(JSON.parse(storedChallenges))
        const results = JSON.parse(storedResults)
        setQuestionStates(results.states)
        return
      } catch {}
    }
  }, [])

  const getQuestionStats = (index: number) => {
    const challenge = challenges[index]
    const state = questionStates[index]
    if (!challenge || !state) return null

    const segments = challenge.segments || []
    const signals = challenge.signals || []
    
    // Correct IDs are RedFlags that WERE selected
    const correctIndices = new Set([...state.selectedIndices].filter(idx => segments[idx]?.isRedFlag))
    // Missed IDs are RedFlags that were NOT selected
    const missedIndices = new Set(segments.map((s, idx) => s.isRedFlag ? idx : -1).filter(idx => idx !== -1 && !state.selectedIndices.has(idx)))
    
    const totalRedFlags = segments.filter(s => s.isRedFlag).length
    const score = totalRedFlags > 0 ? Math.round((state.correctlyFound / totalRedFlags) * 100) : 100
    
    return { 
      segments, 
      signals, 
      selectedIndices: state.selectedIndices, 
      correctIndices, 
      missedIndices, 
      score,
      totalRedFlags,
      correctlyFound: state.correctlyFound,
      incorrectlyClicked: state.incorrectlyClicked
    }
  }

  const aggregateStats = challenges.reduce(
    (acc, _, i) => {
      const q = getQuestionStats(i)
      if (!q) return acc
      return {
        totalCorrect: acc.totalCorrect + q.correctlyFound,
        totalMissed: acc.totalMissed + q.missedIndices.size,
        totalFlags: acc.totalFlags + q.totalRedFlags,
      }
    },
    { totalCorrect: 0, totalMissed: 0, totalFlags: 0 }
  )

  const overallScore = aggregateStats.totalFlags > 0
    ? Math.round((aggregateStats.totalCorrect / aggregateStats.totalFlags) * 100)
    : 0

  const getScoreLabel = (s: number) => {
    if (s >= 90) return { label: 'Excellent', color: 'text-emerald-600' }
    if (s >= 70) return { label: 'Good Awareness', color: 'text-blue-600' }
    if (s >= 50) return { label: 'Needs Caution', color: 'text-amber-600' }
    return { label: 'Needs Practice', color: 'text-red-600' }
  }

  const scoreInfo = getScoreLabel(overallScore)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (overallScore / 100) * circumference

  const current = getQuestionStats(viewIndex)
  const isLoading = challenges.length === 0

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
            <div>
              <h1 className="text-3xl font-bold">Scam Immunity Results</h1>
              <p className="text-muted-foreground mt-1">
                Across {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} — you caught{' '}
                <span className="font-semibold text-foreground">{aggregateStats.totalCorrect}</span> of{' '}
                <span className="font-semibold text-foreground">{aggregateStats.totalFlags}</span> red flags.
              </p>
            </div>

            {challenges.length > 1 && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewIndex(i => Math.max(0, i - 1))}
                  disabled={viewIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex gap-1.5 flex-wrap flex-1 justify-center">
                  {challenges.map((_, i) => {
                    const q = getQuestionStats(i)
                    const qScore = q?.score ?? 0
                    const dotColor =
                      qScore >= 70 ? 'bg-emerald-500' :
                      qScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    return (
                      <button
                        key={i}
                        onClick={() => setViewIndex(i)}
                        className={`w-8 h-8 rounded-full text-xs font-semibold transition-all border-2 ${
                          viewIndex === i
                            ? `${dotColor} text-white border-transparent scale-110`
                            : 'bg-muted text-muted-foreground border-transparent hover:border-primary'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewIndex(i => Math.min(challenges.length - 1, i + 1))}
                  disabled={viewIndex === challenges.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {current && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className={`text-2xl font-bold ${getScoreLabel(current.score).color}`}>
                  {current.score}%
                </div>
                <div>
                  <p className="text-sm font-medium">Question {viewIndex + 1}</p>
                  <p className="text-xs text-muted-foreground">
                    {current.correctlyFound} correct · {current.missedIndices.size} missed
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Message Analysis</h2>
              <div className="p-6 bg-muted/30 rounded-xl text-lg leading-relaxed">
                {current?.segments.map((segment: any, idx: number) => {
                  const isCorrect = current.correctIndices.has(idx)
                  const isMissed = current.missedIndices.has(idx)
                  const isIncorrect = current.selectedIndices.has(idx) && !segment.isRedFlag

                  let className = "transition-all duration-200 rounded px-1 "
                  if (isCorrect) className += "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-500 font-medium "
                  else if (isMissed) className += "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-b-2 border-amber-500 font-medium "
                  else if (isIncorrect) className += "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-b-2 border-red-500 font-medium "
                  else className += "text-muted-foreground"

                  return (
                    <span key={idx} className={className}>
                      {segment.text}
                    </span>
                  )
                })}
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-800 inline-block" />
                  Correctly identified
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-800 inline-block" />
                  Missed red flag
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-200 dark:bg-red-800 inline-block" />
                  False Alarm
                </span>
              </div>
            </div>

            {current && (
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Detailed Breakdown</h3>
                  <div className="space-y-3">
                    {current.signals.map((signal: any, i: number) => {
                      const isFound = [...current.correctIndices].some(idx => current.segments[idx]?.text.includes(signal.phrase) || signal.phrase.includes(current.segments[idx]?.text))
                      // Use a simpler approach to check if found: did they click any segment that overlaps with this signal?
                      // Actually, let's just use the signal list and see if they clicked the corresponding segments.
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 rounded-xl ${
                            isFound
                              ? 'bg-emerald-50 dark:bg-emerald-950/30'
                              : 'bg-amber-50 dark:bg-amber-950/30'
                          }`}
                        >
                          {isFound ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-amber-500 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{signal.category}</p>
                            <p className="text-xs text-muted-foreground truncate">&ldquo;{signal.phrase}&rdquo;</p>
                          </div>
                          <span className={`text-xs font-semibold ${isFound ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {isFound ? 'Correct' : 'Missed'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {current && current.missedIndices.size > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Personalized Tips
                </h2>
                {current.signals.filter((s: any) => ![...current.correctIndices].some(idx => current.segments[idx]?.text.includes(s.phrase))).map((signal: any) => (
                  <Card
                    key={signal.id}
                    className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
                  >
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

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild size="lg" className="flex-1">
                <Link href="/immunity-mode">Try Again</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/education">View Full Safety Tips</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/analyze">Analyze New Message</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <h3 className="font-semibold mb-1">Overall Immunity Score</h3>
                <p className="text-xs text-muted-foreground mb-4">Across all {challenges.length} questions</p>
                <div className="relative w-28 h-28 mb-3">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-muted" />
                    <circle
                      cx="60" cy="60" r="54" fill="none" strokeWidth="8"
                      className={overallScore >= 70 ? 'stroke-emerald-500' : overallScore >= 50 ? 'stroke-amber-500' : 'stroke-red-500'}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{overallScore}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${scoreInfo.color}`}>{scoreInfo.label}</p>
                <div className="mt-4 pt-4 border-t border-border w-full grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{aggregateStats.totalCorrect}</p>
                    <p className="text-xs text-muted-foreground">Total Found</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{aggregateStats.totalMissed}</p>
                    <p className="text-xs text-muted-foreground">Total Missed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Question Summary</h3>
                <div className="space-y-2">
                  {challenges.map((_, i) => {
                    const q = getQuestionStats(i)
                    if (!q) return null
                    const barColor =
                      q.score >= 70 ? 'bg-emerald-500' :
                      q.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    return (
                      <button
                        key={i}
                        onClick={() => setViewIndex(i)}
                        className={`w-full text-left group transition-all rounded-lg p-2 hover:bg-muted/50 ${viewIndex === i ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground font-medium">Q{i + 1}</span>
                          <span className={`font-semibold ${getScoreLabel(q.score).color}`}>{q.score}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-700`}
                            style={{ width: `${q.score}%` }} // FIXED
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}