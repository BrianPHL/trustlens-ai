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
export default function ImmunityModePage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [challenges, setChallenges] = useState<any[]>([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [states, setStates] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      setUser(session?.user ?? null)
      setIsGuest(!session?.user)

      const generated: any[] = []
      const initialStates: any[] = []

      for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        const randomChallenge = getRandomChallenge()
        const res = analyzeMessage(randomChallenge.message)
        
        // Inject distractors
        const newSegments = [...res.segments]
        let distractorCount = 0
        for (let j = 0; j < newSegments.length && distractorCount < 2; j++) {
          if (!newSegments[j].isRedFlag && newSegments[j].text.length > 25) {
            const words = newSegments[j].text.trim().split(/\s+/)
            if (words.length > 6) {
              const start = Math.floor(Math.random() * (words.length - 3))
              const distractorText = words.slice(start, start + 2).join(' ')
              const before = words.slice(0, start).join(' ')
              const after = words.slice(start + 2).join(' ')
              
              const injected: any[] = []
              if (before) injected.push({ text: before + ' ', type: 'normal', isRedFlag: false })
              injected.push({ text: distractorText, type: 'normal', isRedFlag: false, isDistractor: true })
              if (after) injected.push({ text: ' ' + after, type: 'normal', isRedFlag: false })
              
              newSegments.splice(j, 1, ...injected)
              distractorCount++
              j += injected.length - 1
            }
          }
        }
        
        generated.push({ ...res, segments: newSegments })
        initialStates.push({
          answered: false,
          selectedIndices: new Set(),
          correctlyFound: 0,
          incorrectlyClicked: 0,
          isCorrect: null
        })
      }
      setChallenges(generated)
      setStates(initialStates)
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
  const currentState = states[currentIndex]
  const totalRedFlags = challenge?.segments?.filter((s: any) => s.isRedFlag).length || 0

  const handleSegmentClick = (index: number) => {
    if (currentState.answered) return
    
    const segment = challenge.segments[index]
    if (!segment.isRedFlag && !segment.isDistractor) return
    if (currentState.selectedIndices.has(index)) return

    const isCorrect = segment.isRedFlag
    
    setStates(prev => prev.map((s, i) => {
      if (i !== currentIndex) return s
      const newSelected = new Set(s.selectedIndices)
      newSelected.add(index)
      
      return { 
        ...s, 
        selectedIndices: newSelected, 
        correctlyFound: isCorrect ? s.correctlyFound + 1 : s.correctlyFound,
        incorrectlyClicked: !isCorrect ? s.incorrectlyClicked + 1 : s.incorrectlyClicked
      }
    }))
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

  const handleSkipQuestion = () => {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleNext()
    }
  }

  const handleNext = () => {
    if (!currentState.answered) {
      const isCorrect = (totalRedFlags === 0 && currentState.incorrectlyClicked === 0) || 
                        (totalRedFlags > 0 && currentState.correctlyFound > 0 && currentState.incorrectlyClicked === 0)
      
      if (isCorrect) setScore(prev => prev + 1)
      
      setStates(prev => prev.map((s, i) => 
        i === currentIndex ? { ...s, answered: true, isCorrect } : s
      ))
      return
    }

    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(prev => prev+1)
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('trustlens-challenges', JSON.stringify(challenges))
        sessionStorage.setItem('trustlens-immunity-results', JSON.stringify({
          score: score,
          total: TOTAL_QUESTIONS,
          states: states
        }))
      }
      router.push('/immunity-reveal')
    }
  }

  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1
  const progress = (currentIndex / TOTAL_QUESTIONS) * 100
  const flagProgress = totalRedFlags > 0 ? (currentState.correctlyFound / totalRedFlags) * 100 : 0

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                <p className="text-white/70 text-sm">Identify all scam signals to build your immunity score</p>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
               {states.map((s, i) => (
                 <div key={i} className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-white scale-125' : s.answered ? (s.isCorrect ? 'bg-emerald-400' : 'bg-red-400') : 'bg-white/30'}`} />
               ))}
            </div>
          </div>

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

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Flag all Red Flags
                </h2>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted-foreground font-medium">{challenge?.platform || 'Message'} Analysis</span>
              </div>

              <div className="p-6 text-lg leading-relaxed">
                {challenge?.segments.map((segment: any, idx: number) => {
                  const isClickable = segment.isRedFlag || segment.isDistractor
                  const isSelected = currentState.selectedIndices.has(idx)
                  
                  let className = "transition-all duration-200 rounded px-1 "
                  let style = {}

                  if (isSelected || currentState.answered) {
                    if (segment.isRedFlag) {
                      className += "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-500 font-medium "
                    } else if (segment.isDistractor) {
                      className += "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-b-2 border-red-500 font-medium "
                    }
                  } else if (isClickable) {
                    className += "cursor-pointer hover:bg-primary/5 border-b border-dashed border-primary/30 "
                  }

                  return (
                    <span
                      key={idx}
                      onClick={() => handleSegmentClick(idx)}
                      className={className}
                    >
                      {segment.text}
                    </span>
                  )
                })}
              </div>
              
              {currentState.answered && (
                <div className={`mx-6 mb-6 p-4 rounded-xl flex items-start gap-3 ${currentState.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200' : 'bg-red-50 dark:bg-red-900/10 border border-red-200'}`}>
                  {currentState.isCorrect ? <Zap className="w-5 h-5 text-emerald-500 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                  <div>
                    <p className={`font-bold text-sm ${currentState.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                      {currentState.isCorrect ? 'Excellent Analysis!' : 'Analysis Incomplete'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalRedFlags > 0 
                        ? `This message contained ${totalRedFlags} red flags related to ${challenge.signals.map((s: any) => s.category.toLowerCase()).join(' and ')}.`
                        : "Correct! This was a safe message with no scam indicators."
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleNext}
                size="lg"
                className="flex-1 h-14 font-bold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-shadow text-base gap-2"
              >
                {!currentState.answered ? 'Confirm Selections' : (isLastQuestion ? 'View Final Report' : 'Next Challenge')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <Card className="border-border/50 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Live Progress</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Score: {score}
                  </span>
                </div>

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
                      {currentState.correctlyFound}
                      <span className="text-muted-foreground text-xs">/{totalRedFlags}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Flags Found</p>
                    <p className="font-bold text-lg leading-tight">{currentState.correctlyFound} caught</p>
                    <p className="text-xs text-red-500 font-medium">
                      {currentState.incorrectlyClicked} false alarms
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Options</p>
                  <button
                    onClick={handleSkipQuestion}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-colors"
                  >
                    <Forward className="w-4 h-4" /> Skip Challenge
                  </button>
                  <button
                    onClick={handleExit}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Exit Mode
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-sm">Immunity Tips</h3>
                </div>
                <ul className="space-y-2.5">
                  {hints.slice(0, 4).map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
        </div>
      </main>
    </div>
  )
}