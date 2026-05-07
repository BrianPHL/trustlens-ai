'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, Upload, Trophy, ChevronRight, ShieldCheck, 
  ShieldAlert, Zap, TrendingUp, ArrowUpRight, 
  Target, Info, Fingerprint, Activity
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

// Using named export to match your import { MobileHomeView }
export function MobileHomeView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, blocked: 0, trust: 0 })
  const [latestThreat, setLatestThreat] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setLoading(false)
        return
      }
      setUser(session.user)

      // Fetch unified data from scan_history
      const [historyData, profileData] = await Promise.all([
        supabase.from('scan_history').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('trust_score').eq('id', session.user.id).single()
      ])

      const history = historyData.data || []
      const blocked = history.filter(s => s.risk_level === 'high').length
      const latest = history.find(s => s.risk_level === 'high')

      setStats({
        total: history.length,
        blocked: blocked,
        trust: profileData.data?.trust_score || 0
      })
      if (latest) setLatestThreat(latest)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <LoadingState />

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 p-5 pb-32 bg-[#F8FAFC] dark:bg-background min-h-screen font-geist"
    >
      {/* 1. Header Section */}
      <div className="flex items-center justify-between pt-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">TrustLens AI v3.0</p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Hi, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
          </h1>
        </div>
        <button 
          onClick={() => onNavigate('profile')}
          className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden active:scale-90 transition-transform"
        >
          <Fingerprint className="w-6 h-6 text-primary" />
        </button>
      </div>

      {/* 2. Main Protection Card (Glassmorphism) */}
      <Card className="relative overflow-hidden border-none bg-slate-900 dark:bg-primary shadow-2xl shadow-primary/25 rounded-[2.5rem]">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <ShieldCheck className="w-32 h-32 text-white" />
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mb-1">Safety Accuracy</p>
              <h2 className="text-6xl font-black text-white">{stats.trust}%</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-bold text-white/70 uppercase">
                <span>Vulnerability</span>
                <span>Secure</span>
             </div>
             <Progress value={stats.trust} className="h-2 bg-white/10" />
             <p className="text-blue-100/60 text-[11px] font-medium italic">
               Protecting against {stats.total} scanned vectors.
             </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Quick Stats Mini-Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatItem label="Scans" val={stats.total} />
        <StatItem label="Threats" val={stats.blocked} color="text-red-500" />
        <StatItem label="Rank" val="Gold" color="text-amber-500" />
      </div>

      {/* 4. Action Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-slate-900 dark:text-white text-lg">Defend Now</h3>
          <Target className="w-4 h-4 text-primary" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <ActionTile 
            title="Paste Text" 
            desc="AI Content Scan"
            icon={<FileText className="w-6 h-6 text-blue-600" />} 
            color="bg-blue-50" 
            onClick={() => onNavigate('scan')} 
          />
          <ActionTile 
            title="Scan Image" 
            desc="OCR Detection"
            icon={<Upload className="w-6 h-6 text-indigo-600" />} 
            color="bg-indigo-50" 
            onClick={() => onNavigate('upload')} 
          />
        </div>

        {/* 5. Training Lab / Challenge Call-to-Action */}
        <Card 
          className="cursor-pointer active:scale-[0.98] transition-all border-none bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/20 rounded-3xl"
          onClick={() => onNavigate('challenge')}
        >
          <CardContent className="flex items-center gap-4 p-5 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Security Training Lab</h3>
              <p className="text-[11px] opacity-80">Test your skills, earn +10 Trust Score</p>
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-60" />
          </CardContent>
        </Card>
      </div>

      {/* 6. Threat Intel Section */}
      {latestThreat && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1 text-red-600">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Recent Threat Log</span>
          </div>
          <Card className="border-none bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate italic">
                  "{latestThreat.message_text}"
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">
                    Risk: {latestThreat.risk_score}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Info className="w-3 h-3" /> Reported Today
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" onClick={() => onNavigate('history')} />
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}

// --- SUB-COMPONENTS ---

function StatItem({ label, val, color = "text-slate-900 dark:text-white" }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 text-center">
      <p className={`text-xl font-black ${color}`}>{val}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
    </div>
  )
}

function ActionTile({ title, desc, icon, color, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className={`${color} dark:bg-slate-900 p-5 rounded-[2.5rem] flex flex-col gap-4 active:scale-95 transition-all shadow-sm border border-transparent dark:border-slate-800`}
    >
      <div className="bg-white dark:bg-slate-800 p-3 w-fit rounded-2xl shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
        <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-background">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-8 h-8" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Secure Cloud</p>
    </div>
  )
}
