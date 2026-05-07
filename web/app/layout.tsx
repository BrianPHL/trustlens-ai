import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { PlatformProvider } from '@/hooks/use-platform'
import { Header } from '@/components/header'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'TrustLens AI - Scam Immunity Assistant',
  description: 'Detect suspicious messages, understand the risks, and train yourself to spot scams before they happen.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TrustLens AI',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/icon-512x512.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
    apple: '/apple-touch-icon.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PlatformProvider>
            <Header />
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </PlatformProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
