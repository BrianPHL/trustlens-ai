'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, User, Mail, Award, Zap, History, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }

    getProfile()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Shield className="w-12 h-12 text-primary animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Space */}
      <div className="h-16 md:h-20" />

      <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-10 space-y-8">
        
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden shadow-xl">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-background shadow-lg">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                {profile?.display_name || user?.email?.split('@')[0] || 'User Profile'}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary/70" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-sm capitalize">{profile?.scam_awareness_level || 'Beginner'} Level</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button variant="outline" className="rounded-xl border-border/60 font-bold" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Immunity Score</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black">{profile?.immunity_score || 0}</span>
                <span className="text-muted-foreground text-sm font-bold mb-1">XP</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Total Scans</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black">{profile?.total_scans || 0}</span>
                <span className="text-muted-foreground text-sm font-bold mb-1">Items</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Status</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-emerald-500 uppercase">Protected</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold px-1">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group" asChild>
                <Link href="/history">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-primary" />
                    <span className="font-bold">View Scan History</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group" asChild>
                <Link href="/analyze">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-bold">New Message Scan</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold px-1">Account Security</h3>
            <Card className="border-border/50 bg-card/50 overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Google Authentication</p>
                    <p className="text-xs text-muted-foreground">Your account is secured via Google OAuth.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Active Protection</p>
                    <p className="text-xs text-muted-foreground">TrustLens AI is monitoring your digital safety.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
