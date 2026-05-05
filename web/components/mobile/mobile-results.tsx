'use client'

import { ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RiskBadge } from '@/components/shared/risk-badge'
import { DetectionFlag } from '@/components/shared/detection-flag'
import type { AnalysisResult } from '@/lib/scam-analyzer'

interface MobileResultsProps {
  result: AnalysisResult
  onStartImmunity: () => void
}

export function MobileResultsView({ result, onStartImmunity }: MobileResultsProps) {
  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Results</h1>
        <RiskBadge level={result.riskLevel} animated />
      </div>

      {/* Score */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Risk Score</p>
              <p className="text-4xl font-bold text-foreground">{result.riskScore}<span className="text-lg text-muted-foreground">/100</span></p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs">Scam {result.percentages.scam}%</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs">Suspicious {result.percentages.suspicious}%</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs">Safe {result.percentages.safe}%</span>
              </div>
            </div>
          </div>
          {/* Stacked bar */}
          <div className="h-3 rounded-full overflow-hidden bg-muted flex">
            <div className="h-full bg-red-500" style={{ width: `${result.percentages.scam}%` }} />
            <div className="h-full bg-amber-400" style={{ width: `${result.percentages.suspicious}%` }} />
            <div className="h-full bg-emerald-500" style={{ width: `${result.percentages.safe}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Signals */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Detected Signals</p>
        <div className="flex flex-wrap gap-2">
          {result.signals.map((s) => (
            <DetectionFlag key={s.id} label={s.label} category={s.category} icon={s.icon} severity={s.severity} compact />
          ))}
        </div>
      </div>

      {/* Explanation */}
      <Card className="border-border/50 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="p-4">
          <p className="text-sm text-foreground leading-relaxed">{result.explanation}</p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        {result.recommendedActions.slice(0, 3).map((action) => (
          <div key={action.number} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{action.number}</div>
            <div>
              <p className="text-sm font-medium text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onStartImmunity} className="w-full gap-2 h-12">
        Start Scam Immunity Mode
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
