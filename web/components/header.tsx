'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, Menu, X, User, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlatform } from '@/hooks/use-platform'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/immunity-mode', label: 'Scam Immunity' },
  { href: '/extension', label: 'Browser Extension' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isNative, isMobile } = usePlatform()
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  // Hide header on mobile view or native apps
  if (isNative || isMobile) return null

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-[1400px] mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            TrustLens <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-all hover:text-primary ${pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 border-l border-border/50 pl-10">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild className="font-semibold h-11 px-5 rounded-xl">
                  <Link href="/history">Activity</Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="font-bold h-11 px-5 rounded-xl border-border/60">
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="ghost" asChild className="font-semibold h-11 px-5 rounded-xl">
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            <Button asChild className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
              <Link href="/analyze">Start Free Analysis</Link>
            </Button>
          </div>
        </div>

        {/* Tablet/Mobile Action */}
        <div className="flex lg:hidden items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-10 w-10 border border-border/40"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="container flex flex-col py-6 px-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-bold text-muted-foreground hover:text-primary py-2 transition-colors flex items-center justify-between"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
                <ChevronRight className="w-4 h-4 opacity-30" />
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-border/40 flex flex-col gap-3">
              {user ? (
                <>
                  <Button asChild variant="outline" className="h-12 rounded-xl font-bold">
                    <Link href="/history">My Scan History</Link>
                  </Button>
                  <Button onClick={handleSignOut} variant="ghost" className="h-12 rounded-xl font-bold text-red-500">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" className="h-12 rounded-xl font-bold">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
              <Button className="h-12 rounded-xl font-bold shadow-lg shadow-primary/20" asChild>
                <Link href="/analyze">Start Scan Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}


