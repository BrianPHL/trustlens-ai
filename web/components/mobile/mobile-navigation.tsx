'use client'

import { Home, Scan, Trophy, History, User } from 'lucide-react'
import { hapticFeedback } from '@/lib/capacitor'
import { usePlatform } from '@/hooks/use-platform'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'scan', icon: Scan, label: 'Scan' },
  { id: 'challenge', icon: Trophy, label: 'Challenge' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'profile', icon: User, label: 'Profile' },
]

export function MobileNavigation({ activeTab, onTabChange }: MobileNavProps) {
  const { isNative } = usePlatform()

  const handleTabPress = async (tabId: string) => {
    if (isNative) {
      await hapticFeedback('light')
    }
    onTabChange(tabId)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border mobile-safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
