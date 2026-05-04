'use client'

import { Eye, Sparkles, GraduationCap, Chrome, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Eye,
    title: 'Explainable Detection',
    description: 'Understand exactly why a message is risky with clear, human-readable explanations.',
  },
  {
    icon: Sparkles,
    title: 'Screenshot OCR',
    description: 'Upload screenshots from any app. We extract and analyze the text automatically.',
  },
  {
    icon: GraduationCap,
    title: 'Scam Immunity Training',
    description: 'Interactive challenges help you learn to identify red flags before AI reveals them.',
  },
  {
    icon: Chrome,
    title: 'Browser Protection',
    description: 'Real-time scam detection while browsing email, messages, and social media.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="product" className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Powerful Features for Complete Protection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Advanced AI technology combined with educational tools to help you stay safe online.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-md transition-all duration-300 border-border/50 bg-card"
            >
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
