import { useState, useRef } from 'react'
import { Upload, Loader2, Camera, Image as ImageIcon, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { extractTextFromImage } from '@/lib/ocr-engine'

interface MobileUploadProps {
  onAnalyze: (text: string) => void
}

export function MobileUploadView({ onAnalyze }: MobileUploadProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractProgress, setExtractProgress] = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploaded(true)
    setIsExtracting(true)
    setExtractProgress(0)

    try {
      const text = await extractTextFromImage(file, (progress) => {
        setExtractProgress(progress)
      })
      setExtractedText(text)
    } catch (error) {
      console.error("OCR Error:", error)
      setExtractedText("Failed to extract text from the image. Please try again.")
    } finally {
      setIsExtracting(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Upload Screenshot</h1>
        <p className="text-muted-foreground">Extract text from a screenshot for analysis</p>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4 space-y-4">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleUpload} 
          />
          {!uploaded ? (
            <div onClick={triggerFileInput} className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all">
              <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Upload Screenshot</p>
              <p className="text-sm text-muted-foreground mb-3">Choose from gallery or take a photo</p>
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                <Camera className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </div>
          ) : isExtracting ? (
            <div className="rounded-xl p-8 text-center">
              <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
              <p className="font-medium text-foreground mb-1">Extracting text…</p>
              <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${extractProgress}%` }}></div>
              </div>
              <p className="text-sm text-muted-foreground">{extractProgress}% Complete</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-emerald-600">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  Text extracted
                </div>
                <Button variant="ghost" size="sm" onClick={triggerFileInput} className="h-8 text-xs">Retake</Button>
              </div>
              <Textarea value={extractedText} onChange={(e) => setExtractedText(e.target.value)} className="min-h-[140px] resize-none text-sm" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" /> Review the extracted text before analysis.
              </p>
              <Button onClick={() => onAnalyze(extractedText)} className="w-full gap-2" disabled={!extractedText.trim()}>
                Analyze Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
