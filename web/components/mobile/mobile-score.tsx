'use client'

import { CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SAMPLE_SIGNALS, SAMPLE_SEGMENTS } from '@/lib/scam-analyzer'

interface MobileScoreProps {
  selectedIds: Set<string>
  onTryAgain: () => void
  onGoHome: () => void
}

export function MobileScoreView({ selectedIds, onTryAgain, onGoHome }: MobileScoreProps) {
  const allRedFlagIds = new Set(
    SAMPLE_SEGMENTS.filter(s => s.isRedFlag && s.signalId).map(s => s.signalId!)
  )
  const correctIds = [...selectedIds].filter(id => allRedFlagIds.has(id))
  const missedIds = [...allRedFlagIds].filter(id => !selectedIds.has(id))
  const score = Math.round((correctIds.length / allRedFlagIds.size) * 100)

  const getLabel = (s: number) => {
    if (s >= 90) return 'Excellent'
    if (s >= 70) return 'Good Awareness'
    if (s >= 50) return 'Needs Caution'
    return 'Needs Practice'
  }

  const circumference = 2 * Math.PI * 46
  const offset = circumference - (score / 100) * circumference

  const breakdown = SAMPLE_SIGNALS.filter(s => allRedFlagIds.has(s.id))

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Score Header */}
      <div className="flex flex-col items-center text-center py-4">
        <div className="relative w-28 h-28 mb-3">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" strokeWidth="6" className="stroke-muted" />
            <circle cx="50" cy="50" r="46" fill="none" strokeWidth="6" className={score >= 70 ? 'stroke-emerald-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500'} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>
        <p className="text-lg font-semibold">{getLabel(score)}</p>
        <p className="text-sm text-muted-foreground">Scam Immunity Score</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{correctIds.length}</p>
            <p className="text-xs text-muted-foreground">Found</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{missedIds.length}</p>
            <p className="text-xs text-muted-foreground">Missed</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-semibold mb-3">Breakdown</p>
          {breakdown.map((signal) => {
            const found = selectedIds.has(signal.id)
            return (
              <div key={signal.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${found ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                {found ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                <span className="text-sm flex-1">{signal.category}</span>
                <span className={`text-xs font-medium ${found ? 'text-emerald-600' : 'text-red-600'}`}>{found ? 'Correct' : 'Missed'}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Tips */}
      {missedIds.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">Tips for improvement</p>
            {missedIds.map(id => {
              const signal = SAMPLE_SIGNALS.find(s => s.id === id)
              return signal ? (
                <p key={id} className="text-xs text-muted-foreground">{signal.tip}</p>
              ) : null
            })}
          </CardContent>
        </Card>
      )}

      <Button onClick={onTryAgain} className="w-full gap-2">
        <RotateCcw className="w-4 h-4" />
        Try Again
      </Button>
      <Button variant="outline" onClick={onGoHome} className="w-full">
        Back to Home
      </Button>
    </div>
  )
}
