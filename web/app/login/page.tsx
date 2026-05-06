'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Loader2, 
  AlertCircle, 
  EyeOff, 
  Eye, 
  Shield, 
  Chrome, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  BrainCircuit,
  ScanText,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Lock,
  MessageSquareWarning
} from 'lucide-react'

const MySwal = withReactContent(Swal)

// --- Feature Data Updated to Match App Functionality ---

const features = [
  {
    icon: MessageSquareWarning,
    title: "Phishing SMS & Email Analysis",
    description: "Detect suspicious messages and understand the risks using our advanced neural analysis models.",
    accent: "text-blue-400"
  },
  {
    icon: ScanText,
    title: "OCR Message Scanning",
    description: "Capture or upload screenshots of messages to instantly extract and analyze hidden scam indicators.",
    accent: "text-emerald-400"
  },
  {
    icon: ShieldCheck,
    title: "Scam Immunity Assistant",
    description: "Train yourself to spot scams before they happen with personalized feedback and safety challenges.",
    accent: "text-purple-400"
  }
]

// --- Splash Screen Sub-Components ---

function FeatureSlider() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % features.length)
  const prev = () => setCurrent((prev) => (prev - 1 + features.length) % features.length)

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center py-8"
          >
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mb-6 backdrop-blur-md shadow-2xl">
              {(() => {
                const Icon = features[current].icon
                return <Icon className={`w-14 h-14 ${features[current].accent}`} strokeWidth={1.5} />
              })()}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              {features[current].title}
            </h3>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium px-4">
              {features[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2">
        <button onClick={prev} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex gap-2">
          {features.map((_, i) => (
            <div key={i} className={`h-1.5 transition-all duration-300 rounded-full ${i === current ? 'w-8 bg-primary' : 'w-2 bg-slate-800'}`} />
          ))}
        </div>
        <button onClick={next} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  )
}

function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden flex flex-col items-center justify-between py-16 px-6">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Enterprise Grade Security</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-none mb-4">
          TrustLens <span className="text-primary">AI</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base font-bold uppercase tracking-[0.2em]">Scam Immunity Suite</p>
      </motion.div>

      <div className="relative z-10 w-full flex-grow flex items-center justify-center">
        <FeatureSlider />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 w-full max-w-md">
        <Button 
          size="lg" 
          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xl shadow-2xl shadow-primary/20 group" 
          onClick={onStart}
        >
           Let&apos;s Get Started
          <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-center text-slate-600 text-[10px] mt-4 uppercase tracking-[0.2em] font-extrabold italic">
          Shielding your digital footprint &copy; 2026
        </p>
      </motion.div>
    </div>
  )
}

function AuthForm({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/'
  const supabase = createClient()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!isLogin) {
        const { error: authError } = await supabase.auth.signUp({
          email, password, options: { 
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            data: { full_name: fullName } 
          }
        })
        if (authError) throw authError
        MySwal.fire({ title: 'Success', text: 'Verification link sent!', icon: 'success', confirmButtonColor: '#6320EE' })
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) throw authError
        router.push(nextPath)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` 
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const variants: Variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans overflow-x-hidden">
      <div className="relative w-full md:w-5/12 bg-primary flex flex-col items-center justify-center py-12 md:py-0 md:min-h-screen overflow-hidden shadow-2xl z-20">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-[80px]" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex flex-col items-center text-center px-6">
          <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-xl border border-white/10 mb-6">
            <Shield className="w-14 h-14 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">TrustLens AI</h2>
          <p className="text-white/50 text-xs uppercase tracking-[0.3em] mt-2 font-bold">Secure Access</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10 bg-white">
        <div className="w-full max-w-[420px]">
          <AnimatePresence mode="wait" custom={isLogin ? -1 : 1}>
            <motion.div key={isLogin ? 'login' : 'signup'} custom={isLogin ? -1 : 1} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-8">
              <header>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Join the Suite'}</h2>
                <p className="text-slate-500 mt-2 font-medium">{isLogin ? 'Authorize your digital identity.' : 'Start your journey to scam immunity.'}</p>
              </header>

              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest ml-1">Full Identity Name</label>
                    <Input placeholder="Full Name" className="h-14 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl focus:border-primary transition-all px-5" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type="email" placeholder="name@domain.com" className="h-14 pl-12 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl focus:border-primary transition-all shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Master Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-14 pl-12 pr-14 bg-slate-50 border-slate-200 text-slate-900 rounded-2xl focus:border-primary transition-all shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/20 text-lg mt-4 transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Profile')}
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span></div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 border-slate-100 bg-white text-slate-600 hover:bg-slate-50 rounded-2xl font-bold shadow-sm" 
                onClick={handleGoogleLogin} 
                disabled={loading}
              >
                <Chrome className="mr-2 h-5 w-5" /> Google
              </Button>

              <div className="text-center pt-4">
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
                  {isLogin ? <>New here? <span className="text-primary underline underline-offset-4">Create Profile</span></> : <>Existing member? <span className="text-primary underline underline-offset-4">Sign In</span></>}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth >= 768) {
        setShowAuth(true)
      } else {
        setShowAuth(false)
      }
      setIsReady(true)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isReady) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-white">
        <Shield className="w-12 h-12 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-white">
        <Shield className="w-12 h-12 text-primary animate-pulse" />
      </div>
    }>
      <AnimatePresence mode="wait">
        {!showAuth ? (
          <motion.div key="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
            <SplashScreen onStart={() => setShowAuth(true)} />
          </motion.div>
        ) : (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <AuthForm onBack={() => setShowAuth(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </Suspense>
  )
}