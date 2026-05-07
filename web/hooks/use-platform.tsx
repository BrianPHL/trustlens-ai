'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { isNativePlatform, getPlatform, isIOS, isAndroid, isWeb } from '@/lib/capacitor'

interface PlatformContextType {
  isNative: boolean
  platform: string
  isIOS: boolean
  isAndroid: boolean
  isWeb: boolean
  isMobile: boolean
}

const PlatformContext = createContext<PlatformContextType>({
  isNative: false,
  platform: 'web',
  isIOS: false,
  isAndroid: false,
  isWeb: true,
  isMobile: false
})

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platformInfo, setPlatformInfo] = useState<PlatformContextType>({
    isNative: isNativePlatform(),
    platform: getPlatform(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isWeb: isWeb(),
    isMobile: false // Will be updated in useEffect
  })

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 768 || isNativePlatform()
      }
      return false
    }

    // Initial check
    const currentIsMobile = checkMobile()
    setPlatformInfo(prev => ({
      ...prev,
      isMobile: currentIsMobile
    }))

    const handleResize = () => {
      const newIsMobile = checkMobile()
      setPlatformInfo(prev => {
        if (prev.isMobile === newIsMobile) return prev
        return { ...prev, isMobile: newIsMobile }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const value = useMemo(() => platformInfo, [platformInfo])

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  return useContext(PlatformContext)
}
