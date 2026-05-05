'use client'

import type { RiskLevel } from '@/lib/scam-analyzer'
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'

interface RiskScoreCardProps {
  score: number
  level: RiskLevel
  signalCount: number
  confidence?: number
}

const levelConfig = {
  high: { 
    label: 'High Risk', 
    color: 'text-red-500', 
    ring: 'stroke-red-500', 
    bg: 'bg-red-500/10',
    icon: ShieldAlert,
    shadow: 'shadow-red-500/20'
  },
  medium: { 
    label: 'Medium Risk', 
    color: 'text-amber-500', 
    ring: 'stroke-amber-500', 
    bg: 'bg-amber-500/10',
    icon: AlertTriangle,
    shadow: 'shadow-amber-500/20'
  },
  low: { 
    label: 'Safe / Low Risk', 
    color: 'text-emerald-500', 
    ring: 'stroke-emerald-500', 
    bg: 'bg-emerald-500/10',
    icon: ShieldCheck,
    shadow: 'shadow-emerald-500/20'
  }
}

export function RiskScoreCard({ score, level, signalCount, confidence }: RiskScoreCardProps) {
  const c = levelConfig[level]
  const Icon = c.icon
  const size = 180
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-xl ${c.shadow}`}>
      {/* Background glow */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] opacity-20 ${level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Circular Chart */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle */}
            <circle 
              cx={size / 2} cy={size / 2} r={radius} 
              fill="none" strokeWidth={strokeWidth} 
              className="stroke-muted opacity-30" 
            />
            {/* Progress circle */}
            <circle 
              cx={size / 2} cy={size / 2} r={radius} 
              fill="none" strokeWidth={strokeWidth} 
              className={`${c.ring} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-foreground">{score}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Score</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Icon className={`w-6 h-6 ${c.color}`} />
              <h3 className={`text-3xl font-black tracking-tight ${c.color}`}>{c.label}</h3>
            </div>
            <p className="text-muted-foreground text-lg">
              TrustLens has completed its analysis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl ${c.bg} border border-white/5`}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Signals</p>
              <p className="text-2xl font-bold text-foreground">{signalCount}</p>
              <p className="text-[10px] text-muted-foreground">Detected flags</p>
            </div>
            {confidence !== undefined && (
              <div className="p-4 rounded-2xl bg-muted/50 border border-white/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-2xl font-bold text-foreground">{confidence}%</p>
                <p className="text-[10px] text-muted-foreground">AI reliability</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
