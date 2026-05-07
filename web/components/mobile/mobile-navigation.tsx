'use client'

import { Home, Scan, Trophy, History, User } from 'lucide-react'
import { hapticFeedback } from '@/lib/capacitor'
import { usePlatform } from '@/hooks/use-platform'
import { motion } from 'framer-motion'

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 group outline-none"
            >
              {/* Active Background Pill Effect */}
              {isActive && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute inset-x-2 inset-y-1 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div className={`relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-active:scale-95'}`}>
                <tab.icon 
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? 'text-primary stroke-[2.5px]' : 'text-muted-foreground'
                  }`} 
                />
              </div>

              <span className={`relative z-10 text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
