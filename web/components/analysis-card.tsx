'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Link as LinkIcon, Key } from 'lucide-react'

interface HighlightedText {
  text: string
  type: 'danger' | 'warning' | 'normal'
}

const analysisText: HighlightedText[] = [
  { text: 'Your GCash account will be suspended today', type: 'danger' },
  { text: ' due to suspicious activity. ', type: 'normal' },
  { text: 'Verify your identity immediately', type: 'warning' },
  { text: ' using this link: ', type: 'normal' },
  { text: 'bit.ly/gcash-secure-login', type: 'danger' },
  { text: '. Do not share this warning. ', type: 'normal' },
  { text: 'Enter your OTP', type: 'danger' },
  { text: ' to continue.', type: 'normal' },
]

const riskIndicators = [
  { icon: AlertTriangle, label: 'Urgency Manipulation', color: 'text-destructive' },
  { icon: LinkIcon, label: 'Suspicious Link', color: 'text-destructive' },
  { icon: Key, label: 'OTP Request', color: 'text-destructive' },
]

export function AnalysisCard() {
  return (
    <Card className="w-full max-w-md shadow-lg border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium text-destructive">High Risk</span>
          </div>
          <span className="text-xs text-muted-foreground">Analysis Complete</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analyzed Message */}
        <div className="p-4 bg-muted/50 rounded-xl text-sm leading-relaxed">
          {analysisText.map((segment, index) => {
            if (segment.type === 'danger') {
              return (
                <span
                  key={index}
                  className="bg-destructive/15 text-destructive px-1 py-0.5 rounded highlight-pulse"
                >
                  {segment.text}
                </span>
              )
            }
            if (segment.type === 'warning') {
              return (
                <span
                  key={index}
                  className="bg-warning/20 text-warning-foreground px-1 py-0.5 rounded"
                >
                  {segment.text}
                </span>
              )
            }
            return <span key={index}>{segment.text}</span>
          })}
        </div>

        {/* Risk Indicators */}
        <div className="space-y-2">
          {riskIndicators.map((indicator, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full" />
              <indicator.icon className={`w-4 h-4 ${indicator.color}`} />
              <span className="text-sm text-foreground">{indicator.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button variant="outline" className="w-full">
          View Explanation
        </Button>
      </CardContent>
    </Card>
  )
}
