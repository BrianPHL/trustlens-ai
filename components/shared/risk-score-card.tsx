'use client'

import type { RiskLevel } from '@/lib/scam-analyzer'

interface RiskScoreCardProps {
  score: number
  level: RiskLevel
  signalCount: number
  confidence?: number
}

const levelConfig = {
  high: { label: 'High Risk', color: 'text-red-600 dark:text-red-400', ring: 'stroke-red-500', bg: 'bg-red-500' },
  medium: { label: 'Medium Risk', color: 'text-amber-600 dark:text-amber-400', ring: 'stroke-amber-500', bg: 'bg-amber-500' },
  low: { label: 'Low Risk', color: 'text-emerald-600 dark:text-emerald-400', ring: 'stroke-emerald-500', bg: 'bg-emerald-500' }
}

export function RiskScoreCard({ score, level, signalCount, confidence }: RiskScoreCardProps) {
  const c = levelConfig[level]
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk Assessment</p>
          <h3 className={`text-2xl font-bold ${c.color}`}>{c.label}</h3>
        </div>
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-muted" />
            <circle 
              cx="60" cy="60" r="54" fill="none" strokeWidth="8" 
              className={c.ring}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${c.bg}`} />
          <span className="text-sm text-muted-foreground">
            Detected Scam Signals: <strong className="text-foreground">{signalCount}</strong>
          </span>
        </div>
        {confidence !== undefined && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              Confidence: <strong className="text-foreground">{confidence}%</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
