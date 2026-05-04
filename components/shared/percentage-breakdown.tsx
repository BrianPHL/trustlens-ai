'use client'

import type { PercentageBreakdown } from '@/lib/scam-analyzer'

interface PercentageBreakdownProps {
  percentages: PercentageBreakdown
  animated?: boolean
}

export function PercentageBreakdownChart({ percentages, animated = true }: PercentageBreakdownProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground">Risk Distribution</h4>
      
      {/* Stacked bar */}
      <div className="relative h-4 rounded-full overflow-hidden bg-muted flex">
        <div 
          className="h-full bg-red-500 transition-all duration-1000 ease-out"
          style={{ width: `${percentages.scam}%` }}
        />
        <div 
          className="h-full bg-amber-400 transition-all duration-1000 ease-out delay-200"
          style={{ width: `${percentages.suspicious}%` }}
        />
        <div 
          className="h-full bg-emerald-500 transition-all duration-1000 ease-out delay-400"
          style={{ width: `${percentages.safe}%` }}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Scam</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{percentages.scam}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Suspicious</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{percentages.suspicious}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Safe</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{percentages.safe}%</p>
          </div>
        </div>
      </div>

      {/* Individual bars */}
      <div className="space-y-3">
        <BarItem label="Scam Indicators" value={percentages.scam} color="bg-red-500" textColor="text-red-600 dark:text-red-400" />
        <BarItem label="Suspicious Elements" value={percentages.suspicious} color="bg-amber-400" textColor="text-amber-600 dark:text-amber-400" />
        <BarItem label="Safe Content" value={percentages.safe} color="bg-emerald-500" textColor="text-emerald-600 dark:text-emerald-400" />
      </div>
    </div>
  )
}

function BarItem({ label, value, color, textColor }: { label: string; value: number; color: string; textColor: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-xs font-semibold ${textColor}`}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
