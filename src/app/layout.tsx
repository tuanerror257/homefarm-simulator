import type { Metadata } from 'next'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  weight: ['400'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'tada.vibes — Góc nhỏ của Tada',
    template: '%s | tada.vibes',
  },
  description: 'Thoughts, vibes, và những thứ linh tinh.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'tada.vibes',
    description: 'Góc nhỏ của Tada',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${playfair.variable} ${inter.variable} ${mono.variable}`}>
      <body style={{ backgroundColor: '#F5F0E8', color: '#1C1A16', fontFamily: 'var(--font-sans)' }}>
        {children}
      </body>
    </html>
  )
}
