'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield, ArrowLeft, History, Loader2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setLoading(false)
        return
      }

      setUser(session.user)

      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setHistory(data)
      }
      setLoading(false)
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading scan history...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view history</h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access your previous scan results.
          </p>
          <Button asChild className="w-full">
            <Link href="/login?next=/history">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mr-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-2 border-l border-border pl-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">TrustLens AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <History className="w-7 h-7" /> Scan History
            </h1>
            <p className="text-muted-foreground">Your recent messages and their risk analysis.</p>
          </div>
          <Button asChild>
            <Link href="/analyze">New Scan</Link>
          </Button>
        </div>

        {history.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No history yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Your past scan results will appear here once you start analyzing messages.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((scan) => {
              const isHigh = scan.risk_level === 'high'
              const isMedium = scan.risk_level === 'medium'
              
              return (
                <Card key={scan.id} className="overflow-hidden border-border/50 hover:border-border transition-colors">
                  <div className={`h-1.5 w-full ${isHigh ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <CardContent className="p-0">
                    <div className="grid sm:grid-cols-[140px_1fr] gap-4 p-5 items-center">
                      <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                        <div className="text-3xl font-bold text-foreground">{scan.risk_score}</div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">Risk Score</div>
                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                          isHigh ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          isMedium ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {isHigh ? <AlertTriangle className="w-3 h-3" /> : isMedium ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {scan.risk_level.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                          <span>{new Date(scan.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{scan.signals_detected?.length || 0} signals detected</span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                          "{scan.message_text}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
