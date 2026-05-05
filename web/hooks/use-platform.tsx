'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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
    isNative: false,
    platform: 'web',
    isIOS: false,
    isAndroid: false,
    isWeb: true,
    isMobile: false
  })

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        return window.innerWidth < 768 || isNativePlatform()
      }
      return false
    }

    setPlatformInfo({
      isNative: isNativePlatform(),
      platform: getPlatform(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isWeb: isWeb(),
      isMobile: checkMobile()
    })

    const handleResize = () => {
      setPlatformInfo(prev => ({
        ...prev,
        isMobile: checkMobile()
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <PlatformContext.Provider value={platformInfo}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  return useContext(PlatformContext)
}
