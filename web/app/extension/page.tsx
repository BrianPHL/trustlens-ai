'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, AlertTriangle, Chrome, ExternalLink, Zap, Eye, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const highlightedPhrases = [
  { text: 'account will be suspended', tooltip: 'Account Threat', tip: 'Scammers threaten account actions to cause panic and bypass rational thinking.', color: 'bg-red-100 dark:bg-red-900/30 border-b-2 border-red-400 dark:border-red-500' },
  { text: 'immediately', tooltip: 'Urgency Manipulation', tip: 'Artificial time pressure stops you from verifying the request.', color: 'bg-amber-100 dark:bg-amber-900/30 border-b-2 border-amber-400 dark:border-amber-500' },
  { text: 'bit.ly/gcash-secure-login', tooltip: 'Suspicious Link', tip: 'Shortened URLs disguise dangerous destinations. Never click these.', color: 'bg-red-100 dark:bg-red-900/30 border-b-2 border-red-400 dark:border-red-500' },
  { text: 'Do not share this warning', tooltip: 'Isolation Tactic', tip: 'Keeping you from seeking help is a hallmark of social engineering.', color: 'bg-amber-100 dark:bg-amber-900/30 border-b-2 border-amber-400 dark:border-amber-500' },
  { text: 'Enter your OTP', tooltip: 'Sensitive Info Request', tip: 'No legitimate service will ever ask for your OTP via message.', color: 'bg-red-100 dark:bg-red-900/30 border-b-2 border-red-400 dark:border-red-500' },
]

const detectedSignals = [
  { emoji: '⏰', label: 'Urgency Manipulation', severity: 'medium' },
  { emoji: '🔗', label: 'Suspicious Link', severity: 'high' },
  { emoji: '🛡️', label: 'Account Threat', severity: 'high' },
  { emoji: '🔑', label: 'OTP Request', severity: 'high' },
]

const howItWorks = [
  { icon: Eye, step: '01', title: 'Scans in Real-Time', desc: 'Reads text on any webpage as you browse' },
  { icon: Zap, step: '02', title: 'Flags Signals', desc: 'Highlights suspicious phrases instantly' },
  { icon: Shield, step: '03', title: 'Shows Risk Summary', desc: 'Popup with risk level and categories' },
  { icon: ExternalLink, step: '04', title: 'Full Analysis', desc: 'One click opens deep-dive report' },
]

export default function ExtensionPage() {
  const [hoveredPhrase, setHoveredPhrase] = useState<number | null>(null)
  const [highlightEnabled, setHighlightEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">TrustLens <span className="text-primary">AI</span></span>
          </Link>
          <div className="flex gap-4">
            <Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">View Mobile</Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Home</Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-16 space-y-12">

        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20 mb-4">
              <Chrome className="w-3 h-3" /> Browser Extension Preview
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3">
              Scam Detection,<br />
              <span className="text-primary">Right in Your Browser</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              TrustLens highlights dangerous patterns in emails, messages, and social media — in real time, as you read.
            </p>
          </div>
          {/* Pill stats */}
          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
            {[
              { icon: Globe, label: 'Works on any site' },
              { icon: Zap, label: 'Instant detection' },
              { icon: Lock, label: 'Private & secure' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/70 border border-border/60 backdrop-blur-sm text-sm font-medium text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* Left: Browser Mockup */}
          <div className="space-y-6">

            {/* Browser window */}
            <div className="rounded-2xl overflow-hidden border border-border/60 shadow-2xl shadow-black/10 dark:shadow-black/40">

              {/* Browser chrome bar */}
              <div className="bg-muted/60 dark:bg-muted/30 px-4 py-3 flex items-center gap-3 border-b border-border/60 backdrop-blur-sm">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex-1 flex items-center gap-2 bg-background/80 border border-border/40 rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  https://mail.example.com/inbox
                </div>
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              {/* Email content area */}
              <div className="bg-card p-6 relative min-h-[420px]">

                {/* Email header */}
                <div className="flex items-start gap-3 mb-5 pb-5 border-b border-border/60">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">GC</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      GCash Support{' '}
                      <span className="text-muted-foreground font-normal text-xs">support@gcash-verify.com</span>
                    </p>
                    <p className="text-xs text-muted-foreground">2 minutes ago · Inbox</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-full text-xs text-red-600 dark:text-red-400 font-semibold shrink-0">
                    <AlertTriangle className="w-3 h-3" /> Suspicious
                  </div>
                </div>

                <h3 className="text-base font-bold mb-4 text-foreground">Urgent: Account Verification Required</h3>

                <div className="text-sm leading-7 text-foreground/90 space-y-3 pr-72">
                  <p>Dear valued customer,</p>
                  <p>
                    Your GCash{' '}
                    <HighlightSpan enabled={highlightEnabled} phrase={highlightedPhrases[0]} index={0} hovered={hoveredPhrase} onHover={setHoveredPhrase}>
                      account will be suspended
                    </HighlightSpan>
                    {' '}today due to suspicious activity.
                  </p>
                  <p>
                    Verify your identity{' '}
                    <HighlightSpan enabled={highlightEnabled} phrase={highlightedPhrases[1]} index={1} hovered={hoveredPhrase} onHover={setHoveredPhrase}>
                      immediately
                    </HighlightSpan>
                    {' '}using this link:{' '}
                    <HighlightSpan enabled={highlightEnabled} phrase={highlightedPhrases[2]} index={2} hovered={hoveredPhrase} onHover={setHoveredPhrase}>
                      bit.ly/gcash-secure-login
                    </HighlightSpan>
                  </p>
                  <p>
                    <HighlightSpan enabled={highlightEnabled} phrase={highlightedPhrases[3]} index={3} hovered={hoveredPhrase} onHover={setHoveredPhrase}>
                      Do not share this warning
                    </HighlightSpan>
                    {' '}with anyone.{' '}
                    <HighlightSpan enabled={highlightEnabled} phrase={highlightedPhrases[4]} index={4} hovered={hoveredPhrase} onHover={setHoveredPhrase}>
                      Enter your OTP
                    </HighlightSpan>
                    {' '}to continue.
                  </p>
                  <p>Thank you for your cooperation.</p>
                  <p className="text-muted-foreground italic text-xs">— GCash Security Team</p>
                </div>

                {/* Tooltip on hover */}
                {hoveredPhrase !== null && (
                  <div className="absolute left-6 bottom-6 w-72 bg-card border border-border rounded-2xl shadow-xl p-4 z-20 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <span className="text-sm font-bold text-foreground">{highlightedPhrases[hoveredPhrase].tooltip}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{highlightedPhrases[hoveredPhrase].tip}</p>
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Always verify through official channels</p>
                  </div>
                )}

                {/* Extension Popup — absolutely positioned right side */}
                <div className="absolute right-4 top-4 w-64 bg-card border border-border/80 rounded-2xl shadow-2xl z-10 overflow-hidden">
                  {/* Popup header */}
                  <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-primary/15 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-bold text-xs tracking-tight">TrustLens AI</span>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground text-base leading-none w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors">&times;</button>
                  </div>

                  {/* Risk badge */}
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">High Risk</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-auto">Page scan</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground mb-3">4 scam signals detected</p>

                    <div className="space-y-1.5">
                      {detectedSignals.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/40">
                          <span className="text-xs">{s.emoji}</span>
                          <span className="text-[11px] font-medium text-foreground">{s.label}</span>
                          <span className={`ml-auto text-[9px] font-bold uppercase tracking-wide ${s.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                            {s.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlight toggle */}
                  <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium">Highlight phrases</span>
                    <button
                      onClick={() => setHighlightEnabled(!highlightEnabled)}
                      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${highlightEnabled ? 'bg-primary' : 'bg-muted border border-border'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all duration-200 shadow-sm ${highlightEnabled ? 'left-[18px]' : 'left-[3px]'}`} />
                    </button>
                  </div>

                  {/* CTA buttons */}
                  <div className="p-3 border-t border-border/60 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] rounded-lg font-semibold" asChild>
                      <Link href="/results">Explain</Link>
                    </Button>
                    <Button size="sm" className="flex-1 h-7 text-[10px] rounded-lg font-semibold gap-1" asChild>
                      <Link href="/results">
                        <ExternalLink className="w-2.5 h-2.5" />
                        Full Report
                      </Link>
                    </Button>
                  </div>

                  <div className="px-3 py-2 bg-muted/40">
                    <p className="text-[9px] text-muted-foreground text-center leading-relaxed">Educational analysis only. Always verify through official channels.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-bold text-sm">Real-time Detection</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Highlights suspicious phrases as you browse — like a grammar checker, but for scams.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-bold text-sm">Seamless Integration</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">Works across Gmail, Messenger, WhatsApp Web. One click opens a full analysis report.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">

            {/* Install card */}
            <Card className="border-border/50 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="font-bold text-sm mb-1">Browser Extension</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Works seamlessly across Gmail, Messenger, WhatsApp Web, and any site with text.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">How it works</p>
                  {howItWorks.map(({ icon: Icon, step, title, desc }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{title}</p>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  <Chrome className="w-4 h-4" />
                  Add to Chrome
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">Coming soon · Chrome · Edge · Firefox</p>
              </CardContent>
            </Card>

            {/* Protection badge */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Active Protection</p>
                <p className="text-xs text-muted-foreground">Monitoring this preview page</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold">TrustLens AI</span>
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
          <p className="text-xs text-muted-foreground">Protecting you from scams, one analysis at a time.</p>
        </div>
      </footer>
    </div>
  )
}

// Extracted highlight span component for cleanliness
function HighlightSpan({
  children, enabled, phrase, index, hovered, onHover
}: {
  children: React.ReactNode
  enabled: boolean
  phrase: typeof highlightedPhrases[0]
  index: number
  hovered: number | null
  onHover: (i: number | null) => void
}) {
  if (!enabled) return <>{children}</>
  return (
    <span
      className={`${phrase.color} px-0.5 rounded cursor-pointer transition-all duration-150 ${hovered === index ? 'brightness-90 dark:brightness-110' : ''}`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {children}
    </span>
  )
}