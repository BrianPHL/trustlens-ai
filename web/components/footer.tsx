'use client'

import Link from 'next/link'
import { Shield, Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">TrustLens AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered scam detection and education to keep you safe online.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Start Scan</Link></li>
              <li><Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="/immunity-mode" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Scam Immunity</Link></li>
              <li><Link href="/extension" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browser Extension</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Activity History</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2026 TrustLens AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
