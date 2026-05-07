'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  User, Shield, Trophy, HelpCircle, LogOut, 
  ChevronRight, Moon, Camera, Loader2, Mail, Settings2,
  Smartphone, History, ShieldCheck, Sun, ChevronDown
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { hapticFeedback } from '@/lib/capacitor'

const UI_CONFIG = {
  DEFAULT_NAME: 'TrustLens User',
  VERSION: '1.0.0',
  LABELS: {
    PREFERENCES: 'Preferences',
    SECURITY: 'Security Details',
    SUPPORT: 'Support',
    STATS_BLOCKED: 'Blocked',
    STATS_SCORE: 'Score'
  }
}

const FAQS = [
  {
    question: 'What is TrustLens AI?',
    answer: 'TrustLens AI is a smart scam detection tool that protects you from phishing, fraud, and suspicious content in real time.'
  },
  {
    question: 'How does scam detection work?',
    answer: 'Our AI analyzes messages, links, and patterns to identify potential scams and alerts you before you interact with harmful content.'
  },
  {
    question: 'Is my data private?',
    answer: 'Yes. We never sell your data. All analysis is done securely and your personal information is never shared with third parties.'
  }
]

export function MobileProfileView({ user, setUser }: { user: any; setUser: (u: any) => void }) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || UI_CONFIG.DEFAULT_NAME)
  const [darkMode, setDarkMode] = useState(false)
  const [stats, setStats] = useState({ blocked: 0, score: 0 })
  
  // Dropdown States
  const [showFAQs, setShowFAQs] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [showPrivacy, setShowPrivacy] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setFullName(user.user_metadata?.full_name || UI_CONFIG.DEFAULT_NAME)
        
        const { count: blockedCount } = await supabase
          .from('scan_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('risk_level', 'high')

        setStats({
          blocked: blockedCount || 0,
          score: user.user_metadata?.trust_score || 0
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  const handleCameraButtonClick = () => fileInputRef.current?.click()

  const handleSignOut = async () => {
    await hapticFeedback('medium')
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    })
    if (!error) {
      setIsEditing(false)
      await hapticFeedback('light')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  // Guest View for Profile
  if (!user) {
    return (
      <div className="flex flex-col gap-8 p-6 pb-28 bg-[#FDFDFD] dark:bg-slate-950 min-h-screen transition-colors duration-300 font-geist">
        <div className="flex flex-col items-center pt-12 text-center space-y-4">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm">
            <User className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Join TrustLens</h2>
            <p className="text-sm text-slate-500 max-w-[240px]">Create an account to sync your history and earn trust rewards.</p>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full max-w-[200px] rounded-2xl h-12 font-bold shadow-lg shadow-primary/20">
            Sign In / Sign Up
          </Button>
        </div>

        <section className="space-y-3 pt-4">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">App Info</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
            <MenuRow icon={<Moon className="w-4 h-4" />} label="Dark Mode" toggle={<Switch checked={darkMode} onCheckedChange={setDarkMode} />} />
            <MenuRow icon={<ShieldCheck className="w-4 h-4" />} label="Version" value={UI_CONFIG.VERSION} />
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6 pb-28 bg-[#FDFDFD] dark:bg-slate-950 min-h-screen transition-colors duration-300">
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />

      {/* Profile Header - PHOTO LOGIC RESTORED */}
      <div className="flex flex-col items-center pt-6 font-geist">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             {/* Checks for user photo, otherwise shows default icon */}
             {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
          </div>
          <button 
            onClick={handleCameraButtonClick}
            className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-800 text-slate-600 rounded-full shadow-md border border-slate-100 dark:border-slate-700 active:scale-90"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center mt-5 space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{fullName}</h2>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-sm font-medium">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </div>
        </div>
      </div>

      {/* Stats Board */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="text-center flex-1 border-r border-slate-50 dark:border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{UI_CONFIG.LABELS.STATS_BLOCKED}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.blocked}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{UI_CONFIG.LABELS.STATS_SCORE}</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.score}%</p>
        </div>
      </div>

      {/* Menu System */}
      <div className="space-y-7 font-geist">
        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">{UI_CONFIG.LABELS.PREFERENCES}</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
            <MenuRow icon={<Settings2 className="w-4 h-4" />} label="Edit Profile" onClick={() => setIsEditing(true)} />
            <MenuRow icon={darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} label="Dark Mode" toggle={<Switch checked={darkMode} onCheckedChange={setDarkMode} />} />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">{UI_CONFIG.LABELS.SECURITY}</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
            <MenuRow icon={<Smartphone className="w-4 h-4" />} label="Linked Devices" value="1 Active" />
            
            {/* Privacy Policy Dropdown - Logic Added */}
            <div className="border-t border-slate-50 dark:border-slate-800">
              <div 
                onClick={() => { setShowPrivacy(!showPrivacy); hapticFeedback('light') }}
                className="flex items-center justify-between p-5 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Privacy Policy</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${showPrivacy ? 'rotate-180' : ''}`} />
              </div>
              {showPrivacy && (
                <div className="px-6 pb-5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-2 animate-in fade-in slide-in-from-top-1">
                  <p>• Data is processed using end-to-end encryption.</p>
                  <p>• Personal identification is never sold to third parties.</p>
                  <p>• You can request data deletion at any time via support.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">{UI_CONFIG.LABELS.SUPPORT}</h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
            
            {/* Help Center (FAQs) Dropdown - Logic Added */}
            <div 
              onClick={() => { setShowFAQs(!showFAQs); hapticFeedback('light') }}
              className="flex items-center justify-between p-5 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Help Center</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${showFAQs ? 'rotate-180' : ''}`} />
            </div>

            {showFAQs && (
              <div className="bg-slate-50/50 dark:bg-slate-800/20 pb-2">
                {FAQS.map((faq, index) => (
                  <div key={index} className="border-t border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => { setOpenFAQ(openFAQ === index ? null : index); hapticFeedback('light') }}
                      className="w-full flex justify-between p-4 text-left text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {faq.question}
                      <ChevronDown className={`w-3 h-3 mt-1 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openFAQ === index && (
                      <p className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 animate-in fade-in slide-in-from-top-1">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <MenuRow icon={<LogOut className="w-4 h-4" />} label="Sign Out" onClick={handleSignOut} danger />
          </div>
        </section>
      </div>

      {/* Edit Profile sheet */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 backdrop-blur-[2px]">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h3>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mb-4" />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button className="flex-1 rounded-2xl" onClick={handleUpdateProfile}>
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuRow({ icon, label, onClick, toggle, danger, value }: any) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-5 active:bg-slate-50 dark:active:bg-slate-800 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
          {icon}
        </div>
        <span className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {value && <span className="text-xs font-bold text-slate-400">{value}</span>}
        {toggle ? toggle : !danger && <ChevronRight className="w-4 h-4 text-slate-300" />}
      </div>
    </div>
  )
}
