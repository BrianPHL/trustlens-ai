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
import { MobileLearningView } from '@/components/mobile/mobile-learning'
import { 
  analyzeMessage, 
  SAMPLE_ANALYSIS, 
  SAMPLE_MESSAGE, 
  type AnalysisResult,
  mapExtensionAnalysis
} from '@/lib/scam-analyzer'
import { createClient } from '@/lib/supabase/client'
import { MobileScoreView } from '@/components/mobile/mobile-score'

export function MobileApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(SAMPLE_ANALYSIS)
  const [challengeSelections, setChallengeSelections] = useState<Set<string>>(new Set())
  const { isNative } = usePlatform()

  // --- Effect 1: Initial App Setup ---
  useEffect(() => {
    const initializeApp = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)

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

  // --- Effect 2: Lifecycle Listeners (Auth & Message) ---
  useEffect(() => {
    const supabase = createClient()

    // --- Auth State Listener ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const newUser = session?.user ?? null
      setUser(prev => {
        if (prev?.id === newUser?.id) return prev
        return newUser
      })
    })

    // --- Transfer Payload Logic (Ported from Web) ---
    let messageListener: ((event: MessageEvent) => void) | null = null
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const payloadParam = urlParams.get('payload')
      const transferId = urlParams.get('transferId')

      const handleApplyAnalysis = async (msg: string, explicitlyGuest: boolean, extAnalysis: any) => {
        const { data: { session } } = await supabase.auth.getSession()
        const isUserLoggedIn = !!session?.user
        
        if (msg) {
          let analysis: AnalysisResult
          if (extAnalysis) {
            analysis = mapExtensionAnalysis(msg, extAnalysis, 'extension')
          } else {
            analysis = analyzeMessage(msg)
          }
          
          setAnalysisResult(analysis)
          setActiveTab('results')

          // Cache for session
          sessionStorage.setItem('trustlens-analysis', JSON.stringify({
            isGuestView: explicitlyGuest || !isUserLoggedIn
          }))
        }
      }

      if (payloadParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(payloadParam)))
          handleApplyAnalysis(decoded.text || '', decoded.isGuestView || false, decoded.analysis)
          window.history.replaceState({}, '', window.location.pathname)
        } catch (e) { console.error("Payload parse error", e) }
      } else if (transferId) {
        messageListener = (event: MessageEvent) => {
          if (event.data && event.data.type === 'TRUSTLENS_TRANSFER_PAYLOAD') {
            window.removeEventListener('message', messageListener)
            const p = event.data.payload
            handleApplyAnalysis(p.text || '', p.isGuestView || false, p.analysis)
            window.history.replaceState({}, '', window.location.pathname)
          }
        }
        window.addEventListener('message', messageListener)
        window.postMessage({ type: 'TRUSTLENS_REQUEST_TRANSFER', transferId }, '*')
      }
    }

    return () => {
      subscription.unsubscribe()
      if (messageListener) {
        window.removeEventListener('message', messageListener)
      }
    }
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
        return <MobileHomeView onNavigate={setActiveTab} user={user} />
      case 'scan':
        return <MobileScanView />
      case 'learning':
        return <MobileLearningView />
      case 'upload':
        return <MobileUploadView onAnalyze={handleAnalyze} />
      case 'results':
        return <MobileResultsView result={analysisResult} onStartImmunity={() => setActiveTab('challenge')} />
      case 'challenge':
        return <MobileChallengeView onNavigate={setActiveTab} user={user} />
      case 'score':
        return <MobileScoreView selectedIds={challengeSelections} onTryAgain={() => setActiveTab('challenge')} onGoHome={() => setActiveTab('home')} />
      case 'history':
        return <MobileHistoryView user={user} />
      case 'profile':
        return <MobileProfileView user={user} setUser={setUser} />
      default:
        return <MobileHomeView onNavigate={setActiveTab} user={user} />
    }
  }

  if (showSplash || loading) {
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
