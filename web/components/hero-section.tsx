'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnalysisCard } from '@/components/analysis-card'

export function HeroSection() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Copy & CTAs */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-lg">✨</span>
              <span className="text-sm font-medium text-primary">
                AI-Powered Scam Detection & Education
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              TrustLens AI: Scam Immunity Assistant
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl text-pretty">
              Detect suspicious messages, understand the risks, and train yourself to spot scams before they happen.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/analyze">
                  Analyze a Message
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/immunity-mode">
                  Try Scam Immunity Mode
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Analysis Card */}
          <div className="flex justify-center lg:justify-end animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
            <AnalysisCard />
          </div>
        </div>
      </div>
    </section>
  )
}
