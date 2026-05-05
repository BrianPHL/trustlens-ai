'use client'

import { AlertTriangle, CheckCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ScanHistoryItem {
  id: string
  message: string
  riskLevel: 'high' | 'medium' | 'low'
  timestamp: string
}

const historyItems: ScanHistoryItem[] = [
  {
    id: '1',
    message: 'Your GCash account will be suspended today due to suspicious activity...',
    riskLevel: 'high',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    message: 'Congratulations! You have won a free iPhone 15. Click here to claim...',
    riskLevel: 'high',
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    message: 'Your Lazada order #12345 has been shipped. Track at bit.ly/track-order',
    riskLevel: 'medium',
    timestamp: '1 day ago'
  },
  {
    id: '4',
    message: 'Your Globe bill for May is ready. Amount: ₱1,234. Due: June 15.',
    riskLevel: 'low',
    timestamp: '2 days ago'
  },
  {
    id: '5',
    message: 'URGENT: Your BPI account needs verification. Reply with your OTP...',
    riskLevel: 'high',
    timestamp: '3 days ago'
  },
]

const getRiskConfig = (level: string) => {
  switch (level) {
    case 'high':
      return {
        icon: AlertTriangle,
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        label: 'High Risk'
      }
    case 'medium':
      return {
        icon: AlertCircle,
        bg: 'bg-warning/10',
        text: 'text-warning-foreground',
        label: 'Suspicious'
      }
    case 'low':
      return {
        icon: CheckCircle,
        bg: 'bg-success/10',
        text: 'text-success',
        label: 'Safe'
      }
    default:
      return {
        icon: AlertCircle,
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        label: 'Unknown'
      }
  }
}

export function MobileHistoryView() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
        <p className="text-muted-foreground">Your recent message analyses</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-destructive">3</p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-warning-foreground">1</p>
            <p className="text-xs text-muted-foreground">Suspicious</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-success">1</p>
            <p className="text-xs text-muted-foreground">Safe</p>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {historyItems.map((item) => {
          const config = getRiskConfig(item.riskLevel)
          const Icon = config.icon
          return (
            <Card key={item.id} className="border-border/50 cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </div>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
