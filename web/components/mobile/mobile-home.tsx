'use client'

import { FileText, Upload, Trophy, AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { hapticFeedback } from '@/lib/capacitor'
import { usePlatform } from '@/hooks/use-platform'

interface MobileHomeProps {
  onNavigate: (tab: string) => void
}

export function MobileHomeView({ onNavigate }: MobileHomeProps) {
  const { isNative } = usePlatform()

  const handleCardPress = async (tab: string) => {
    if (isNative) {
      await hapticFeedback('medium')
    }
    onNavigate(tab)
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Scam Immunity Assistant</h1>
        <p className="text-muted-foreground">
          Protect yourself from digital scams
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        {/* Paste Message Card */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-border/50"
          onClick={() => handleCardPress('scan')}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Paste Message</h3>
              <p className="text-sm text-muted-foreground">Analyze text for scam indicators</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Upload Screenshot Card */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-border/50"
          onClick={() => handleCardPress('upload')}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Upload Screenshot</h3>
              <p className="text-sm text-muted-foreground">Extract and analyze image text</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Start Challenge Card - Featured */}
        <Card 
          className="cursor-pointer bg-primary hover:bg-primary/90 transition-colors border-0"
          onClick={() => handleCardPress('challenge')}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-foreground/20">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-foreground">Start Challenge</h3>
              <p className="text-sm text-primary-foreground/80">Test your scam detection skills</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary-foreground/60" />
          </CardContent>
        </Card>
      </div>

      {/* Last Scan Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Last Scan</h2>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-medium text-destructive bg-destructive/10 rounded-full">
                    High Risk
                  </span>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <p className="text-sm text-foreground line-clamp-2">
                  {"Your GCash account will be suspended today due to suspicious activity..."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Scans</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">8</p>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">85%</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
