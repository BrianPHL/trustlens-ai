'use client'

import { useState } from 'react'
import { Trophy, CheckCircle, XCircle, ArrowRight, RotateCcw, X, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { hapticFeedback, hapticNotification } from '@/lib/capacitor'
import { usePlatform } from '@/hooks/use-platform'
import { CHALLENGES } from '@/lib/scam-analyzer'

const TOTAL_QUESTIONS = 10
const SAFE_IDS = new Set(['legit-bank', 'legit-delivery'])

interface QuestionState {
  answered: boolean
  skipped: boolean
  userAnswer: boolean | null
  isCorrect: boolean | null
}

interface MobileChallengeProps {
  onNavigate: (tab: string) => void
  user: any
}

function buildQuestionSet() {
  const scams = CHALLENGES.filter(c => !SAFE_IDS.has(c.id))
  const safes = CHALLENGES.filter(c => SAFE_IDS.has(c.id))
  const shuffledScams = [...scams].sort(() => Math.random() - 0.5)
  const shuffledSafes = [...safes].sort(() => Math.random() - 0.5)
  const guaranteed = [...shuffledSafes.slice(0, 2), ...shuffledScams.slice(0, 8)]
  return guaranteed.sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS)
}

export function MobileChallengeView({ onNavigate, user }: MobileChallengeProps) {
  const [questions, setQuestions] = useState(() => buildQuestionSet())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [skipped, setSkipped] = useState(0)
  const [states, setStates] = useState<QuestionState[]>(() =>
    Array(TOTAL_QUESTIONS).fill(null).map(() => ({
      answered: false,
      skipped: false,
      userAnswer: null,
      isCorrect: null,
    }))
  )
  const [showResult, setShowResult] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const { isNative } = usePlatform()

  const currentChallenge = questions[currentIndex]
  const currentState = states[currentIndex]
  const isScam = !SAFE_IDS.has(currentChallenge?.id)
  const progress = (currentIndex / TOTAL_QUESTIONS) * 100

  const handleAnswer = async (answer: boolean) => {
    if (currentState.answered) return
    const isCorrect = answer === isScam
    if (isCorrect) {
      setScore(prev => prev + 1)
      if (isNative) await hapticNotification('success')
    } else {
      if (isNative) await hapticNotification('error')
    }
    setStates(prev => prev.map((s, i) =>
      i === currentIndex ? { ...s, answered: true, userAnswer: answer, isCorrect } : s
    ))
  }

  const handleSkip = async () => {
    if (currentState.answered || currentState.skipped) return
    if (isNative) await hapticFeedback('light')
    setSkipped(prev => prev + 1)
    setStates(prev => prev.map((s, i) =>
      i === currentIndex ? { ...s, skipped: true } : s
    ))
    goNext()
  }

  const goNext = () => {
    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
      setShowResult(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleNext = async () => {
    if (isNative) await hapticFeedback('light')
    goNext()
  }

  const handleRestart = async () => {
    if (isNative) await hapticFeedback('medium')
    setQuestions(buildQuestionSet())
    setCurrentIndex(0)
    setScore(0)
    setSkipped(0)
    setStates(Array(TOTAL_QUESTIONS).fill(null).map(() => ({
      answered: false, skipped: false, userAnswer: null, isCorrect: null,
    })))
    setShowResult(false)
  }

  const handleExitConfirm = async () => {
    if (isNative) await hapticFeedback('medium')
    setShowExitDialog(false)
    onNavigate('home')
  }

  if (showResult) {
    const overallPct = Math.round((score / TOTAL_QUESTIONS) * 100)
    const wrong = states.filter(s => s.answered && !s.isCorrect).length
    const CIRC = 2 * Math.PI * 54
    const ringOffset = CIRC - (overallPct / 100) * CIRC
    const ringColor = overallPct >= 70 ? '#22c55e' : overallPct >= 50 ? '#f59e0b' : '#ef4444'

    return (
      <div className="flex flex-col pb-24">
        <div className="px-5 pt-8 pb-6 flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: ringColor + '22', border: `2px solid ${ringColor}44` }}
          >
            <Trophy className="w-10 h-10" style={{ color: ringColor }} />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Challenge Complete!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {score} correct · {skipped} skipped · {wrong} wrong
            </p>
          </div>

          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-muted" />
              <circle
                cx="60" cy="60" r="54" fill="none" strokeWidth="8"
                stroke={ringColor}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={ringOffset}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{overallPct}%</span>
              <span className="text-xs text-muted-foreground font-mono">{score}/{TOTAL_QUESTIONS}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 px-4">
          {[
            { label: 'Correct', value: score, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Skipped', value: skipped, color: 'text-muted-foreground', bg: 'bg-muted/50' },
            { label: 'Wrong', value: wrong, color: 'text-destructive', bg: 'bg-destructive/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 flex flex-col items-center gap-0.5 border border-border/30`}>
              <span className={`text-2xl font-bold ${color}`}>{value}</span>
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        <div className="px-4 mt-5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Question Summary
          </p>
          <div className="flex flex-wrap gap-2">
            {states.map((s, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold
                  ${s.skipped
                    ? 'bg-muted text-muted-foreground'
                    : s.isCorrect
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : 'bg-destructive/15 text-destructive border border-destructive/30'
                  }`}
                title={s.skipped ? `Q${i+1}: Skipped` : s.isCorrect ? `Q${i+1}: Correct` : `Q${i+1}: Wrong`}
              >
                {s.skipped ? '–' : s.isCorrect ? '✓' : '✗'}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mt-5 p-4 rounded-2xl bg-muted/40 border border-border/40">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {overallPct >= 80
              ? '🎉 Excellent! You have strong scam detection skills!'
              : overallPct >= 60
              ? '👍 Good job! Keep practicing to sharpen your instincts.'
              : '📚 Keep learning — every practice session makes you safer.'}
          </p>
        </div>

        <div className="px-4 mt-5 flex flex-col gap-2">
          <Button onClick={handleRestart} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {!user && <LockedOverlay onNavigate={onNavigate} />}
      {showExitDialog && (
        <ExitDialog 
          currentIndex={currentIndex} 
          onExit={handleExitConfirm} 
          onCancel={() => setShowExitDialog(false)} 
        />
      )}

      <div className={`flex flex-col gap-4 p-4 pb-24 transition-all duration-700 ${!user ? 'blur-md grayscale-[0.3] select-none pointer-events-none' : ''}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Scam Challenge</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{score}/{TOTAL_QUESTIONS}</span>
              </div>
              <button
                onClick={() => setShowExitDialog(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/60 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors border border-border/40"
                title="Exit challenge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Question {currentIndex + 1} of {TOTAL_QUESTIONS}</span>
              <span>{skipped > 0 ? `${skipped} skipped · ` : ''}{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex gap-1 flex-wrap">
            {states.map((s, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-primary' :
                  s.skipped ? 'bg-muted-foreground/30' :
                  s.isCorrect === true ? 'bg-emerald-500' :
                  s.isCorrect === false ? 'bg-destructive' :
                  'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">Is this message a scam?</p>
              <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                {currentChallenge?.platform}
              </span>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-foreground leading-relaxed">
                {currentChallenge?.message}
              </p>
            </div>
            {currentChallenge?.difficulty && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Difficulty:</span>
                <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                  currentChallenge.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-600' :
                  currentChallenge.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {currentChallenge.difficulty}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {!currentState.answered && !currentState.skipped && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAnswer(true)}
              className="h-16 border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
            >
              <div className="flex flex-col items-center gap-1">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium">It&apos;s a Scam</span>
              </div>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleAnswer(false)}
              className="h-16 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500"
            >
              <div className="flex flex-col items-center gap-1">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">It&apos;s Safe</span>
              </div>
            </Button>
          </div>
        )}

        {currentState.answered && (
          <Card className={`border-2 ${currentState.isCorrect ? 'border-emerald-500 bg-emerald-500/5' : 'border-destructive bg-destructive/5'}`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                {currentState.isCorrect ? (
                  <><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="font-semibold text-emerald-600">Correct!</span></>
                ) : (
                  <><XCircle className="w-5 h-5 text-destructive" /><span className="font-semibold text-destructive">Incorrect</span></>
                )}
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  This was {isScam ? 'a scam' : 'safe'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isScam
                  ? `"${currentChallenge.title}" — This message contains scam patterns. Always verify through official channels.`
                  : `"${currentChallenge.title}" — This appears to be a legitimate message with no major red flags.`
                }
              </p>
            </CardContent>
          </Card>
        )}

        {currentState.skipped && (
          <Card className="border-2 border-muted bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Skipped. This was <span className="font-semibold text-foreground">{isScam ? 'a scam' : 'safe'}</span>.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-2">
          {(currentState.answered || currentState.skipped) && (
            <Button onClick={handleNext} className="w-full gap-2">
              {currentIndex + 1 >= TOTAL_QUESTIONS ? 'See Results' : 'Next Question'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {!currentState.answered && !currentState.skipped && (
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Skip Scam Challenge
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Locked Overlay (Blur Pattern) ──────────────────────────────
function LockedOverlay({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm"
      >
        <Card className="border-primary/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-background/95 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <div className="h-1.5 w-full bg-primary/70" />
          <CardContent className="p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[2rem] bg-primary/10 text-primary">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Challenge Locked</h2>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Sign in to start the Scam Immunity challenge and build your personal trust score.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => window.location.href = '/login'} className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20">
                Sign In to Play
              </Button>
              <button onClick={() => onNavigate('home')} className="text-sm text-muted-foreground font-semibold hover:text-primary transition-colors">
                Back to Home
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ── Exit dialog overlay ─────────────────────────────────────────
function ExitDialog({ currentIndex, onExit, onCancel }: { currentIndex: number; onExit: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div className="w-full max-w-sm bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden">
        <div className="h-1 w-full bg-destructive/70" />
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Exit Challenge?</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Your progress will be lost and you'll need to start over. Are you sure you want to exit?
              </p>
            </div>
          </div>

          <div className="bg-muted/40 rounded-xl p-3 flex items-center justify-between text-sm border border-border/30">
            <span className="text-muted-foreground">Progress so far</span>
            <span className="font-semibold text-foreground">
              {currentIndex} / {TOTAL_QUESTIONS} questions
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={onExit}
              variant="destructive"
              className="w-full"
            >
              Yes, Exit Challenge
            </Button>
            <button
              onClick={onCancel}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              No, Keep Going
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
