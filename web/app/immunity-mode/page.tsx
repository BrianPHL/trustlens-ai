'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Target, Info, XCircle, Forward, Zap, AlertTriangle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HighlightedText } from '@/components/shared/highlighted-text'
import { getRandomChallenge, analyzeMessage, type AnalysisResult } from '@/lib/scam-analyzer'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)
const TOTAL_QUESTIONS = 10

const hints = [
  'Urgent or threatening language',
  'Shortened or unfamiliar links',
  'Requests for OTP, password, or PIN',
  'Account suspension threats',
  'Pressure to act without verifying',
  'Instructions not to tell anyone',
]

export default function ImmunityModePage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [challenges, setChallenges] = useState<AnalysisResult[]>([])
  const [allSelections, setAllSelections] = useState<string[][]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const generated: AnalysisResult[] = []
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const randomChallenge = getRandomChallenge()
      const analysis = analyzeMessage(randomChallenge.message)
      generated.push(analysis)
    }
    setChallenges(generated)
  }, [])

  const challenge = challenges[currentIndex] ?? null
  const segments = challenge?.segments || []
  const signals = challenge?.signals || []

  const redFlagSignalIds = new Set(
    segments.filter(s => s.isRedFlag && s.signalId).map(s => s.signalId!)
  )

  const handleSegmentClick = (signalId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(signalId)) next.delete(signalId)
      else next.add(signalId)
      return next
    })
  }

  const handleExit = () => {
    MySwal.fire({
      title: 'Exit Challenge?',
      text: 'Your progress will not be saved.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, Exit',
      cancelButtonText: 'Stay Here',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl px-6 py-3 font-bold',
        cancelButton: 'rounded-xl px-6 py-3 font-bold',
      },
    }).then((result) => {
      if (result.isConfirmed) router.push('/')
    })
  }

  const handleSkipQuestion = () => handleNext()

  const handleNext = () => {
    const updatedSelections = [...allSelections, [...selectedIds]]
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setAllSelections(updatedSelections)
      setSelectedIds(new Set())
      setCurrentIndex(prev => prev + 1)
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('trustlens-all-selections', JSON.stringify(updatedSelections))
        sessionStorage.setItem('trustlens-challenges', JSON.stringify(challenges))
        sessionStorage.setItem('trustlens-selected', JSON.stringify([...selectedIds]))
        sessionStorage.setItem('trustlens-challenge', JSON.stringify(challenge))
      }
      router.push('/immunity-reveal')
    }
  }

  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1
  const progress = (currentIndex / TOTAL_QUESTIONS) * 100
  const flagProgress = redFlagSignalIds.size > 0 ? (selectedIds.size / redFlagSignalIds.size) * 100 : 0

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              TrustLens <span className="text-primary">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/results" className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Results
            </Link>
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">

        {/* Hero Progress Banner */}
        <section className="relative rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary via-primary/90 to-indigo-600 p-6 md:p-8 text-white shadow-xl shadow-primary/20">
          <div className="absolute -right-12 -top-12 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/2 bottom-0 w-40 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight">
                  Scam Immunity Mode
                </h1>
                <p className="text-white/70 text-sm">Flag suspicious signals to build your score</p>
              </div>
            </div>
          </div>

          {/* Progress bar only — dots removed */}
          <div className="relative z-10">
            <div className="flex justify-between text-xs text-white/60 mb-2">
              <span className="font-semibold text-white/80">
                Question {currentIndex + 1} <span className="font-normal">of {TOTAL_QUESTIONS}</span>
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* Left: Challenge */}
          <div className="space-y-5">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Tap Suspicious Phrases
                </h2>
              </div>
              <button
                onClick={handleSkipQuestion}
                className="md:hidden flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border/60 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                <Forward className="w-3 h-3" /> Skip
              </button>
            </div>

            {/* Message card */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted-foreground font-medium">Suspicious Message</span>
                <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Unverified</span>
                </div>
              </div>

              <div className="p-5 md:p-6">
                {challenge ? (
                  <HighlightedText
                    segments={segments}
                    interactive
                    selectedIds={selectedIds}
                    onSegmentClick={handleSegmentClick}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="h-4 bg-muted/60 rounded-full w-full animate-pulse" />
                    <div className="h-4 bg-muted/60 rounded-full w-5/6 animate-pulse" />
                    <div className="h-4 bg-muted/60 rounded-full w-4/6 animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Tap or click any phrase in the message above to flag it as suspicious.
            </p>

            {/* Selected tags */}
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap gap-2">
                {[...selectedIds].map(id => {
                  const signal = signals.find(s => s.id === id)
                  if (!signal) return null
                  const IconComponent = (require('lucide-react') as any)[signal.icon] || AlertTriangle
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {signal.phrase}
                      <button
                        onClick={() => handleSegmentClick(id)}
                        className="ml-1 w-4 h-4 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-primary font-bold transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* CTA */}
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full h-14 font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow text-base gap-2"
            >
              {isLastQuestion ? (
                <><Zap className="w-4 h-4" /> Reveal Results</>
              ) : (
                <>Next Question <ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">

            {/* Live Progress */}
            <Card className="border-border/50 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Live Progress</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Q{currentIndex + 1}/{TOTAL_QUESTIONS}
                  </span>
                </div>

                {/* Score ring */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke="currentColor" strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - flagProgress / 100)}`}
                        strokeLinecap="round"
                        className="text-primary transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                      {selectedIds.size}
                      <span className="text-muted-foreground text-xs">/{redFlagSignalIds.size > 0 ? redFlagSignalIds.size : '?'}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Red flags found</p>
                    <p className="font-bold text-lg leading-tight">{selectedIds.size} flagged</p>
                    <p className="text-xs text-muted-foreground">
                      {redFlagSignalIds.size > 0 ? `${redFlagSignalIds.size} total signals` : 'Keep scanning'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                      style={{ width: `${flagProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(flagProgress)}% of signals found</p>
                </div>

                {/* Options */}
                <div className="pt-3 border-t border-border/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Options</p>
                  <button
                    onClick={handleSkipQuestion}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-colors"
                  >
                    <Forward className="w-4 h-4" /> Skip Question
                  </button>
                  <button
                    onClick={handleExit}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Exit Challenge
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Security Hints */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-sm">Security Hints</h3>
                </div>
                <ul className="space-y-2.5">
                  {hints.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Protection badge */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Training Mode</p>
                <p className="text-xs text-muted-foreground">Building your immunity score</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}