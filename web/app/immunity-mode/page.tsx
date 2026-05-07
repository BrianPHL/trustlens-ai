'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Target, Info, XCircle, Forward, Zap, AlertTriangle, ChevronRight, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HighlightedText } from '@/components/shared/highlighted-text'
import { getRandomChallenge, analyzeMessage, type AnalysisResult } from '@/lib/scam-analyzer'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

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

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      setUser(session?.user ?? null)
      setIsGuest(!session?.user)

      const generated: AnalysisResult[] = []
      for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const randomChallenge = getRandomChallenge()
        const analysis = analyzeMessage(randomChallenge.message)
        generated.push(analysis)
      }
      setChallenges(generated)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p className="animate-pulse tracking-widest uppercase text-xs font-bold">Securing session...</p>
      </div>
    )
  }

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


      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 relative">
        
        {isGuest && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-start pt-40 px-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-[440px]"
            >
              <Card className="border-primary/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-background/95 backdrop-blur-xl">
                <CardContent className="p-8 md:p-10 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6 text-primary">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">Challenge Locked</h3>
                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed px-2 font-medium">
                    Scam Immunity Challenge is a premium feature. Sign in to test your skills and track your progress in real-time.
                  </p>
                  <div className="flex flex-col gap-4">
                    <Button asChild size="lg" className="w-full h-12 text-md font-bold shadow-md shadow-primary/20">
                      <Link href="/login?next=/immunity-mode">Unlock Challenge</Link>
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log In</Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        <div className={`space-y-8 transition-all duration-700 ${isGuest ? 'opacity-40 blur-md select-none pointer-events-none grayscale-[0.2]' : ''}`}>


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
                  const IconComponent = (LucideIcons as any)[signal.icon] || AlertTriangle
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
        </div>
      </main>
    </div>
  )
}