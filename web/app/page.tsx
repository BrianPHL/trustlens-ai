'use client'

import { useState, useEffect } from 'react'
import { PlatformProvider, usePlatform } from '@/hooks/use-platform'
import { SplashScreenView } from '@/components/splash-screen'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { FeaturesGrid } from '@/components/features-grid'
import { HowItWorksSection, ScamImmunitySection } from '@/components/web-sections'
import { WebAnalyzeSection } from '@/components/web-analyze-section'
import { Footer } from '@/components/footer'
import { MobileApp } from '@/components/mobile/mobile-app'

function AppContent() {
  const { isMobile, isNative } = usePlatform()
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // For web, show splash briefly then hide
    if (!isNative) {
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isNative])

  // Don't render anything until client-side hydration
  if (!mounted) {
    return <SplashScreenView />
  }

  // For native apps or mobile view, show the mobile app
  if (isNative || isMobile) {
    return <MobileApp />
  }

  // Show splash screen on initial load (web only)
  if (showSplash) {
    return (
      <div className={showSplash ? '' : 'splash-fade-out'}>
        <SplashScreenView />
      </div>
    )
  }

  // Web view
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <WebAnalyzeSection />
      </main>
      <Footer />
    </div>
  )
}

export default function HomePage() {
  return (
    <PlatformProvider>
      <AppContent />
    </PlatformProvider>
  )
}
