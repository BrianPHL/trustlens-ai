'use client'

import { Shield, ChevronLeft, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileHeaderProps {
  title?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function MobileHeader({ title = 'TrustLens AI', showBackButton = false, onBack }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mobile-safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  )
}
