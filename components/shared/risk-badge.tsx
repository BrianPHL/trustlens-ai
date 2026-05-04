'use client'

import { AlertTriangle, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import type { RiskLevel } from '@/lib/scam-analyzer'

interface RiskBadgeProps {
  level: RiskLevel
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  animated?: boolean
}

const config = {
  high: {
    label: 'High Risk',
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
    Icon: AlertTriangle
  },
  medium: {
    label: 'Medium Risk',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    Icon: AlertCircle
  },
  low: {
    label: 'Low Risk',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    Icon: CheckCircle
  }
}

const sizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export function RiskBadge({ level, size = 'md', showIcon = true, animated = false }: RiskBadgeProps) {
  const c = config[level]
  const Icon = c.Icon

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border} ${sizes[size]}`}>
      {animated && (
        <div className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
      )}
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{c.label}</span>
    </div>
  )
}
