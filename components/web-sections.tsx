'use client'

import { ArrowRight, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  {
    number: '01',
    title: 'Paste or Upload',
    description: 'Copy the suspicious message or upload a screenshot from any messaging app.',
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'Our AI scans for known scam patterns, suspicious links, and manipulation tactics.',
  },
  {
    number: '03',
    title: 'Get Explanation',
    description: 'Receive a clear, human-readable explanation of why the message is risky or safe.',
  },
  {
    number: '04',
    title: 'Build Immunity',
    description: 'Learn to recognize patterns yourself with our interactive scam immunity challenges.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Four simple steps to protect yourself from digital scams.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const immunityFeatures = [
  'Learn to identify urgency manipulation tactics',
  'Recognize suspicious link patterns',
  'Spot impersonation red flags',
  'Understand OTP and credential phishing',
  'Practice with real-world examples',
]

export function ScamImmunitySection() {
  return (
    <section id="scam-immunity" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Build Lasting Scam Immunity
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              {"Don't just detect scams—learn to recognize them yourself. Our interactive challenges train you to spot red flags before AI reveals them."}
            </p>
            
            <ul className="space-y-3">
              {immunityFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Preview */}
          <div className="flex justify-center">
            <div className="relative w-72 h-[580px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-foreground rounded-b-2xl z-10" />
              <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden">
                {/* Mock Mobile Screen */}
                <div className="p-4 pt-12">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">T</span>
                    </div>
                    <span className="font-semibold text-sm text-foreground">TrustLens AI</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-4">Scam Challenge</h3>
                  
                  <Card className="mb-4 border-border/50">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-2">Is this a scam?</p>
                      <p className="text-sm text-foreground">
                        {"Your BDO account has been temporarily locked. Verify at bit.ly/bdo-verify..."}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-destructive/10 rounded-xl text-center">
                      <span className="text-xs font-medium text-destructive">{"It's a Scam"}</span>
                    </div>
                    <div className="p-3 bg-success/10 rounded-xl text-center">
                      <span className="text-xs font-medium text-success">{"It's Safe"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
