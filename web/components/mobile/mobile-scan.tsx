'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Scan,
  Upload,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Info,
  Lock,
  FileText,
  ShieldAlert,
  RefreshCcw
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { HighlightedText } from '@/components/shared/highlighted-text'
import { DetectionFlag } from '@/components/shared/detection-flag'
import { hapticFeedback, hapticNotification } from '@/lib/capacitor'
import { usePlatform } from '@/hooks/use-platform'
import { analyzeMessage, type AnalysisResult } from '@/lib/scam-analyzer'
import { extractTextFromImage } from '@/lib/ocr-engine'

export function MobileScanView() {
  const [message, setMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(0)
  const [extractStatus, setExtractStatus] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isGuest, setIsGuest] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { isNative } = usePlatform()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAnalysis = sessionStorage.getItem('trustlens-analysis')
      if (storedAnalysis) {
        try {
          const parsed = JSON.parse(storedAnalysis)
          setIsGuest(parsed.isGuestView || false)
        } catch (e) {
          console.error("Error parsing guest context", e)
        }
      }
    }
  }, [])

  const handleClear = () => {
    setMessage('')
    setResult(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (isNative) hapticFeedback('light')
  }

  const runAnalysis = async (text: string) => {
    if (!text.trim()) return
    setIsAnalyzing(true)
    setResult(null)

    if (isNative) await hapticFeedback('medium')

    const analysis = analyzeMessage(text)
    await new Promise(resolve => setTimeout(resolve, 1200))

    setResult(analysis)
    setIsAnalyzing(false)

    if (isNative) {
      await hapticNotification(analysis.riskLevel === 'high' ? 'error' : 'success')
    }
  }

  const processFile = async (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
    setIsExtracting(true)
    setExtractProgress(0)
    setExtractStatus('Initializing...')
    setMessage('')
    setResult(null)

    try {
      const text = await extractTextFromImage(file, (p, s) => {
        setExtractProgress(p)
        setExtractStatus(s)
      })
      if (text.trim()) {
        setMessage(text.trim())
        await runAnalysis(text.trim())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsExtracting(false)
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="flex flex-col gap-5 p-4 pb-24 font-geist bg-background">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Scan Message</h1>
        <p className="text-muted-foreground text-sm">Paste text or scan a screenshot</p>
      </div>

      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

      {/* Input Area */}
      <Card className="border-border/40 bg-muted/10">
        <CardContent className="p-4 space-y-4">
          {isExtracting && (
            <div className="rounded-2xl bg-primary/5 p-4 space-y-3 text-center border border-primary/10">
              <Loader2 className="w-6 h-6 text-primary mx-auto animate-spin" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-primary">OCR Scanning {extractProgress}%</p>
                <p className="text-xs text-muted-foreground capitalize">{extractStatus}</p>
              </div>
            </div>
          )}

          <Textarea
            placeholder="Paste suspicious text here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-28 resize-none bg-transparent border-none p-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/50"
          />

          <div className="flex gap-2 pt-2">
            <Button onClick={() => runAnalysis(message)} disabled={!message.trim() || isAnalyzing || isExtracting} className="flex-1 h-12 rounded-xl gap-2 font-bold shadow-md">
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
              Analyze Now
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-12 w-12 rounded-xl p-0"><Upload className="w-4 h-4" /></Button>
            <Button variant="outline" onClick={() => cameraInputRef.current?.click()} className="h-12 w-12 rounded-xl p-0"><Camera className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Section */}
      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* HERO CARD */}
          <Card className="border-none shadow-xl overflow-hidden bg-gradient-to-br from-background to-muted/40">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-5">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/10" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * result.riskScore / 100)} className={`${result.riskLevel === 'high' ? 'text-destructive' : 'text-amber-500'} transition-all duration-1000`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black tracking-tighter">{result.riskScore}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Score</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className={`flex items-center justify-center gap-2 ${result.riskLevel === 'high' ? 'text-destructive' : 'text-amber-500'}`}>
                    <ShieldAlert className="w-5 h-5" />
                    <h2 className="text-2xl font-black uppercase tracking-tight italic">
                      {result.riskLevel === 'high' ? 'High Risk' : 'Medium Risk'}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Analysis Complete.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-3 text-left">
                    <p className="text-[9px] font-bold text-destructive/60 uppercase tracking-widest">Signals</p>
                    <p className="text-xl font-bold">{result.signals.length}</p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 text-left">
                    <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Confidence</p>
                    <p className="text-xl font-bold">{result.confidence || 94}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RISK DISTRIBUTION */}
          <Card className="border-border/40">
            <CardContent className="p-5">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Risk Distribution</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-16 h-16 shrink-0">
                  <div className="absolute inset-0 rounded-full border-[5px] border-emerald-500 opacity-20" />
                  <div className="absolute inset-0 rounded-full border-[5px] border-t-destructive border-r-amber-400 border-b-transparent border-l-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black italic">
                    {result.percentages.scam + result.percentages.suspicious}%
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-[11px] font-bold uppercase text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      Scam
                    </div>
                    <span className="text-foreground">{result.percentages.scam}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Suspicious
                    </div>
                    <span className="text-foreground">{result.percentages.suspicious}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Safe
                    </div>
                    <span className="text-foreground">{result.percentages.safe}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ANALYSIS VISIBILITY */}
          <div className="relative">
            <div className={`space-y-4 ${isGuest ? 'blur-md opacity-40 select-none' : ''}`}>
              <div className="space-y-2">
                <h3 className="text-sm font-bold flex gap-2 items-center">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Message Map
                </h3>
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <HighlightedText segments={result.segments} />
                </div>
              </div>

              {!isGuest && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold">Signal Breakdown</h3>
                  {result.signals.map((s) => (
                    <DetectionFlag key={s.id} label={s.explanation} category={s.category} icon={s.icon} severity={s.severity} />
                  ))}
                </div>
              )}
            </div>

            {isGuest && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pt-10">
                <Card className="bg-background/90 backdrop-blur-md border-primary/20 shadow-2xl mx-6">
                  <CardContent className="p-6 text-center space-y-4">
                    <Lock className="w-8 h-8 mx-auto text-primary" />
                    <p className="text-xs font-bold leading-relaxed">
                      Analysis details are locked for guests. Sign in to view full signal breakdown.
                    </p>
                    <Button asChild size="sm" className="w-full font-bold h-10 shadow-lg">
                      <Link href="/login">Unlock Report</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* ANALYZE ANOTHER BUTTON */}
          <Button
            variant="ghost"
            onClick={handleClear}
            className="w-full h-12 rounded-xl gap-2 font-bold text-muted-foreground hover:text-foreground"
          >
            <RefreshCcw className="w-4 h-4" />
            Analyze Another
          </Button>
        </div>
      )}
    </div>
  )
}
