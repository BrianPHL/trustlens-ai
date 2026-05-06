'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  Info, 
  ArrowRight, 
  Lock, 
  AlertTriangle, 
  Eye, 
  FileText, 
  Globe, 
  ShieldAlert 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RiskScoreCard } from '@/components/shared/risk-score-card'
import { PercentageBreakdownChart } from '@/components/shared/percentage-breakdown'
import { DetectionFlag } from '@/components/shared/detection-flag'
import { HighlightedText } from '@/components/shared/highlighted-text'
import { ExplanationCard } from '@/components/shared/explanation-card'
import { 
  analyzeMessage, 
  SAMPLE_MESSAGE, 
  SAMPLE_ANALYSIS,
  type AnalysisResult 
} from '@/lib/scam-analyzer'
import { createClient } from '@/lib/supabase/client'

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult>(SAMPLE_ANALYSIS)
  const [originalMessage, setOriginalMessage] = useState(SAMPLE_MESSAGE)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('trustlens-message')
      const storedAnalysis = sessionStorage.getItem('trustlens-analysis')
      
      if (storedAnalysis) {
        try {
          const parsed = JSON.parse(storedAnalysis)
          setIsGuest(parsed.isGuestView || false)
        } catch (e) {
          console.error("Error parsing analysis context", e)
        }
      }

      if (stored) {
        setOriginalMessage(stored)
        let analysis: AnalysisResult
        
        if (stored.trim() === SAMPLE_MESSAGE.trim()) {
          analysis = SAMPLE_ANALYSIS
          setResult(SAMPLE_ANALYSIS)
        } else {
          analysis = analyzeMessage(stored)
          setResult(analysis)
        }

        const saveHistory = async () => {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user && stored.trim() !== SAMPLE_MESSAGE.trim()) {
            await supabase.from('scan_history').insert({
              user_id: session.user.id,
              message_text: stored,
              risk_level: analysis.riskLevel,
              risk_score: analysis.riskScore,
              scam_percentage: analysis.percentages.scam,
              suspicious_percentage: analysis.percentages.suspicious,
              safe_percentage: analysis.percentages.safe,
              signals_detected: analysis.signals
            })
          }
        }
        saveHistory()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background font-geist">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-primary-foreground">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-semibold text-lg text-foreground">TrustLens AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Analyze Another
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analysis Results</h1>
          <p className="text-muted-foreground text-lg">
            Detailed breakdown of detected scam signals and risk assessment.
          </p>
        </div>

        <div className="grid lg:grid-cols-[7fr_3fr] gap-8">
          <div className="space-y-6">
            <RiskScoreCard 
              score={result.riskScore} 
              level={result.riskLevel} 
              signalCount={result.signals.length}
              confidence={result.confidence}
            />

            {isGuest && (
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Quick Security Snapshot</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm leading-relaxed">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-muted-foreground" /> Link Authenticity
                      </p>
                      <p className="text-muted-foreground italic">
                        The message contains links pointing to suspicious, non-government, or masked domains.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" /> Phishing Tactics
                      </p>
                      <p className="text-muted-foreground italic">
                        AI identified high-pressure "urgency" patterns and impersonation of a service provider.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Container for Analysis Content & Lock Overlay */}
            <div className="relative">
              <div className={`space-y-6 transition-all duration-500 ${isGuest ? 'select-none pointer-events-none pb-40 md:pb-60' : ''}`}>
                
                <Card className={`border-border/50 ${isGuest ? 'opacity-40 blur-[2px]' : ''}`}>
                  <CardContent className="p-6">
                    <PercentageBreakdownChart percentages={result.percentages} />
                  </CardContent>
                </Card>

                <div 
                  className="space-y-3"
                  style={isGuest ? { 
                    maskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.1) 30%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.1) 30%, transparent 100%)'
                  } : {}}
                >
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Original Message
                  </h2>
                  <HighlightedText segments={result.segments} />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Highlighted text indicates detected scam signals.
                  </p>
                </div>

                {!isGuest && (
                  <>
                    <div className="space-y-3">
                      <h2 className="text-lg font-semibold text-foreground">Detected Scam Signals</h2>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.signals.map((signal) => (
                          <DetectionFlag key={signal.id} label={signal.label} category={signal.category} icon={signal.icon} severity={signal.severity} compact />
                        ))}
                      </div>
                      <div className="space-y-3">
                        {result.signals.map((signal) => (
                          <DetectionFlag key={signal.id + '-full'} label={signal.explanation} category={signal.category} icon={signal.icon} severity={signal.severity} />
                        ))}
                      </div>
                    </div>

                    <ExplanationCard
                      title="Why this message is risky"
                      explanation={result.explanation}
                      variant={result.riskLevel === 'high' ? 'danger' : result.riskLevel === 'medium' ? 'warning' : 'success'}
                    />
                  </>
                )}
              </div>

              {/* Scribd-style Unlock Overlay - FIXED POSITIONING */}
              {isGuest && (
                <div className="absolute inset-x-0 top-[150px] bottom-0 flex flex-col items-center justify-start z-30 px-4">
                  <Card className="border-primary/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] max-w-[440px] w-full mx-auto bg-background/95 backdrop-blur-lg">
                    <CardContent className="p-8 md:p-10 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-6 text-primary">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 tracking-tight">Analysis Truncated</h3>
                      <p className="text-sm text-muted-foreground mb-8 leading-relaxed px-2">
                        TrustLens identified <span className="text-foreground font-semibold">{result.signals.length} high-risk signals</span> in this message. Sign in to view the full breakdown and recommended responses.
                      </p>
                      <div className="flex flex-col gap-4">
                        <Button asChild size="lg" className="w-full h-12 text-md font-bold shadow-sm">
                          <Link href="/auth/signup">Unlock Full Analysis</Link>
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          Already have an account? <Link href="/auth/login" className="text-primary font-bold hover:underline">Log In</Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Bottom Navigation Buttons - Now pushed below overlay via padding-bottom on inner content */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 relative z-10">
              <Button asChild size="lg" className="gap-2 flex-1 h-12 font-bold shadow-md">
                <Link href={isGuest ? "/auth/signup" : "/immunity-mode"}>
                  {isGuest ? "Get Full Protection" : "Start Immunity Mode"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 h-12 font-bold hover:bg-muted/50">
                <Link href="/analyze">Analyze Another</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
                   <h3 className="font-semibold text-foreground text-lg">Recommended</h3>
                   {isGuest && <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />}
                </div>
                <div className="space-y-5">
                  {(isGuest ? result.recommendedActions.slice(0, 2) : result.recommendedActions).map((action) => (
                    <div key={action.number} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 mt-0.5">
                        {action.number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-snug">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  ))}
                  {isGuest && (
                    <div className="pt-4 border-t border-border mt-4 text-center">
                      <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest font-bold">SIGN IN FOR ALL STEPS</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors">
              <CardContent className="p-6">
                <Button asChild variant="link" className="w-full text-foreground h-auto p-0 font-bold">
                  <Link href="/education">View Full Safety Tips</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}