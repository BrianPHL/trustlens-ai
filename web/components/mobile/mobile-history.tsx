'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Search, 
  Trash2,
  ShieldCheck,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns' // Helpful for relative timestamps

// --- Types ---
interface ScanHistoryItem {
  id: string
  content: string // Mapping 'message' to 'content' based on standard DB naming
  is_scam: boolean
  risk_score: number // 0-100
  created_at: string
}

const getRiskConfig = (isScam: boolean, score: number) => {
  if (isScam || score > 70) {
    return {
      icon: AlertTriangle,
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-100 dark:border-red-900/50',
      text: 'text-red-600 dark:text-red-400',
      label: 'High Risk'
    }
  }
  if (score > 30) {
    return {
      icon: AlertCircle,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-100 dark:border-amber-900/50',
      text: 'text-amber-600 dark:text-amber-400',
      label: 'Suspicious'
    }
  }
  return {
    icon: CheckCircle,
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Safe'
  }
}

export function MobileHistoryView() {
  const supabase = createClient()
  const [items, setItems] = useState<ScanHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  // 1. Fetch History from Database
  useEffect(() => {
    async function fetchHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setItems(data)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [])

  // 2. Delete All History Logic
  const handleClearHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('scans')
      .delete()
      .eq('user_id', user.id)

    if (!error) setItems([])
  }

  // Dynamic Stats Calculated from DB Items
  const stats = useMemo(() => ({
    high: items.filter(i => i.is_scam || i.risk_score > 70).length,
    medium: items.filter(i => !i.is_scam && i.risk_score > 30 && i.risk_score <= 70).length,
    low: items.filter(i => !i.is_scam && i.risk_score <= 30).length,
  }), [items])

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase())
      
      const config = getRiskConfig(item.is_scam, item.risk_score)
      const level = config.label.toLowerCase().includes('high') ? 'high' : 
                    config.label.toLowerCase().includes('suspicious') ? 'medium' : 'low'
      
      const matchesFilter = activeFilter === 'all' || level === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, activeFilter, items])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-5 pb-32 bg-[#F9FAFB] dark:bg-background min-h-screen font-geist">
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Scan History</h1>
            <p className="text-sm text-slate-500 font-medium">Monitoring your digital safety</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-2xl bg-white shadow-sm border-slate-200 active:bg-red-50"
            onClick={handleClearHistory}
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
          </Button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search logs..." 
            className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High', val: stats.high, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Warning', val: stats.medium, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Safe', val: stats.low, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className={`p-4 text-center ${stat.bg}`}>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'high', 'medium', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === f 
              ? 'bg-slate-900 text-white shadow-lg scale-105' 
              : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const config = getRiskConfig(item.is_scam, item.risk_score)
              const Icon = config.icon
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className={`border-none shadow-sm rounded-[2rem] hover:shadow-md transition-all active:scale-[0.98] bg-white group`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl ${config.bg} ${config.border} border`}>
                          <Icon className={`w-6 h-6 ${config.text}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md ${config.bg} ${config.text}`}>
                              {config.label}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </div>
                          </div>
                          
                          <p className="text-sm font-medium text-slate-700 leading-snug line-clamp-2 italic">
                            "{item.content}"
                          </p>
                        </div>
                        
                        <div className="self-center">
                           <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-medium italic">No logs found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
