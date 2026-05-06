'use client'

import Link from 'next/link'
import { Shield, CheckCircle, ArrowRight, BookOpen, Zap, Eye, AlertTriangle, Lock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EducationTipCard } from '@/components/shared/education-tip-card'
import { EDUCATION_CONTENT } from '@/lib/scam-analyzer'

const checklist = [
  'Never share OTP, password, or PIN',
  "Don't click links in unsolicited messages",
  'Verify through official channels',
  'Be skeptical of urgency and threats',
  'Report suspicious messages',
  'Share awareness with family',
]

const stats = [
  { icon: Eye, label: 'Scams Detected', value: '12K+' },
  { icon: Users, label: 'Users Protected', value: '3.4K' },
  { icon: Zap, label: 'Avg. Detection', value: '0.8s' },
]

export default function HowItWorksPage() {
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
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-16 space-y-14">

        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12">
          {/* decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20 mb-4">
              <BookOpen className="w-3 h-3" /> Scam Awareness Hub
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-3">
              Stay One Step<br />
              <span className="text-primary">Ahead of Scammers</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Learn to recognize scam patterns, sharpen your instincts, and protect yourself and your loved ones from fraud.
            </p>
          </div>

          {/* Stats Row */}
          <div className="relative z-10 mt-8 flex flex-wrap gap-4">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/70 border border-border/60 backdrop-blur-sm shadow-sm"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* Education Cards */}
          <section className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                Scam Patterns to Know
              </h2>
            </div>
            {EDUCATION_CONTENT.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
              >
                <EducationTipCard
                  title={item.title}
                  icon={item.icon}
                  description={item.description}
                  examples={item.examples}
                  whatToDo={item.whatToDo}
                />
              </div>
            ))}
          </section>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">

            {/* Learning Progress Card */}
            <Card className="border-border/50 overflow-hidden">
              {/* Accent top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Your Progress</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                    Intermediate
                  </span>
                </div>

                {/* Score Ring */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke="currentColor" strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - 0.72)}`}
                        strokeLinecap="round"
                        className="text-primary transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">72</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Challenge Score</p>
                    <p className="font-semibold text-sm">72 / 100</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Needs Practice</p>
                  </div>
                </div>

                {/* Lessons Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Completed lessons</span>
                    <span className="font-semibold">3 / 7</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                      style={{ width: '43%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">43% complete</p>
                </div>

                <div className="space-y-2 pt-1">
                  <Button asChild className="w-full gap-2 shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                    <Link href="/immunity-mode">
                      Start Immunity Challenge
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full text-sm">
                    <Link href="/analyze">Analyze Suspicious Message</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Checklist */}
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-sm">Quick Safety Checklist</h3>
                </div>
                <ul className="space-y-2.5">
                  {checklist.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm group/item">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground leading-snug">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Protection Badge */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">You're Protected</p>
                <p className="text-xs text-muted-foreground">TrustLens AI is actively monitoring</p>
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
            <span className="text-sm font-semibold">TrustLens AI</span>
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
          <p className="text-xs text-muted-foreground">Protecting you from scams, one analysis at a time.</p>
        </div>
      </footer>
    </div>
  )
}