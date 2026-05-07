'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Upload, 
  Trophy, 
  ChevronRight, 
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  Star
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { hapticFeedback } from '@/lib/capacitor'
import { usePlatform } from '@/hooks/use-platform'
import { createClient } from '@/lib/supabase/client'

// --- CONFIGURATION: CENTRALIZED CONTENT ---
const DASHBOARD_UI = {
  GUEST: {
    TITLE: "Overview",
    BADGE: "Join users staying safe from phishing",
    HISTORY_LOCKED_TITLE: "Smart History Locked",
    HISTORY_LOCKED_DESC: "Keep a permanent log of all your scam detections and sync across devices."
  },
  ACTIONS: {
    SCAN: { title: "Paste Message", desc: "Analyze text for scam indicators", color: "bg-blue-500/10", iconColor: "text-blue-600 dark:text-blue-400" },
    UPLOAD: { title: "Upload Screenshot", desc: "Extract and analyze image text", color: "bg-purple-500/10", iconColor: "text-purple-600 dark:text-purple-400" },
    CHALLENGE: { title: "Start Challenge", desc: "Test your scam detection skills" }
  }
}

// --- SUB-COMPONENT: ACCOUNT VIEW ---
function MobileHomeAccount({ user, stats, handleCardPress }: { user: any; stats: any; handleCardPress: (tab: string) => void }) {
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0];

  return (
    <div className="flex flex-col gap-6 p-5 pb-28 min-h-screen bg-background font-geist">
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Hi, {userName}
          </h1>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            24/7 Security Active
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shadow-sm">
           <span className="text-xs font-bold uppercase">{user.email?.charAt(0)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <ActionCard 
          {...DASHBOARD_UI.ACTIONS.SCAN}
          icon={<FileText className={DASHBOARD_UI.ACTIONS.SCAN.iconColor} />} 
          onClick={() => handleCardPress('scan')} 
        />
        
        <Card 
          className="cursor-pointer active:scale-[0.98] transition-all border-0 bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25"
          onClick={() => handleCardPress('challenge')}
        >
          <CardContent className="flex items-center gap-4 p-4 text-white font-geist">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 shadow-inner">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight">{DASHBOARD_UI.ACTIONS.CHALLENGE.title}</h3>
              <p className="text-sm font-medium opacity-80">{DASHBOARD_UI.ACTIONS.CHALLENGE.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-80" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<FileText className="w-4 h-4" />} value={stats.totalScans} label="Scans" />
        <StatCard icon={<ShieldAlert className="w-4 h-4 text-destructive" />} value={stats.blocked} label="Blocked" color="destructive" />
        <StatCard icon={<Zap className="w-4 h-4 text-emerald-500" />} value={`${stats.accuracy}%`} label="Score" color="emerald" />
      </div>
    </div>
  )
}

// --- SUB-COMPONENT: GUEST VIEW ---
function MobileHomeGuest({ handleCardPress }: { handleCardPress: (tab: string) => void }) {
  return (
    <div className="flex flex-col gap-6 p-5 pb-28 min-h-screen bg-background font-geist">
      <div className="space-y-2 pt-2 font-geist">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{DASHBOARD_UI.GUEST.TITLE}</h1>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <p className="text-xs font-semibold text-primary">{DASHBOARD_UI.GUEST.BADGE}</p>
        </div>
      </div>

      <div className="space-y-3">
        <ActionCard 
          {...DASHBOARD_UI.ACTIONS.SCAN}
          icon={<FileText className={DASHBOARD_UI.ACTIONS.SCAN.iconColor} />} 
          onClick={() => handleCardPress('scan')} 
        />
        <ActionCard 
          {...DASHBOARD_UI.ACTIONS.UPLOAD}
          icon={<Upload className={DASHBOARD_UI.ACTIONS.UPLOAD.iconColor} />} 
          onClick={() => handleCardPress('upload')} 
        />
      </div>

      <Card className="border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
        <CardContent className="p-6 text-center space-y-4 font-geist">
          <div className="w-12 h-12 bg-background rounded-full mx-auto flex items-center justify-center shadow-sm border border-border">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">{DASHBOARD_UI.GUEST.HISTORY_LOCKED_TITLE}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-2">{DASHBOARD_UI.GUEST.HISTORY_LOCKED_DESC}</p>
          </div>
          <Button onClick={() => handleCardPress('profile')} className="w-full font-bold shadow-md h-11">
            Create Free Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// --- MAIN EXPORT COMPONENT ---
export function MobileHomeView({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { isNative } = usePlatform()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalScans: 0, blocked: 0, accuracy: 0 })

  useEffect(() => {
    const supabase = createClient()
    
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null;
      setUser(currentUser)

      if (currentUser) {
        // Fetch dynamic stats from Supabase
        const { count: scanCount } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id);

        const { count: blockedCount } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id)
          .eq('is_scam', true);

        // Fetch user score from profile or challenge table
        const { data: profile } = await supabase
          .from('profiles')
          .select('trust_score')
          .eq('id', currentUser.id)
          .single();

        setStats({
          totalScans: scanCount || 0,
          blocked: blockedCount || 0,
          accuracy: profile?.trust_score || 0
        })
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleCardPress = async (tab: string) => {
    if (isNative) {
      await hapticFeedback('medium')
    }
    onNavigate(tab)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background font-geist">
        <div className="animate-pulse text-muted-foreground font-medium">Protecting...</div>
      </div>
    )
  }

  return user ? (
    <MobileHomeAccount user={user} stats={stats} handleCardPress={handleCardPress} />
  ) : (
    <MobileHomeGuest handleCardPress={handleCardPress} />
  )
}

// --- HELPER SHARED COMPONENTS ---
function ActionCard({ title, desc, icon, color, onClick }: any) {
  return (
    <Card className="cursor-pointer active:scale-[0.98] transition-all border-border/40 bg-card/50 backdrop-blur-sm" onClick={onClick}>
      <CardContent className="flex items-center gap-4 p-4 font-geist">
        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${color} border border-border/10`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-sm leading-none mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

function StatCard({ icon, value, label, color = "muted" }: any) {
  const borderClass = color === 'destructive' ? 'border-destructive/20' : color === 'emerald' ? 'border-emerald-500/20' : 'border-border/40';
  const bgClass = color === 'destructive' ? 'bg-destructive/5' : color === 'emerald' ? 'bg-emerald-500/5' : 'bg-muted/30';
  const textClass = color === 'destructive' ? 'text-destructive' : color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground';

  return (
    <Card className={`${borderClass} ${bgClass} shadow-sm font-geist`}>
      <CardContent className="p-3 text-center flex flex-col items-center justify-center gap-1.5 h-full">
        <div className="p-1.5 bg-background rounded-lg border border-border/50 shadow-sm mb-1">
          {icon}
        </div>
        <div className="space-y-0.5">
          <p className={`text-xl font-bold leading-none ${textClass}`}>{value}</p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${color !== 'muted' ? textClass + '/80' : 'text-muted-foreground'}`}>{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
