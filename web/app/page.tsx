'use client'

import { useState, useEffect } from 'react'
import { MobileApp } from '@/components/mobile/mobile-app'

import { HeroSection } from '@/components/hero-section'
import { FeaturesGrid } from '@/components/features-grid'
import { WebAnalyzeSection } from '@/components/web-analyze-section'
import { Footer } from '@/components/footer'
import { usePlatform } from '@/hooks/use-platform'

function AppContent() {
  const { isMobile, isNative } = usePlatform()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until client-side hydration
  if (!mounted) {
    return null
  }

  // For native apps or mobile view, show the mobile app
  if (isNative || isMobile) {
    return <MobileApp />
  }

  // Web view
  return (
    <div className="flex flex-col min-h-screen">
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
  return <AppContent />
}
