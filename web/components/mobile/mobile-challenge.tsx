'use client'

import { useState } from 'react'
import { Trophy, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { hapticFeedback, hapticNotification } from '@/lib/capacitor'
import { usePlatform } from '@/hooks/use-platform'

interface Challenge {
  id: number
  message: string
  isScam: boolean
  explanation: string
}

const challenges: Challenge[] = [
  {
    id: 1,
    message: "Hi! Your BDO account has been temporarily locked due to unusual activity. Please verify your identity at bit.ly/bdo-verify-now to restore access. Failure to do so within 24 hours will result in permanent suspension.",
    isScam: true,
    explanation: "This is a scam. Real banks never send verification links via text. The shortened URL and urgency are red flags."
  },
  {
    id: 2,
    message: "Your Grab order #12345 is on the way! Driver: Juan (★4.9). Track your delivery in the Grab app.",
    isScam: false,
    explanation: "This is legitimate. It has a real order number, driver info, and directs you to the official app rather than a link."
  },
  {
    id: 3,
    message: "CONGRATULATIONS! You've been selected as today's winner of ₱500,000! Reply YES and send ₱1,000 processing fee to claim your prize.",
    isScam: true,
    explanation: "Classic scam pattern. Legitimate lotteries never require upfront fees, and you can't win what you didn't enter."
  },
  {
    id: 4,
    message: "Your Globe bill for June is ₱1,234.56. Due date: July 15. Pay via GCash, Maya, or visit globe.com.ph. Thank you!",
    isScam: false,
    explanation: "This appears legitimate. It has specific bill details and directs to official payment channels, not suspicious links."
  },
  {
    id: 5,
    message: "URGENT: Your GCash PIN will expire today! Verify now to avoid account deactivation. Enter your current PIN here: [link]",
    isScam: true,
    explanation: "Scam alert! PINs don't expire, and no legitimate service asks for your PIN via message. This is credential phishing."
  }
]

export function MobileChallengeView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const { isNative } = usePlatform()

  const currentChallenge = challenges[currentIndex]
  const progress = ((currentIndex + (answered ? 1 : 0)) / challenges.length) * 100
  const isComplete = currentIndex >= challenges.length

  const handleAnswer = async (answer: boolean) => {
    if (answered) return

    setUserAnswer(answer)
    setAnswered(true)

    const isCorrect = answer === currentChallenge.isScam

    if (isCorrect) {
      setScore(prev => prev + 1)
      if (isNative) await hapticNotification('success')
    } else {
      if (isNative) await hapticNotification('error')
    }
  }

  const handleNext = async () => {
    if (isNative) await hapticFeedback('light')
    
    if (currentIndex + 1 >= challenges.length) {
      setShowResult(true)
    } else {
      setCurrentIndex(prev => prev + 1)
      setAnswered(false)
      setUserAnswer(null)
    }
  }

  const handleRestart = async () => {
    if (isNative) await hapticFeedback('medium')
    setCurrentIndex(0)
    setScore(0)
    setAnswered(false)
    setUserAnswer(null)
    setShowResult(false)
  }

  if (showResult) {
    const percentage = Math.round((score / challenges.length) * 100)
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-4 pb-24 min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Challenge Complete!</h1>
          <p className="text-lg text-muted-foreground">
            You scored {score} out of {challenges.length}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-semibold text-foreground">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>

        <div className="text-center p-4 bg-muted rounded-xl max-w-xs">
          <p className="text-sm text-muted-foreground">
            {percentage >= 80 
              ? "🎉 Excellent! You have strong scam detection skills!"
              : percentage >= 60
              ? "👍 Good job! Keep practicing to improve."
              : "📚 Keep learning! Practice makes perfect."}
          </p>
        </div>

        <Button onClick={handleRestart} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Scam Challenge</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{score}/{challenges.length}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Question {currentIndex + 1} of {challenges.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">Is this message a scam?</p>
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-foreground leading-relaxed">
              {currentChallenge.message}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Answer Buttons */}
      {!answered ? (
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
            className="h-16 border-success/30 hover:bg-success/10 hover:border-success"
          >
            <div className="flex flex-col items-center gap-1">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">It&apos;s Safe</span>
            </div>
          </Button>
        </div>
      ) : (
        <Card className={`border-2 ${userAnswer === currentChallenge.isScam ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              {userAnswer === currentChallenge.isScam ? (
                <>
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-semibold text-success">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  <span className="font-semibold text-destructive">Incorrect</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentChallenge.explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {answered && (
        <Button onClick={handleNext} className="gap-2">
          {currentIndex + 1 >= challenges.length ? 'See Results' : 'Next Question'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
