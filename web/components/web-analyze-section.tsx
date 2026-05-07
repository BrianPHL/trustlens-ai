'use client'

import { useState, useRef } from 'react'
import { Scan, Upload, Loader2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { extractTextFromImage } from '@/lib/ocr-engine'

import { 
  analyzeMessage, 
  type AnalysisResult, 
  type RiskLevel 
} from '@/lib/scam-analyzer'
import { createClient } from '@/lib/supabase/client'

export function WebAnalyzeSection() {
  const [message, setMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  
  // OCR states
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(0)
  const [extractStatus, setExtractStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setIsExtracting(true)
    setExtractProgress(0)
    setExtractStatus('Initializing OCR...')

    try {
      const text = await extractTextFromImage(file, (progress, status) => {
        setExtractProgress(progress)
        setExtractStatus(status)
      })
      setMessage(text.trim())
    } catch (error) {
      console.error('OCR Error:', error)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file)
    event.target.value = ''
  }

  const handleAnalyze = async () => {
    if (!message.trim()) return

    setIsAnalyzing(true)
    setResult(null)

    // Simulate analysis delay for UX
    await new Promise(resolve => setTimeout(resolve, 1500))

    const analysis = analyzeMessage(message)
    setResult(analysis)

    // Save to history if logged in
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      await supabase.from('scan_history').insert({
        user_id: session.user.id,
        message_text: message,
        risk_level: analysis.riskLevel,
        risk_score: analysis.riskScore,
        scam_percentage: analysis.percentages.scam,
        suspicious_percentage: analysis.percentages.suspicious,
        safe_percentage: analysis.percentages.safe,
        signals_detected: analysis.signals
      })
    }

    setIsAnalyzing(false)
  }

  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return { icon: AlertTriangle, bg: 'bg-destructive/10', text: 'text-destructive', label: 'High Risk' }
      case 'medium':
        return { icon: AlertCircle, bg: 'bg-warning/10', text: 'text-warning-foreground', label: 'Suspicious' }
      case 'low':
        return { icon: CheckCircle, bg: 'bg-success/10', text: 'text-success', label: 'Low Risk' }
      default:
        return { icon: Scan, bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' }
    }
  }

  return (
    <section id="analyze" className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Analyze a Message
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Paste any suspicious message below and let our AI analyze it for potential scam indicators.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                Message Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <div className="relative">
                <Textarea
                  placeholder="Paste the suspicious message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-40 resize-none text-sm md:text-base"
                  disabled={isExtracting}
                />
                {isExtracting && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-md border border-input">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium">{extractStatus}</p>
                    <p className="text-xs text-muted-foreground">{extractProgress}%</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAnalyze}
                  disabled={!message.trim() || isAnalyzing || isExtracting}
                  className="flex-1 gap-2 h-11 md:h-12 text-sm md:text-base"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Analyze Message
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2 h-11 md:h-12 text-sm md:text-base"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting || isAnalyzing}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className={`border-border/50 transition-all ${result ? 'opacity-100' : 'opacity-50'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Analysis Results</span>
                {result && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getRiskConfig(result.riskLevel).bg}`}>
                    {(() => {
                      const Icon = getRiskConfig(result.riskLevel).icon
                      return <Icon className={`w-4 h-4 ${getRiskConfig(result.riskLevel).text}`} />
                    })()}
                    <span className={`text-sm font-medium ${getRiskConfig(result.riskLevel).text}`}>
                      {getRiskConfig(result.riskLevel).label}
                    </span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result ? (
                <>
                  {/* Highlighted Text */}
                  <div className="p-4 bg-muted/50 rounded-xl text-sm leading-relaxed">
                    {result.segments.map((segment, index) => {
                      if (segment.type === 'danger') {
                        return (
                          <span key={index} className="bg-destructive/15 text-destructive px-1 py-0.5 rounded">
                            {segment.text}
                          </span>
                        )
                      }
                      if (segment.type === 'warning') {
                        return (
                          <span key={index} className="bg-warning/20 text-warning-foreground px-1 py-0.5 rounded">
                            {segment.text}
                          </span>
                        )
                      }
                      return <span key={index}>{segment.text}</span>
                    })}
                  </div>

                  {/* Indicators */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Detected Signals</h4>
                    <ul className="space-y-2">
                      {result.signals.map((signal, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className={`w-2 h-2 rounded-full ${getRiskConfig(result.riskLevel).bg.replace('/10', '')}`} />
                          <span className="font-bold text-foreground">{signal.label}:</span> {signal.phrase}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Explanation */}
                  <div className={`p-4 rounded-xl ${getRiskConfig(result.riskLevel).bg}`}>
                    <p className={`text-sm ${getRiskConfig(result.riskLevel).text}`}>
                      {result.explanation}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Scan className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    Paste a message and click analyze to see results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
