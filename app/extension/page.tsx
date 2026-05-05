'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, AlertTriangle, Chrome, ExternalLink, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const highlightedPhrases = [
  { text: 'account will be suspended', tooltip: 'Account Threat', tip: 'Scammers threaten account actions to cause panic.', color: 'bg-red-200/60 dark:bg-red-800/40 border-b-2 border-red-400' },
  { text: 'immediately', tooltip: 'Urgency Manipulation', tip: 'Scammers create pressure so users act without verifying.', color: 'bg-amber-200/60 dark:bg-amber-800/40 border-b-2 border-amber-400' },
  { text: 'bit.ly/gcash-secure', tooltip: 'Suspicious Link', tip: 'Shortened URLs hide dangerous destinations.', color: 'bg-red-200/60 dark:bg-red-800/40 border-b-2 border-red-400' },
  { text: 'Do not share this warning', tooltip: 'Isolation Tactic', tip: 'Keeping you from seeking help is a manipulation tactic.', color: 'bg-amber-200/60 dark:bg-amber-800/40 border-b-2 border-amber-400' },
  { text: 'Enter your OTP', tooltip: 'Sensitive Info Request', tip: 'No legitimate service asks for OTP via message.', color: 'bg-red-200/60 dark:bg-red-800/40 border-b-2 border-red-400' },
]

export default function ExtensionPage() {
  const [hoveredPhrase, setHoveredPhrase] = useState<number | null>(null)
  const [highlightEnabled, setHighlightEnabled] = useState(true)

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
          <div className="flex gap-4">
            <Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground">View Mobile</Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browser Extension Preview</h1>
          <p className="text-lg text-muted-foreground">Real-time scam detection while browsing email, messages, and social media.</p>
        </div>

        <div className="grid lg:grid-cols-[7fr_3fr] gap-8">
          {/* Browser Mockup */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
              {/* Browser Chrome */}
              <div className="bg-muted/80 px-4 py-3 flex items-center gap-3 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-background rounded-lg px-3 py-1.5 text-sm text-muted-foreground">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  https://mail.example.com/inbox
                </div>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Email Content */}
              <div className="p-6 relative">
                {/* Email Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-bold text-sm">GC</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">GCash Support <span className="text-muted-foreground font-normal">support@gcash-verify.com</span></p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-600 font-medium">
                    <AlertTriangle className="w-3 h-3" /> Suspicious
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-3">Urgent: Account Verification Required</h3>
                <div className="text-sm leading-relaxed text-foreground space-y-3">
                  <p>Dear valued customer,</p>
                  <p>
                    Your GCash{' '}
                    <span className={highlightEnabled ? highlightedPhrases[0].color + ' px-0.5 rounded cursor-pointer relative' : ''} onMouseEnter={() => setHoveredPhrase(0)} onMouseLeave={() => setHoveredPhrase(null)}>
                      account will be suspended
                    </span>
                    {' '}today due to suspicious activity.
                  </p>
                  <p>
                    Verify your identity{' '}
                    <span className={highlightEnabled ? highlightedPhrases[1].color + ' px-0.5 rounded cursor-pointer' : ''} onMouseEnter={() => setHoveredPhrase(1)} onMouseLeave={() => setHoveredPhrase(null)}>
                      immediately
                    </span>
                    {' '}using this link:{' '}
                    <span className={highlightEnabled ? highlightedPhrases[2].color + ' px-0.5 rounded cursor-pointer' : ''} onMouseEnter={() => setHoveredPhrase(2)} onMouseLeave={() => setHoveredPhrase(null)}>
                      bit.ly/gcash-secure-login
                    </span>
                  </p>
                  <p>
                    <span className={highlightEnabled ? highlightedPhrases[3].color + ' px-0.5 rounded cursor-pointer' : ''} onMouseEnter={() => setHoveredPhrase(3)} onMouseLeave={() => setHoveredPhrase(null)}>
                      Do not share this warning
                    </span>
                    {' '}with anyone.{' '}
                    <span className={highlightEnabled ? highlightedPhrases[4].color + ' px-0.5 rounded cursor-pointer' : ''} onMouseEnter={() => setHoveredPhrase(4)} onMouseLeave={() => setHoveredPhrase(null)}>
                      Enter your OTP
                    </span>
                    {' '}to continue.
                  </p>
                  <p>Thank you for your cooperation.</p>
                  <p className="text-muted-foreground italic">GCash Security Team</p>
                </div>

                {/* Tooltip */}
                {hoveredPhrase !== null && (
                  <div className="absolute right-6 top-32 w-64 bg-card border border-border rounded-xl shadow-xl p-4 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-foreground">{highlightedPhrases[hoveredPhrase].tooltip}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{highlightedPhrases[hoveredPhrase].tip}</p>
                    <p className="text-[10px] text-primary font-medium">Pause and check through the official website or app.</p>
                  </div>
                )}

                {/* Extension Popup Overlay */}
                <div className="absolute right-4 top-0 w-72 bg-card border border-border rounded-xl shadow-2xl z-10">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-sm">TrustLens AI</span>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium text-red-600">High Risk</span>
                      <span className="text-xs text-muted-foreground ml-auto">Page Analysis</span>
                    </div>
                    <p className="text-sm font-medium">4 scam signals detected on this page</p>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Detected categories:</p>
                      {['⏰ Urgency Manipulation', '🔗 Suspicious Link', '🛡️ Account Threat', '🔑 OTP Request'].map((cat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                          <span>{cat}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Highlight scam-like wording</span>
                      <button onClick={() => setHighlightEnabled(!highlightEnabled)} className={`w-10 h-6 rounded-full transition-colors relative ${highlightEnabled ? 'bg-primary' : 'bg-muted'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${highlightEnabled ? 'left-5' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 border-t border-border flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-8" asChild>
                      <Link href="/results">Explain Highlights</Link>
                    </Button>
                    <Button size="sm" className="flex-1 text-xs h-8" asChild>
                      <Link href="/results">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Full Analysis
                      </Link>
                    </Button>
                  </div>
                  <div className="px-4 py-2 bg-muted/50 rounded-b-xl">
                    <p className="text-[10px] text-muted-foreground text-center">Educational analysis only. Verify through official channels.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature cards below */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm">Real-time Detection</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Highlights suspicious phrases as you browse, just like a grammar checker.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm">Seamless Integration</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">One click opens full analysis in the TrustLens web app.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Browser Extension</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The TrustLens browser extension works seamlessly across Gmail, Messenger, WhatsApp Web, and other platforms.
                </p>
                <div className="space-y-3 mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">How it works</p>
                  {[
                    'Scans text on webpages in real-time',
                    'Highlights suspicious phrases',
                    'Shows popup with risk summary',
                    'Opens full analysis on click'
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
                <Button className="w-full gap-2">
                  <Chrome className="w-4 h-4" />
                  Add to Chrome
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">Coming soon to Chrome, Edge, and Firefox</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
