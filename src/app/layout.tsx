import type { Metadata } from 'next'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
})

// Inter: support tiếng Việt hoàn hảo, thay DM Sans
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
})

// JetBrains Mono: thay DM Mono, có latin-ext
const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  weight: ['400'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'tadavibes — Góc nhỏ của Tada',
  description: 'Thoughts, vibes, và những thứ linh tinh.',
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
