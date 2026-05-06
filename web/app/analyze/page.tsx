"use client";

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Shield, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  Scan, 
  Upload, 
  Info, 
  AlertTriangle, 
  Camera, 
  CheckCircle, 
  Lock 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { SAMPLE_MESSAGE, RISK_CATEGORIES, analyzeMessage } from '@/lib/scam-analyzer'
import { extractTextFromImage } from '@/lib/ocr-engine'
import { createClient } from '@/lib/supabase/client' //

export default function AnalyzePage() {
  const router = useRouter()
  const supabase = createClient() //
  
  // Logic: Session-based Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false) 
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste')
  const [message, setMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(0)
  const [extractStatus, setExtractStatus] = useState('')
  const [extractedText, setExtractedText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Check for active session on mount
  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser() //
      if (user) {
        setIsLoggedIn(true)
      }
      setLoading(false)
    }
    getSession()
  }, [supabase])

  const handleAnalyze = async () => {
    const textToAnalyze = activeTab === 'upload' ? extractedText : message
    if (!textToAnalyze.trim()) return

    setIsAnalyzing(true)
    const analysisResult = analyzeMessage(textToAnalyze)

    await new Promise(resolve => setTimeout(resolve, 1200))

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('trustlens-message', textToAnalyze)
      sessionStorage.setItem('trustlens-analysis', JSON.stringify({
        ...analysisResult,
        isGuestView: !isLoggedIn 
      }))
    }

    router.push('/results')
  }

  const handleDemoMessage = () => {
    if (activeTab === 'upload') {
      setExtractedText(SAMPLE_MESSAGE)
      setUploadedFile('demo-screenshot.png')
      setPreviewUrl(null)
    } else {
      setMessage(SAMPLE_MESSAGE)
    }
  }

  const processFile = async (file: File) => {
    setUploadedFile(file.name)
    setPreviewUrl(URL.createObjectURL(file))
    setIsExtracting(true)
    setExtractProgress(0)
    setExtractStatus('Initializing OCR...')

    try {
      const text = await extractTextFromImage(file, (progress, status) => {
        setExtractProgress(progress)
        setExtractStatus(status)
      })
      setExtractedText(text.trim() || 'No text could be extracted.')
    } catch (error) {
      setExtractedText('Failed to extract text.')
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

  const triggerUpload = () => fileInputRef.current?.click()
  const triggerCamera = () => cameraInputRef.current?.click()
  const resetUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setExtractedText('')
  }

  const currentText = activeTab === 'upload' ? extractedText : message
  const canAnalyze = currentText.trim().length > 0 && !isAnalyzing && !isExtracting

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">TrustLens AI</span>
          </Link>
          <div className="flex items-center gap-4">
            {!isLoggedIn && (
              <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                Sign In
              </Button>
            )}
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Identify Scam Threats</h1>
          <p className="text-muted-foreground text-lg">
            {isLoggedIn 
              ? "Your session is active. Full pattern analysis enabled." 
              : "Guest View: Sign in for full pattern analysis."}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-6">
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
              <button onClick={() => setActiveTab('paste')} className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'paste' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
                <FileText className="inline w-4 h-4 mr-2" /> Paste Text
              </button>
              <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === 'upload' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
                <ImageIcon className="inline w-4 h-4 mr-2" /> Upload Screenshot
              </button>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                {activeTab === 'paste' ? (
                  <Textarea
                    placeholder="Paste suspicious text..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[200px] bg-muted/30"
                  />
                ) : (
                  <div className="space-y-4">
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
                    <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                    {!uploadedFile && !isExtracting ? (
                      <div onClick={triggerUpload} className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-primary/5 transition-all">
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p>Click or drag & drop screenshot</p>
                      </div>
                    ) : isExtracting ? (
                      <div className="text-center p-10 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
                        <p>Extracting text... {extractProgress}%</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {previewUrl && <img src={previewUrl} className="max-h-48 mx-auto rounded-lg" />}
                        <Textarea value={extractedText} onChange={(e) => setExtractedText(e.target.value)} className="min-h-[140px]" />
                        <Button variant="ghost" size="sm" onClick={resetUpload}>Clear Image</Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleAnalyze} disabled={!canAnalyze} className="flex-1 h-11">
                    {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Scan className="mr-2" />}
                    {isLoggedIn ? "Verify Security" : "Verify Security (Guest)"}
                  </Button>
                  <Button variant="outline" onClick={handleDemoMessage} className="h-11">Demo Scam</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR: Unlocks based on actual isLoggedIn state */}
          <div className="space-y-6">
            <Card className="border-border/50 sticky top-24 overflow-hidden">
              <CardContent className="p-6 relative">
                <h3 className="font-semibold mb-4 text-lg">TrustLens Logic</h3>
                
                {!isLoggedIn && (
                  <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                    <Lock className="w-8 h-8 text-primary mb-2" />
                    <p className="text-sm font-bold">Advanced Analysis Locked</p>
                    <p className="text-xs text-muted-foreground mb-4">Sign in to unlock specific risk tokens.</p>
                    <Button size="sm" onClick={() => router.push('/login')}>Sign In</Button>
                  </div>
                )}

                <div className={`space-y-4 ${!isLoggedIn ? 'opacity-20 grayscale select-none pointer-events-none' : ''}`}>
                  {RISK_CATEGORIES.map((cat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
