'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, FileText, Image as ImageIcon, Loader2, Scan, Upload, Info, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { SAMPLE_MESSAGE, RISK_CATEGORIES } from '@/lib/scam-analyzer'
import { extractTextFromImage } from '@/lib/ocr-engine'

export default function AnalyzePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')
  const [message, setMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const prefill = searchParams.get('text')
    if (!prefill) return
    const normalized = prefill.trim()
    if (!normalized) return
    setActiveTab('paste')
    setMessage(current => (current ? current : normalized))
  }, [searchParams])

  const handleAnalyze = async () => {
    const textToAnalyze = activeTab === 'upload' ? extractedText : message
    if (!textToAnalyze.trim()) return

    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Store the message in sessionStorage for the results page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('trustlens-message', textToAnalyze)
    }
    
    router.push('/results')
  }

  const handleDemoMessage = () => {
    if (activeTab === 'upload') {
      setExtractedText(SAMPLE_MESSAGE)
    } else {
      setMessage(SAMPLE_MESSAGE)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file.name)
    setIsExtracting(true)
    setExtractProgress(0)

    try {
      const text = await extractTextFromImage(file, (progress) => {
        setExtractProgress(progress)
      })
      setExtractedText(text)
    } catch (error) {
      console.error("OCR Error:", error)
      setExtractedText("Failed to extract text from the image. Please try another image or paste the text manually.")
    } finally {
      setIsExtracting(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const currentText = activeTab === 'upload' ? extractedText : message
  const canAnalyze = currentText.trim().length > 0 && !isAnalyzing

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
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analyze Suspicious Message</h1>
          <p className="text-muted-foreground text-lg">
            Paste text or upload a screenshot to detect scam signals and understand the risks.
          </p>
        </div>

        <div className="grid lg:grid-cols-[7fr_3fr] gap-8">
          {/* Left Panel — Input */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('paste')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'paste' 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-4 h-4" />
                Paste Text
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'upload' 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Upload Screenshot
              </button>
            </div>

            {/* Input Content */}
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                {activeTab === 'paste' ? (
                  <>
                    <Textarea
                      placeholder="Paste a suspicious SMS, email, or chat message here…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[200px] resize-none text-sm leading-relaxed border-border/50 bg-muted/30 focus:bg-background transition-colors"
                    />
                  </>
                ) : (
                  <div className="space-y-4">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                    />
                    {!uploadedFile ? (
                      <div 
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                      >
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium text-foreground mb-1">Click to upload screenshot</p>
                        <p className="text-sm text-muted-foreground mb-3">or drag and drop here</p>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">Supported formats: PNG, JPG, JPEG</p>
                      </div>
                    ) : isExtracting ? (
                      <div className="border border-border rounded-xl p-12 text-center">
                        <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                        <p className="font-medium text-foreground mb-2">Extracting text from screenshot…</p>
                        <div className="w-full bg-muted rounded-full h-2.5 mb-2 max-w-xs mx-auto overflow-hidden">
                          <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${extractProgress}%` }}></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{extractProgress}% Complete</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                            Text extracted successfully
                          </div>
                          <Button variant="ghost" size="sm" onClick={triggerFileInput} className="h-8 text-xs">
                            Upload Different Image
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Extracted text will appear here..."
                          value={extractedText}
                          onChange={(e) => setExtractedText(e.target.value)}
                          className="min-h-[160px] resize-none text-sm leading-relaxed border-border/50"
                        />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Review and correct the extracted text before analysis.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className="flex-1 gap-2 h-11"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Message…
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
                    onClick={handleDemoMessage}
                    className="gap-2"
                  >
                    Use Demo Scam Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel — Helper */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 text-lg">What TrustLens checks</h3>
                <div className="space-y-4">
                  {RISK_CATEGORIES.map((cat, i) => {
                    const IconComponent = (require('lucide-react') as any)[cat.icon] || require('lucide-react').AlertTriangle;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <IconComponent className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{cat.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <Info className="w-3 h-3 inline mr-1" />
                    TrustLens AI provides educational risk analysis and should not replace official verification.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
