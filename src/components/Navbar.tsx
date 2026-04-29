'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/vibes', label: 'Góc Vô Tri' },
    { href: '/about', label: 'About' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px', borderBottom: '1px solid #DDD8CC' }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: '#1C1A16' }}>tada</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: '#C8102E', lineHeight: '0.85' }}>.</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: '#1C1A16', letterSpacing: '-0.8px' }}>vibes</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9A9895', letterSpacing: '1.5px', marginTop: 3 }}>
            Góc nhỏ của Tada
          </div>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {links.map(link => (
          <Link key={link.href} href={link.href} style={{ fontSize: 13, color: isActive(link.href) ? '#1C1A16' : '#5A5855', textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
            {link.label}
          </Link>
        ))}
        <Link href="/admin" style={{ fontSize: 13, color: '#3D5A3E', textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
          Admin
        </Link>

        {/* Search icon */}
        <Link href="/search" style={{ color: isActive('/search') ? '#1C1A16' : '#5A5855', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </Link>
      </div>
    </nav>
  )
}
