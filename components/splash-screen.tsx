'use client'

import { Shield } from 'lucide-react'

interface SplashScreenProps {
  onComplete?: () => void
}

export function SplashScreenView({ onComplete }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary">
      <div className="flex flex-col items-center gap-6 animate-pulse-shield">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-foreground/20 rounded-full blur-xl scale-150" />
          <div className="relative bg-primary-foreground/10 p-6 rounded-full">
            <Shield className="w-20 h-20 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-foreground tracking-tight">
            TrustLens AI
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-2">
            Scam Immunity Assistant
          </p>
        </div>
      </div>
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-primary-foreground/60 text-xs">Loading...</p>
      </div>
    </div>
  )
}
