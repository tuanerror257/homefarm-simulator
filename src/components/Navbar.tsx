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

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 0 20px',
      borderBottom: '1px solid #DDD8CC',
    }}>
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
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 13,
              color: pathname === link.href ? '#1C1A16' : '#5A5855',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/admin"
          style={{ fontSize: 13, color: '#3D5A3E', textDecoration: 'none', fontFamily: 'var(--font-sans)' }}
        >
          Admin
        </Link>
      </div>
    </nav>
  )
}
