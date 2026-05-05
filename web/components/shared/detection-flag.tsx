'use client'

import * as LucideIcons from 'lucide-react'
import type { SignalSeverity } from '@/lib/scam-analyzer'

interface DetectionFlagProps {
  label: string
  category: string
  icon: string
  severity: SignalSeverity
  compact?: boolean
}

const severityStyles = {
  critical: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  high: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  low: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
}

export function DetectionFlag({ label, category, icon, severity, compact = false }: DetectionFlagProps) {
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.AlertTriangle

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${severityStyles[severity]}`}>
        <IconComponent className="w-3.5 h-3.5" />
        <span>{category}</span>
      </span>
    )
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${severityStyles[severity]}`}>
      <IconComponent className="w-5 h-5 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{category}</p>
        <p className="text-xs opacity-80 mt-0.5">{label}</p>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mt-1">
        {severity}
      </span>
    </div>
  )
}

