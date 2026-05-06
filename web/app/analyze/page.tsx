"use client";

import { useState, useRef } from 'react'
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

export default function AnalyzePage() {
  const router = useRouter()
  
  // Logic: Guest View State
  // In production, connect this to your Auth provider (e.g., Clerk, NextAuth, or Firebase)
  const [isLoggedIn, setIsLoggedIn] = useState(false) 

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

  const handleAnalyze = async () => {
    const textToAnalyze = activeTab === 'upload' ? extractedText : message
    if (!textToAnalyze.trim()) return

    setIsAnalyzing(true)

    // Run real NLP analysis from scam-analyzer
    const analysisResult = analyzeMessage(textToAnalyze)

    // Simulate brief "AI thinking" delay for UX
    await new Promise(resolve => setTimeout(resolve, 1200))

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('trustlens-message', textToAnalyze)
      // We pass the login status so the Results page can show a "brief" version for guests
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
    setExtractedText('')

    try {
      const text = await extractTextFromImage(file, (progress, status) => {
        setExtractProgress(progress)
        setExtractStatus(status)
      })
      const cleaned = text.trim()
      setExtractedText(cleaned || 'No text could be extracted. Try a clearer image.')
    } catch (error) {
      console.error('OCR Error:', error)
      setExtractedText('Failed to extract text from the image. Please try another image.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file)
    // Reset input so same file can be re-uploaded
    event.target.value = ''
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  const triggerCamera = () => {
    cameraInputRef.current?.click()
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setExtractedText('')
    setExtractProgress(0)
    setExtractStatus('')
  }

  const currentText = activeTab === 'upload' ? extractedText : message
  const canAnalyze = currentText.trim().length > 0 && !isAnalyzing && !isExtracting

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">TrustLens AI</span>
          </Link>
          <div className="flex items-center gap-4">
            {!isLoggedIn && (
              <Button variant="outline" size="sm" onClick={() => setIsLoggedIn(true)}>
                Sign In
              </Button>
            )}
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Identify Scam Threats</h1>
          <p className="text-muted-foreground text-lg">
            {isLoggedIn 
              ? "Our NLP engine analyzes tokens and patterns to verify the intent of your message." 
              : "Guest View: Get a brief security snapshot. Sign in for full pattern analysis."}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-6">
            {/* Tab switcher */}
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

            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">

                {activeTab === 'paste' ? (
                  <Textarea
                    placeholder="Paste a suspicious SMS, email, or chat message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[200px] resize-none text-sm leading-relaxed border-border/50 bg-muted/30 focus:bg-background transition-colors"
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Hidden file inputs */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <input
                      type="file"
                      ref={cameraInputRef}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {/* Step 1: No file yet */}
                    {!uploadedFile && !isExtracting && (
                      <div className="space-y-3">
                        <div
                          onClick={triggerUpload}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault()
                            const file = e.dataTransfer.files?.[0]
                            if (file && file.type.startsWith('image/')) processFile(file)
                          }}
                          className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
                          <p className="font-medium text-foreground mb-1">Click to upload or drag & drop</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG, WEBP supported</p>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={triggerUpload}
                            className="flex-1 gap-2 h-11"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Image
                          </Button>
                          <Button
                            variant="outline"
                            type="button"
                            onClick={triggerCamera}
                            className="flex-1 gap-2 h-11"
                          >
                            <Camera className="w-4 h-4" />
                            Use Camera
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          On mobile, "Use Camera" opens your camera directly. "Upload Image" lets you pick from your gallery.
                        </p>
                      </div>
                    )}

                    {/* Step 2: OCR in progress */}
                    {isExtracting && (
                      <div className="border border-border rounded-xl p-10 text-center space-y-4">
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Uploaded preview"
                            className="max-h-40 mx-auto rounded-lg object-contain opacity-60"
                          />
                        )}
                        <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
                        <div>
                          <p className="font-medium text-foreground">
                            Extracting text… {extractProgress}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">{extractStatus}</p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${extractProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Extraction done */}
                    {uploadedFile && !isExtracting && (
                      <div className="space-y-3">
                        {previewUrl && (
                          <div className="relative rounded-xl overflow-hidden border border-border/50 max-h-48">
                            <img
                              src={previewUrl}
                              alt="Uploaded screenshot"
                              className="w-full object-contain max-h-48"
                            />
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/90 text-white text-xs rounded-full font-medium">
                                <CheckCircle className="w-3 h-3" /> OCR Complete
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Shield className="w-4 h-4" />
                            Extracted Text
                          </span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" type="button" onClick={triggerCamera} className="h-7 text-xs gap-1">
                              <Camera className="w-3 h-3" /> Camera
                            </Button>
                            <Button variant="ghost" size="sm" type="button" onClick={resetUpload} className="h-7 text-xs">
                              Clear
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Extracted text will appear here. You can edit it before analyzing."
                          value={extractedText}
                          onChange={(e) => setExtractedText(e.target.value)}
                          className="min-h-[140px] resize-none text-sm border-border/50 bg-muted/10"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className="flex-1 gap-2 h-11"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Intent…
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4" />
                        {isLoggedIn ? "Verify Security" : "Verify Security (Guest)"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleDemoMessage}
                    className="gap-2 h-11"
                  >
                    Demo Scam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Guest Logic Lock */}
          <div className="space-y-6">
            <Card className="border-border/50 sticky top-24 overflow-hidden">
              <CardContent className="p-6 relative">
                <h3 className="font-semibold text-foreground mb-4 text-lg">TrustLens Logic</h3>
                
                {/* Guest Overlay: Only visible when NOT logged in */}
                {!isLoggedIn && (
                  <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                    <Lock className="w-8 h-8 text-primary mb-2" />
                    <p className="text-sm font-bold text-foreground">Advanced Analysis Locked</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Create an account to see specific risk tokens and NLP patterns.
                    </p>
                    <Button size="sm" onClick={() => setIsLoggedIn(true)}>Sign Up Free</Button>
                  </div>
                )}

                <div className={`space-y-4 ${!isLoggedIn ? 'opacity-20 grayscale select-none pointer-events-none' : ''}`}>
                  {RISK_CATEGORIES.map((cat, i) => {
                    const IconComponent = (require('lucide-react') as any)[cat.icon] || AlertTriangle
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}