'use client'

import type { PercentageBreakdown } from '@/lib/scam-analyzer'

interface PercentageBreakdownProps {
  percentages: PercentageBreakdown
  animated?: boolean
}

export function PercentageBreakdownChart({ percentages, animated = true }: PercentageBreakdownProps) {
  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  
  // Calculate offsets for segments
  const scamOffset = circumference - (percentages.scam / 100) * circumference
  const suspiciousOffset = circumference - ((percentages.scam + percentages.suspicious) / 100) * circumference
  const safeOffset = 0 // Safe is the full background or the remaining

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Safe Segment (Base) */}
          <circle 
            cx={size / 2} cy={size / 2} r={radius} 
            fill="none" strokeWidth={strokeWidth} 
            className="stroke-emerald-500 transition-all duration-1000" 
          />
          {/* Suspicious Segment */}
          <circle 
            cx={size / 2} cy={size / 2} r={radius} 
            fill="none" strokeWidth={strokeWidth} 
            className="stroke-amber-400 transition-all duration-1000 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={suspiciousOffset}
          />
          {/* Scam Segment */}
          <circle 
            cx={size / 2} cy={size / 2} r={radius} 
            fill="none" strokeWidth={strokeWidth} 
            className="stroke-red-500 transition-all duration-1000 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={scamOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Risk</span>
          <span className="text-xl font-black text-foreground">{100 - percentages.safe}%</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 w-full">
        <h4 className="text-sm font-semibold text-foreground">Risk Distribution</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-4">
          <LegendItem label="Scam" value={percentages.scam} color="bg-red-500" />
          <LegendItem label="Suspicious" value={percentages.suspicious} color="bg-amber-400" />
          <LegendItem label="Safe" value={percentages.safe} color="bg-emerald-500" />
        </div>
      </div>
    </div>
  )
}

function LegendItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{label}</p>
        <p className="text-lg font-black text-foreground leading-none">{value}%</p>
      </div>
    </div>
  )
}
