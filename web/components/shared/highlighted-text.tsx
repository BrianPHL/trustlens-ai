'use client'

import type { TextSegment } from '@/lib/scam-analyzer'

interface HighlightedTextProps {
  segments: TextSegment[]
  interactive?: boolean
  selectedIds?: Set<string>
  revealMode?: boolean
  correctIds?: Set<string>
  missedIds?: Set<string>
  onSegmentClick?: (signalId: string) => void
}

export function HighlightedText({ 
  segments, 
  interactive = false,
  selectedIds = new Set(),
  revealMode = false,
  correctIds = new Set(),
  missedIds = new Set(),
  onSegmentClick 
}: HighlightedTextProps) {
  return (
    <div className="p-5 bg-muted/40 rounded-xl text-sm leading-relaxed border border-border/50 whitespace-pre-wrap">
      {segments.map((segment, index) => {
        if (!segment.isRedFlag || segment.type === 'normal') {
          // In reveal mode, gray out normal text slightly
          return (
            <span key={index} className={revealMode ? 'text-muted-foreground' : ''}>
              {segment.text}
            </span>
          )
        }

        // Reveal mode coloring
        if (revealMode && segment.signalId) {
          const isCorrect = correctIds.has(segment.signalId)
          const isMissed = missedIds.has(segment.signalId)
          
          if (isCorrect) {
            return (
              <span key={index} className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1 py-0.5 rounded font-medium border-b-2 border-emerald-400">
                {segment.text}
              </span>
            )
          }
          if (isMissed) {
            return (
              <span key={index} className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1 py-0.5 rounded font-medium border-b-2 border-red-400">
                {segment.text}
              </span>
            )
          }
        }

        // Interactive mode
        if (interactive && segment.signalId) {
          const isSelected = selectedIds.has(segment.signalId)
          return (
            <button
              key={index}
              onClick={() => onSegmentClick?.(segment.signalId!)}
              className={`
                px-1.5 py-0.5 rounded cursor-pointer transition-all duration-200 font-medium
                ${isSelected 
                  ? 'bg-primary/20 text-primary ring-2 ring-primary/40 scale-[1.02]' 
                  : 'bg-muted hover:bg-primary/10 hover:text-primary text-foreground'
                }
              `}
            >
              {segment.text}
            </button>
          )
        }

        // Static highlighted mode
        const highlightClass = {
          danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1 py-0.5 rounded',
          warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded',
          info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded',
          normal: ''
        }

        return (
          <span key={index} className={highlightClass[segment.type]}>
            {segment.text}
          </span>
        )
      })}
    </div>
  )
}
