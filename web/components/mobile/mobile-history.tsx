'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Trash2,
  ShieldCheck,
  Loader2,
  BarChart3,
  History,
  Lock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

// Unifying Risk Logic from both platforms
const getRiskConfig = (level: string, score: number) => {
  if (level === 'high' || score > 70) {
    return {
      icon: AlertTriangle,
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-100 dark:border-red-900/50',
      text: 'text-red-600 dark:text-red-400',
      label: 'High Risk'
    }
  }
  if (level === 'medium' || score > 30) {
    return {
      icon: AlertCircle,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-100 dark:border-amber-900/50',
      text: 'text-amber-600 dark:text-amber-400',
      label: 'Suspicious'
    }
  }
  return {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Safe'
  }
}

export function MobileHistoryView({ user }: { user: any }) {
  const supabase = createClient()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setHistory(data)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [user])

  // 2. Feature: Individual Delete (Merged from Web)
  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('scan_history').delete().eq('id', id)
    if (!error) {
      setHistory(prev => prev.filter(item => item.id !== id))
    }
  }

  // 3. Stats Calculation (Merged from Web)
  const stats = useMemo(() => ({
    total: history.length,
    high: history.filter(s => s.risk_level === 'high').length,
    safe: history.filter(s => s.risk_level === 'low').length,
  }), [history])

  // 4. Unified Filtering & Search Logic
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch = item.message_text.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = activeFilter === 'all' || item.risk_level === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [history, searchQuery, activeFilter])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center space-y-6 font-geist">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <Lock className="w-8 h-8 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">History Locked</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-[260px]">
            Log in to your TrustLens account to view your past scans and security alerts across all your devices.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/login'} className="w-full max-w-[200px] h-12 rounded-2xl font-bold shadow-lg shadow-primary/20">
          Sign In to Unlock
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-5 pb-32 bg-[#F9FAFB] dark:bg-background min-h-screen font-geist">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="w-7 h-7 text-primary" /> History
            </h1>
            <p className="text-sm text-slate-500 font-medium italic">
              Monitoring {stats.total} analyses
            </p>
          </div>
          <Button asChild className="rounded-2xl h-12 px-5 shadow-lg shadow-primary/20">
             <a href="/analyze">New Scan</a>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search messages..." 
            className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm text-sm dark:bg-muted/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Overview (Web Features in Mobile UI) */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-muted/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-blue-600">{stats.total}</p>
            <p className="text-[10px] font-bold uppercase text-slate-500">Total</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-muted/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-red-600">{stats.high}</p>
            <p className="text-[10px] font-bold uppercase text-slate-500">Threats</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-muted/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-emerald-600">{stats.safe}</p>
            <p className="text-[10px] font-bold uppercase text-slate-500">Safe</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'high', 'medium', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === f 
              ? 'bg-slate-900 text-white shadow-lg scale-105 dark:bg-primary' 
              : 'bg-white text-slate-500 border border-slate-100 dark:bg-muted/20 dark:border-none'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => {
              const config = getRiskConfig(item.risk_level, item.risk_score)
              const Icon = config.icon
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-none shadow-sm rounded-[2rem] bg-white dark:bg-muted/10 group overflow-hidden">
                    {/* Visual indicator bar from web */}
                    <div className={`h-1.5 w-full ${
                      item.risk_level === 'high' ? 'bg-red-500' : 
                      item.risk_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl ${config.bg} ${config.border} border`}>
                          <Icon className={`w-6 h-6 ${config.text}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md ${config.bg} ${config.text}`}>
                              {item.risk_score} SCORE • {config.label}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug line-clamp-2 italic">
                            "{item.message_text}"
                          </p>
                          
                          <div className="flex items-center gap-3 pt-1">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">
                               {item.signals_detected?.length || 0} Signals
                             </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full h-8 w-8 hover:bg-red-50 hover:text-red-500" 
                            onClick={() => deleteEntry(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-muted/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-medium italic">
                {searchQuery ? "No matches found" : "No scan history yet"}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
