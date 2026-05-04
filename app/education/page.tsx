'use client'

import Link from 'next/link'
import { Shield, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EducationTipCard } from '@/components/shared/education-tip-card'
import { EDUCATION_CONTENT } from '@/lib/scam-analyzer'

export default function EducationPage() {
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
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Back to Home</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Scam Awareness &amp; Safety Tips</h1>
          <p className="text-lg text-muted-foreground">Learn to recognize common scam patterns and protect yourself from fraud.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Education Cards */}
          <div className="lg:col-span-2 space-y-6">
            {EDUCATION_CONTENT.map((item) => (
              <EducationTipCard
                key={item.id}
                title={item.title}
                icon={item.icon}
                description={item.description}
                examples={item.examples}
                whatToDo={item.whatToDo}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Progress */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Your Learning Progress</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Scam Awareness Level</p>
                    <p className="text-2xl font-bold text-foreground">Intermediate</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Completed lessons</span>
                      <span className="font-medium">3/7</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '43%' }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Score</p>
                    <p className="text-3xl font-bold text-primary">72<span className="text-lg text-muted-foreground">/100</span></p>
                    <p className="text-xs text-muted-foreground">Needs Practice</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button asChild className="w-full gap-2">
                    <Link href="/immunity-mode">
                      Start Scam Immunity Challenge
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/analyze">Analyze a Suspicious Message</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Safety Checklist */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Quick Safety Checklist</h3>
                <ul className="space-y-3">
                  {[
                    'Never share OTP, password, or PIN',
                    "Don't click links in unsolicited messages",
                    'Verify through official channels',
                    'Be skeptical of urgency and threats',
                    'Report suspicious messages',
                    'Share awareness with family',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
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
