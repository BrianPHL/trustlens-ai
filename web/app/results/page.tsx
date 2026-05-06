'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Shield, Info, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { RiskBadge } from '@/components/shared/risk-badge'
import { RiskScoreCard } from '@/components/shared/risk-score-card'
import { PercentageBreakdownChart } from '@/components/shared/percentage-breakdown'
import { DetectionFlag } from '@/components/shared/detection-flag'
import { HighlightedText } from '@/components/shared/highlighted-text'
import { ExplanationCard } from '@/components/shared/explanation-card'
import { 
  analyzeMessage, 
  SAMPLE_MESSAGE, 
  SAMPLE_ANALYSIS,
  type AnalysisResult,
  type PercentageBreakdown,
  type ScamSignal,
  type SignalSeverity,
  type TextSegment
} from '@/lib/scam-analyzer'
import { createClient } from '@/lib/supabase/client'

type ExtensionSeverity = 'low' | 'medium' | 'high'

type ExtensionMatch = {
  id?: string
  category: string
  severity: ExtensionSeverity
  matchedText: string
  startIndex: number
  endIndex: number
  explanation?: string
  tip?: string
}

type ExtensionAnalysis = {
  riskLevel: AnalysisResult['riskLevel']
  riskScore: number
  totalSignals: number
  categories: string[]
  matches?: ExtensionMatch[]
  summary: string
}

type ExtensionTransferPayload = {
  version?: number
  origin?: string
  text?: string
  source?: string
  createdAt?: number
  analysis?: ExtensionAnalysis
}

const isValidRiskLevel = (
  value: unknown,
): value is AnalysisResult['riskLevel'] =>
  value === 'low' || value === 'medium' || value === 'high'

const isExtensionAnalysis = (value: unknown): value is ExtensionAnalysis => {
  if (!value || typeof value !== 'object') return false
  const analysis = value as ExtensionAnalysis
  const matchesAreValid =
    !analysis.matches ||
    (Array.isArray(analysis.matches) &&
      analysis.matches.every((match) => isExtensionMatch(match)))
  return (
    isValidRiskLevel(analysis.riskLevel) &&
    typeof analysis.riskScore === 'number' &&
    typeof analysis.totalSignals === 'number' &&
    Array.isArray(analysis.categories) &&
    typeof analysis.summary === 'string' &&
    matchesAreValid
  )
}

const isExtensionMatch = (value: unknown): value is ExtensionMatch => {
  if (!value || typeof value !== 'object') return false
  const match = value as ExtensionMatch
  return (
    typeof match.category === 'string' &&
    typeof match.matchedText === 'string' &&
    typeof match.startIndex === 'number' &&
    typeof match.endIndex === 'number' &&
    (match.severity === 'low' ||
      match.severity === 'medium' ||
      match.severity === 'high')
  )
}

const decodeExtensionPayload = (
  raw: string,
): ExtensionTransferPayload | null => {
  try {
    const json = decodeURIComponent(atob(raw))
    const parsed = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as ExtensionTransferPayload
  } catch {
    return null
  }
}

const parseStoredSummary = (raw: string | null): ExtensionAnalysis | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return isExtensionAnalysis(parsed) ? parsed : null
  } catch {
    return null
  }
}

const EXTENSION_ICON_MAP: Record<string, string> = {
  'Urgency Manipulation': 'Clock',
  'Suspicious Link': 'Link2',
  'Sensitive Information Request': 'KeyRound',
  'Account Threat': 'ShieldAlert',
  'Impersonation Cue': 'UserX',
  'Isolation Tactic': 'VolumeX',
  'Payment Pressure': 'CreditCard',
  'Prize/Reward Bait': 'Gift',
}

const mapExtensionSeverity = (severity: ExtensionSeverity): SignalSeverity =>
  severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low'

const mapHighlightType = (severity: ExtensionSeverity): TextSegment['type'] =>
  severity === 'high' ? 'danger' : severity === 'medium' ? 'warning' : 'info'

const normalizeExtensionMatches = (
  matches: ExtensionMatch[] | undefined,
): ExtensionMatch[] =>
  (matches ?? []).filter((match) => isExtensionMatch(match))

const buildExtensionSignals = (matches: ExtensionMatch[]): ScamSignal[] =>
  matches.map((match, index) => ({
    id: match.id ?? `ext-${index + 1}`,
    category: match.category,
    label: match.matchedText || match.category,
    phrase: match.matchedText || match.category,
    severity: mapExtensionSeverity(match.severity),
    explanation:
      match.explanation ??
      `Detected language related to ${match.category.toLowerCase()}.`,
    tip:
      match.tip ??
      'Verify the sender through official channels before taking action.',
    icon: EXTENSION_ICON_MAP[match.category] ?? 'AlertTriangle',
  }))

const buildSegmentsFromMatches = (
  text: string,
  matches: ExtensionMatch[],
): TextSegment[] => {
  if (!text) {
    return [{ text, type: 'normal', isRedFlag: false }]
  }

  if (matches.length === 0) {
    return [{ text, type: 'normal', isRedFlag: false }]
  }

  const sorted = [...matches]
    .filter((match) => match.endIndex > match.startIndex)
    .sort((a, b) => a.startIndex - b.startIndex)

  const segments: TextSegment[] = []
  let cursor = 0

  sorted.forEach((match, index) => {
    const start = Math.max(0, Math.min(match.startIndex, text.length))
    const end = Math.max(start, Math.min(match.endIndex, text.length))
    if (start < cursor) return

    if (start > cursor) {
      segments.push({
        text: text.slice(cursor, start),
        type: 'normal',
        isRedFlag: false,
      })
    }

    if (end > start) {
      segments.push({
        text: text.slice(start, end),
        type: mapHighlightType(match.severity),
        signalId: match.id ?? `ext-${index + 1}`,
        isRedFlag: true,
      })
      cursor = end
    }
  })

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      type: 'normal',
      isRedFlag: false,
    })
  }

  return segments
}

const buildPercentagesFromScore = (
  score: number,
  totalSignals: number,
): PercentageBreakdown => {
  if (totalSignals === 0) {
    return { safe: 92, suspicious: 5, scam: 3 }
  }

  const normalized = Math.min(100, Math.max(0, Math.round(score)))
  const scam = Math.min(85, Math.round(normalized * 0.8))
  const suspicious = Math.min(30, Math.round(normalized * 0.3))
  const safe = Math.max(0, 100 - scam - suspicious)
  return { safe, suspicious, scam }
}

const buildRecommendedActions = (totalSignals: number) =>
  totalSignals === 0
    ? [
        {
          number: 1,
          title: 'Stay vigilant',
          description:
            'Always verify unexpected requests through official channels.',
        },
      ]
    : [
        {
          number: 1,
          title: 'Do not click any links',
          description: 'Links may lead to fake pages designed to steal data.',
        },
        {
          number: 2,
          title: 'Do not share OTP, password, or PIN',
          description: 'Legitimate services never ask for these via messages.',
        },
        {
          number: 3,
          title: 'Verify through official channels',
          description: 'Open the official app or website directly.',
        },
        {
          number: 4,
          title: 'Report and block the sender',
          description: 'Help protect others by reporting the scam attempt.',
        },
      ]

const buildExplanation = (
  riskLevel: AnalysisResult['riskLevel'],
  totalSignals: number,
  summary: string,
) => {
  if (summary) return summary
  if (totalSignals === 0) {
    return 'This message appears relatively safe, but always stay vigilant and verify unexpected requests.'
  }
  const countLabel = totalSignals === 1 ? 'signal' : 'signals'
  if (riskLevel === 'high') {
    return `This message exhibits ${totalSignals} scam ${countLabel}. It uses manipulation patterns common in phishing. Do not interact or click any links.`
  }
  if (riskLevel === 'medium') {
    return `This message contains ${totalSignals} suspicious ${countLabel}. Verify the sender through official channels before acting.`
  }
  return `This message shows ${totalSignals} minor ${countLabel}. Stay cautious and verify if unsure.`
}

const buildAnalysisFromExtension = (
  text: string,
  extension: ExtensionAnalysis,
): AnalysisResult => {
  const matches = normalizeExtensionMatches(extension.matches)
  const signals = buildExtensionSignals(matches)
  const totalSignals =
    typeof extension.totalSignals === 'number'
      ? extension.totalSignals
      : signals.length
  const riskScore = Math.min(100, Math.max(0, extension.riskScore))
  const riskLevel = extension.riskLevel
  const percentages = buildPercentagesFromScore(riskScore, totalSignals)
  const segments = buildSegmentsFromMatches(text, matches)
  const explanation = buildExplanation(
    riskLevel,
    totalSignals,
    extension.summary,
  )
  const confidence =
    totalSignals === 0 ? 45 : Math.min(98, 70 + totalSignals * 4)

  return {
    riskLevel,
    riskScore,
    percentages,
    signals,
    segments,
    explanation,
    recommendedActions: buildRecommendedActions(totalSignals),
    confidence,
  }
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<AnalysisResult>(SAMPLE_ANALYSIS)
  const [originalMessage, setOriginalMessage] = useState(SAMPLE_MESSAGE)
  const [extensionSummary, setExtensionSummary] = useState<ExtensionAnalysis | null>(null)
  const [extensionSource, setExtensionSource] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const payloadParam = searchParams.get('payload')
    const textParam = searchParams.get('text')
    const storedMessage = sessionStorage.getItem('trustlens-message')

    const payload = payloadParam ? decodeExtensionPayload(payloadParam) : null
    const payloadText = payload?.text?.trim() ?? ''
    const queryText = textParam?.trim() ?? ''

    const resolvedMessage = payloadText || queryText || storedMessage || SAMPLE_MESSAGE
    const messageText = resolvedMessage.trim() ? resolvedMessage : SAMPLE_MESSAGE
    const isSample = messageText.trim() === SAMPLE_MESSAGE.trim()

    setOriginalMessage(messageText)

    const extensionAnalysis =
      payload?.analysis && isExtensionAnalysis(payload.analysis)
        ? payload.analysis
        : null

    const analysis = extensionAnalysis
      ? buildAnalysisFromExtension(messageText, extensionAnalysis)
      : isSample
        ? SAMPLE_ANALYSIS
        : analyzeMessage(messageText)

    setResult(analysis)

    if (!isSample) {
      sessionStorage.setItem('trustlens-message', messageText)
    }

    const storedSummary = sessionStorage.getItem('trustlens-extension-summary')
    const storedExtensionMessage = sessionStorage.getItem(
      'trustlens-extension-message',
    )
    if (payload?.analysis && isExtensionAnalysis(payload.analysis)) {
      setExtensionSummary(payload.analysis)
      sessionStorage.setItem(
        'trustlens-extension-summary',
        JSON.stringify(payload.analysis),
      )
      sessionStorage.setItem('trustlens-extension-message', messageText)
    } else if (storedSummary && storedExtensionMessage === messageText) {
      const parsedSummary = parseStoredSummary(storedSummary)
      if (parsedSummary) setExtensionSummary(parsedSummary)
    } else {
      setExtensionSummary(null)
    }

    const storedSource = sessionStorage.getItem('trustlens-extension-source')
    if (payload?.source) {
      setExtensionSource(payload.source)
      sessionStorage.setItem('trustlens-extension-source', payload.source)
      sessionStorage.setItem('trustlens-extension-message', messageText)
    } else if (storedSource && storedExtensionMessage === messageText) {
      setExtensionSource(storedSource)
    } else {
      setExtensionSource(null)
    }

    const saveHistory = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user && !isSample && messageText.trim()) {
        await supabase.from('scan_history').insert({
          user_id: session.user.id,
          message_text: messageText,
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
  }, [searchParams])

  const extensionSourceLabel =
    extensionSource === 'page'
      ? 'Source: Page scan'
      : extensionSource === 'selection'
        ? 'Source: Selected text'
        : extensionSource === 'context-menu'
          ? 'Source: Context menu'
          : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
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
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analysis Results</h1>
          <p className="text-muted-foreground text-lg">
            Detailed breakdown of detected scam signals and risk assessment.
          </p>
        </div>

        <div className="grid lg:grid-cols-[7fr_3fr] gap-8">
          {/* Main Content — Left 2 cols */}
          <div className="space-y-6">
            {/* Risk Score Card */}
            <RiskScoreCard 
              score={result.riskScore} 
              level={result.riskLevel} 
              signalCount={result.signals.length}
              confidence={result.confidence}
            />

            {/* Percentage Breakdown */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <PercentageBreakdownChart percentages={result.percentages} />
              </CardContent>
            </Card>

            {/* Original Message */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Original Message</h2>
              <HighlightedText segments={result.segments} />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                Highlighted text indicates detected scam signals. Hover to see details.
              </p>
            </div>

            {/* Detected Scam Signals */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Detected Scam Signals</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.signals.map((signal) => (
                  <DetectionFlag
                    key={signal.id}
                    label={signal.label}
                    category={signal.category}
                    icon={signal.icon}
                    severity={signal.severity}
                    compact
                  />
                ))}
              </div>
              <div className="space-y-3">
                {result.signals.map((signal) => (
                  <DetectionFlag
                    key={signal.id + '-full'}
                    label={signal.explanation}
                    category={signal.category}
                    icon={signal.icon}
                    severity={signal.severity}
                  />
                ))}
              </div>
            </div>

            {/* Explanation */}
            <ExplanationCard
              title="Why this message is risky"
              explanation={result.explanation}
              variant={result.riskLevel === 'high' ? 'danger' : result.riskLevel === 'medium' ? 'warning' : 'success'}
            />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild size="lg" className="gap-2 flex-1">
                <Link href="/immunity-mode">
                  Start Scam Immunity Mode
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/analyze">
                  Analyze Another Message
                </Link>
              </Button>
            </div>
          </div>

          {/* Sidebar — Right col */}
          <div className="space-y-6">
            {extensionSummary && (
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        From Extension
                      </p>
                      <h3 className="font-semibold text-foreground text-lg">
                        Quick Scan Summary
                      </h3>
                    </div>
                    <RiskBadge level={extensionSummary.riskLevel} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {extensionSummary.summary}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{extensionSummary.totalSignals} signals</span>
                    <span>•</span>
                    <span>Score {extensionSummary.riskScore}/100</span>
                  </div>
                  {extensionSummary.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {extensionSummary.categories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {extensionSourceLabel && (
                    <p className="text-[11px] text-muted-foreground mt-3">
                      {extensionSourceLabel}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Recommended Actions */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 text-lg">Recommended Actions</h3>
                <div className="space-y-4">
                  {result.recommendedActions.map((action) => (
                    <div key={action.number} className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0 mt-0.5">
                        {action.number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips Link */}
            <Card className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Button asChild variant="outline" className="w-full">
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
