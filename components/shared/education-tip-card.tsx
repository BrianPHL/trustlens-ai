'use client'

import * as LucideIcons from 'lucide-react'
import { CheckCircle } from 'lucide-react'

interface EducationTipCardProps {
  title: string
  icon: string
  description: string
  examples: string[]
  whatToDo: string[]
}

export function EducationTipCard({ title, icon, description, examples, whatToDo }: EducationTipCardProps) {
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Info

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/30">
        <IconComponent className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {/* Examples */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Example phrases:</p>
          <div className="space-y-2">
            {examples.map((example, i) => (
              <div key={i} className="px-3 py-2.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What to do */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">What to do instead:</p>
          <div className="space-y-2">
            {whatToDo.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

