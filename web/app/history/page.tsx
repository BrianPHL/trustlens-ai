'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Shield, ArrowLeft, History, Loader2, AlertTriangle, 
  AlertCircle, CheckCircle2, Search, Trash2, 
  Filter, BarChart3, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  
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

  // --- New Feature: Clear Individual History ---
  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('scan_history').delete().eq('id', id)
    if (!error) {
      setHistory(prev => prev.filter(item => item.id !== id))
    }
  }

  // --- New Feature: Stats Calculation ---
  const stats = useMemo(() => {
    return {
      total: history.length,
      highRisk: history.filter(s => s.risk_level === 'high').length,
      safe: history.filter(s => s.risk_level === 'low').length,
    }
  }, [history])

  // --- New Feature: Search & Filter Logic ---
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.message_text.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filter === 'all' || item.risk_level === filter
      return matchesSearch && matchesFilter
    })
  }, [history, searchQuery, filter])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p className="animate-pulse">Loading scan history...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign in to view history</h2>
          <p className="text-muted-foreground mb-6">
            Access your secure cloud-synced history to track potential scams over time.
          </p>
          <Button asChild className="w-full h-12 rounded-xl shadow-lg shadow-primary/20">
            <Link href="/login?next=/history">Sign In to TrustLens</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mr-6">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 border-l border-border pl-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg shadow-sm shadow-primary/20">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">TrustLens AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* --- Header Section --- */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground mb-2 flex items-center gap-3">
              <History className="w-9 h-9 text-primary" /> Scan History
            </h1>
            <p className="text-muted-foreground">Monitoring {stats.total} analyses for your security.</p>
          </div>
          <Button asChild className="rounded-xl h-11 px-6 shadow-md">
            <Link href="/analyze">New Analysis</Link>
          </Button>
        </div>

        {/* --- Stats Overview Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white dark:bg-muted/20 border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><BarChart3 className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-xs font-bold text-muted-foreground uppercase">Total Scans</p><p className="text-2xl font-black">{stats.total}</p></div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-muted/20 border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
              <div><p className="text-xs font-bold text-muted-foreground uppercase">Threats Blocked</p><p className="text-2xl font-black">{stats.highRisk}</p></div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-muted/20 border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
              <div><p className="text-xs font-bold text-muted-foreground uppercase">Safe Messages</p><p className="text-2xl font-black">{stats.safe}</p></div>
            </CardContent>
          </Card>
        </div>

        {/* --- Search and Filters --- */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search history..." 
              className="pl-10 rounded-xl bg-white border-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'high', 'medium', 'low'] as const).map((lv) => (
              <Button 
                key={lv}
                variant={filter === lv ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(lv)}
                className="rounded-lg capitalize text-xs font-bold h-10 px-4"
              >
                {lv}
              </Button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-dashed bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold mb-2">No scans found</h3>
                <p className="text-muted-foreground max-w-sm italic">
                  {searchQuery ? "No matches for your search terms." : "Your past analyses will stay here for your reference."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((scan) => {
                const isHigh = scan.risk_level === 'high'
                const isMedium = scan.risk_level === 'medium'
                
                return (
                  <motion.div 
                    layout
                    key={scan.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white dark:bg-muted/10">
                      <div className={`h-1 w-full ${isHigh ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <CardContent className="p-0">
                        <div className="grid sm:grid-cols-[140px_1fr_auto] gap-4 p-5 items-center">
                          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-background border border-slate-100 dark:border-border text-center">
                            <div className={`text-3xl font-black ${isHigh ? 'text-red-600' : isMedium ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {scan.risk_score}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Score</div>
                            <div className={`mt-2 flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                              isHigh ? 'bg-red-100 text-red-700' : 
                              isMedium ? 'bg-amber-100 text-amber-700' : 
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {scan.risk_level}
                            </div>
                          </div>
                          
                          <div className="min-w-0">
                            <div className="text-[11px] text-muted-foreground mb-2 flex items-center gap-3">
                              <span className="flex items-center gap-1 font-bold text-slate-500"><Clock className="w-3 h-3" /> {new Date(scan.created_at).toLocaleDateString()}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span className="font-bold">{scan.signals_detected?.length || 0} Security Signals</span>
                            </div>
                            <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed italic text-slate-700 dark:text-slate-300">
                              "{scan.message_text}"
                            </p>
                          </div>

                          <div className="flex sm:flex-col gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => deleteEntry(scan.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}