'use client'

interface ExplanationCardProps {
  title: string
  explanation: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
}

const variants = {
  default: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  danger: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
}

export function ExplanationCard({ title, explanation, variant = 'default' }: ExplanationCardProps) {
  return (
    <div className={`p-4 rounded-xl border ${variants[variant]}`}>
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-sm opacity-90 leading-relaxed">{explanation}</p>
    </div>
  )
}
