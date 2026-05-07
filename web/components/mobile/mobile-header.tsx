'use client'

import { Shield, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileHeaderProps {
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  // onNavigate removed as it's no longer used here
}

export function MobileHeader({ 
  title = 'TrustLens AI', 
  showBackButton = false, 
  onBack 
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
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
          <span className="font-bold text-foreground tracking-tight">{title}</span>
        </div>
        
        {/* Right side is now empty to prevent the duplicate icons shown in image_930912.png */}
        <div className="flex items-center w-10" /> 
      </div>
    </header>
  )
}
