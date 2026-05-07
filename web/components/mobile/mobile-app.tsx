'use client'

import { useState, useEffect } from 'react'
import { usePlatform } from '@/hooks/use-platform'
import { hideSplashScreen, setStatusBarStyle, setStatusBarColor } from '@/lib/capacitor'
import { SplashScreenView } from '@/components/splash-screen'
import { MobileHeader } from '@/components/mobile/mobile-header'
import { MobileNavigation } from '@/components/mobile/mobile-navigation'
import { MobileHomeView } from '@/components/mobile/mobile-home'
import { MobileScanView } from '@/components/mobile/mobile-scan'
import { MobileChallengeView } from '@/components/mobile/mobile-challenge'
import { MobileHistoryView } from '@/components/mobile/mobile-history'
import { MobileProfileView } from '@/components/mobile/mobile-profile' 
import { MobileUploadView } from '@/components/mobile/mobile-upload'
import { MobileResultsView } from '@/components/mobile/mobile-results'
import { MobileScoreView } from '@/components/mobile/mobile-score'
import { analyzeMessage, SAMPLE_ANALYSIS, SAMPLE_MESSAGE, type AnalysisResult } from '@/lib/scam-analyzer'

export function MobileApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [showSplash, setShowSplash] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(SAMPLE_ANALYSIS)
  const [challengeSelections, setChallengeSelections] = useState<Set<string>>(new Set())
  const { isNative } = usePlatform()

  useEffect(() => {
    const initializeApp = async () => {
      if (isNative) {
        await setStatusBarStyle('dark')
        await setStatusBarColor('#f8fafc')
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowSplash(false)
      if (isNative) {
        await hideSplashScreen()
      }
    }
    initializeApp()
  }, [isNative])

  const handleAnalyze = (text: string) => {
    if (text.trim() === SAMPLE_MESSAGE.trim()) {
      setAnalysisResult(SAMPLE_ANALYSIS)
    } else {
      setAnalysisResult(analyzeMessage(text))
    }
    setActiveTab('results')
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return 'TrustLens AI'
      case 'scan': return 'Scan Message'
      case 'upload': return 'Upload Screenshot'
      case 'results': return 'Analysis Results'
      case 'challenge': return 'Scam Challenge'
      case 'score': return 'Immunity Score'
      case 'history': return 'History'
      case 'profile': return 'Profile'
      default: return 'TrustLens AI'
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <MobileHomeView onNavigate={setActiveTab} />
      case 'scan':
        return <MobileScanView />
      case 'upload':
        return <MobileUploadView onAnalyze={handleAnalyze} />
      case 'results':
        return <MobileResultsView result={analysisResult} onStartImmunity={() => setActiveTab('challenge')} />
      case 'challenge':
        // ✅ FIX: Passed onNavigate prop to solve the TypeScript error
        return <MobileChallengeView onNavigate={setActiveTab} />
      case 'score':
        return <MobileScoreView selectedIds={challengeSelections} onTryAgain={() => setActiveTab('challenge')} onGoHome={() => setActiveTab('home')} />
      case 'history':
        return <MobileHistoryView />
      case 'profile':
        return <MobileProfileView />
      default:
        return <MobileHomeView onNavigate={setActiveTab} />
    }
  }

  if (showSplash) {
    return <SplashScreenView />
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MobileHeader 
        title={getTabTitle()} 
        showBackButton={!['home', 'scan', 'challenge', 'history', 'profile'].includes(activeTab)}
        onBack={() => setActiveTab('home')}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
