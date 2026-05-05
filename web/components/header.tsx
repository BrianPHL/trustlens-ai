'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, Menu, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlatform } from '@/hooks/use-platform'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/#product', label: 'Product' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/immunity-mode', label: 'Scam Immunity' },
  { href: '/extension', label: 'Browser Extension' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isNative } = usePlatform()
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

  // Don't show header on native mobile app
  if (isNative) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">TrustLens AI</span>
        </Link>

        {/* Right Side: Navigation & CTAs */}
        <div className="hidden md:flex items-center ml-auto gap-8">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 border-l border-border/50 pl-6">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/history">History</Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            <Button asChild>
              <Link href="/analyze">Start Scan</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button & Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {user && (
            <Link href="/history" className="p-2 text-muted-foreground">
              <User className="w-5 h-5" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container flex flex-col py-4 px-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button className="mt-2 w-full" asChild>
              <Link href="/analyze">Start Scan</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
