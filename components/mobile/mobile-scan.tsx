'use client'

import { useState, useRef } from 'react'
import { Scan, Upload, AlertTriangle, CheckCircle, AlertCircle, Loader2, Camera } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { hapticFeedback, hapticNotification } from '@/lib/capacitor'
import { usePlatform } from '@/hooks/use-platform'

type RiskLevel = 'high' | 'medium' | 'low' | null

interface AnalysisResult {
  riskLevel: RiskLevel
  indicators: string[]
  explanation: string
}

export function MobileScanView() {
  const [message, setMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isNative } = usePlatform()

  const analyzeMessage = async () => {
    if (!message.trim()) return

    setIsAnalyzing(true)
    setResult(null)

    if (isNative) {
      await hapticFeedback('medium')
    }

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simple mock analysis based on keywords
    const lowerMessage = message.toLowerCase()
    let riskLevel: RiskLevel = 'low'
    const indicators: string[] = []

    if (lowerMessage.includes('otp') || lowerMessage.includes('password') || lowerMessage.includes('pin')) {
      indicators.push('Sensitive data request detected')
      riskLevel = 'high'
    }
    if (lowerMessage.includes('suspended') || lowerMessage.includes('urgent') || lowerMessage.includes('immediately')) {
      indicators.push('Urgency manipulation detected')
      riskLevel = riskLevel === 'high' ? 'high' : 'medium'
    }
    if (lowerMessage.includes('bit.ly') || lowerMessage.includes('click here') || lowerMessage.includes('http')) {
      indicators.push('Suspicious link detected')
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
    }
    if (lowerMessage.includes('verify') || lowerMessage.includes('confirm your')) {
      indicators.push('Verification request pattern')
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel
    }

    if (indicators.length === 0) {
      indicators.push('No immediate red flags detected')
    }

    const explanations = {
      high: 'This message contains multiple high-risk indicators commonly found in phishing scams. Do NOT interact with it.',
      medium: 'This message contains suspicious elements. Verify the sender through official channels before taking any action.',
      low: 'This message appears relatively safe, but always stay vigilant and verify unexpected requests.'
    }

    setResult({
      riskLevel,
      indicators,
      explanation: explanations[riskLevel]
    })

    setIsAnalyzing(false)

    if (isNative) {
      await hapticNotification(riskLevel === 'high' ? 'error' : riskLevel === 'medium' ? 'warning' : 'success')
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const getRiskStyles = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return { bg: 'bg-destructive/10', text: 'text-destructive', icon: AlertTriangle }
      case 'medium':
        return { bg: 'bg-warning/10', text: 'text-warning-foreground', icon: AlertCircle }
      case 'low':
        return { bg: 'bg-success/10', text: 'text-success', icon: CheckCircle }
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', icon: Scan }
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Scan Message</h1>
        <p className="text-muted-foreground">Paste a message or upload a screenshot</p>
      </div>

      {/* Input Area */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <Textarea
            placeholder="Paste the suspicious message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32 resize-none border-border/50"
          />
          
          <div className="flex gap-3">
            <Button 
              onClick={analyzeMessage} 
              disabled={!message.trim() || isAnalyzing}
              className="flex-1 gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Analyze
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleUpload} className="gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              // Handle file upload for OCR (mock for now)
              const file = e.target.files?.[0]
              if (file) {
                setMessage('[Image uploaded - OCR processing simulated]\n\nYour account needs immediate verification...')
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardContent className="p-4 space-y-4">
            {/* Risk Badge */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getRiskStyles(result.riskLevel).bg}`}>
                {(() => {
                  const Icon = getRiskStyles(result.riskLevel).icon
                  return <Icon className={`w-4 h-4 ${getRiskStyles(result.riskLevel).text}`} />
                })()}
                <span className={`text-sm font-medium capitalize ${getRiskStyles(result.riskLevel).text}`}>
                  {result.riskLevel} Risk
                </span>
              </div>
            </div>

            {/* Indicators */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Detected Indicators</h3>
              <ul className="space-y-2">
                {result.indicators.map((indicator, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${getRiskStyles(result.riskLevel).bg.replace('/10', '')}`} />
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>

            {/* Explanation */}
            <div className={`p-3 rounded-lg ${getRiskStyles(result.riskLevel).bg}`}>
              <p className={`text-sm ${getRiskStyles(result.riskLevel).text}`}>
                {result.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
