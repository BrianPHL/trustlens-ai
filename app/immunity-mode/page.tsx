'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Target, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HighlightedText } from '@/components/shared/highlighted-text'
import { SAMPLE_SEGMENTS, SAMPLE_SIGNALS } from '@/lib/scam-analyzer'

export default function ImmunityModePage() {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const redFlagSignalIds = new Set(
    SAMPLE_SEGMENTS.filter(s => s.isRedFlag && s.signalId).map(s => s.signalId!)
  )

  const handleSegmentClick = (signalId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(signalId)) next.delete(signalId)
      else next.add(signalId)
      return next
    })
  }

  const handleReveal = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('trustlens-selected', JSON.stringify([...selectedIds]))
    }
    router.push('/immunity-reveal')
  }

  const hints = [
    'Urgent or threatening language',
    'Shortened or unfamiliar links',
    'Requests for OTP, password, or PIN',
    'Account suspension threats',
    'Pressure to act without verifying',
    'Instructions not to tell anyone'
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">TrustLens AI</span>
          </Link>
          <Link href="/results" className="text-sm text-muted-foreground hover:text-foreground">Back to Results</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-bold">Scam Immunity Mode</h1>
          </div>
          <p className="text-white/80 text-lg">
            Before we reveal the answer, select the parts of the message that look suspicious.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold">Tap suspicious phrases</h2>
            <HighlightedText segments={SAMPLE_SEGMENTS} interactive selectedIds={selectedIds} onSegmentClick={handleSegmentClick} />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" /> Tap or click suspicious phrases, links, or requests in the message above.
            </p>

            {selectedIds.size > 0 && (
              <div className="flex flex-wrap gap-2">
                {[...selectedIds].map(id => {
                  const signal = SAMPLE_SIGNALS.find(s => s.id === id)
                  if (!signal) return null;
                  const IconComponent = (require('lucide-react') as any)[signal.icon] || require('lucide-react').AlertTriangle;
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                      <IconComponent className="w-3.5 h-3.5" /> {signal.phrase}
                      <button onClick={() => handleSegmentClick(id)} className="ml-1">×</button>
                    </span>
                  )
                })}
              </div>
            )}

            <Button onClick={handleReveal} size="lg" className="w-full h-12">Reveal Results</Button>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Progress</h3>
                <div className="flex justify-between items-baseline">
                  <p className="text-sm text-muted-foreground">Red flags selected</p>
                  <p className="text-3xl font-bold">{selectedIds.size}<span className="text-lg text-muted-foreground">/{redFlagSignalIds.size}</span></p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(selectedIds.size / redFlagSignalIds.size) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-3">Select all suspicious parts before revealing the answer to maximize your immunity score.</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">What to look for</h3>
                <ul className="space-y-2.5">
                  {hints.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>{h}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
