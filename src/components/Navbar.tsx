'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/vibes', label: 'Góc Vô Tri' },
    { href: '/about', label: 'About' },
    { href: '/admin', label: 'Admin', color: '#3D5A3E' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: open ? 'none' : '1px solid #DDD8CC' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: '#1C1A16' }}>tada</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#C8102E', lineHeight: '0.85' }}>.</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, fontStyle: 'italic', color: '#1C1A16', letterSpacing: '-0.8px' }}>vibes</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9A9895', letterSpacing: '1.5px', marginTop: 3 }}>
              Góc nhỏ của Tada
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="desktop-nav">
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{ fontSize: 13, color: link.color || (isActive(link.href) ? '#1C1A16' : '#5A5855'), textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
              {link.label}
            </Link>
          ))}
          <Link href="/search" style={{ color: isActive('/search') ? '#1C1A16' : '#5A5855', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>

        {/* Mobile right — search + hamburger */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }} className="mobile-nav">
          <Link href="/search" style={{ color: '#5A5855', display: 'flex', alignItems: 'center' }} onClick={() => setOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}
            aria-label="Menu"
          >
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#1C1A16', transition: 'all 0.2s', transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span style={{ display: 'block', width: 16, height: 1.5, background: '#1C1A16', transition: 'all 0.2s', opacity: open ? 0 : 1 }} />
            <span style={{ display: 'block', width: 22, height: 1.5, background: '#1C1A16', transition: 'all 0.2s', transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {open && (
        <div style={{ borderBottom: '1px solid #DDD8CC', paddingBottom: 24 }} className="mobile-menu">
          {links.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setOpen(false)}
              style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: isActive(link.href) ? '#1C1A16' : '#5A5855', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #F0EBE0' }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }
        .mobile-menu { display: none !important; }

        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </>
  )
}
