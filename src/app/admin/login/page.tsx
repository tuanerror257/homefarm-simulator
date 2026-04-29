'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) { setError('Vui lòng điền đầy đủ thông tin'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email hoặc mật khẩu không đúng')
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#FAF7F2', border: '1px solid #DDD8CC', borderRadius: 4, padding: 40, width: '100%', maxWidth: 340 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: 5 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: '#1C1A16' }}>tada</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#C8102E', lineHeight: '0.85' }}>.</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, fontStyle: 'italic', color: '#1C1A16' }}>vibes</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9A9895', letterSpacing: '1.5px', textAlign: 'center', marginBottom: 32 }}>
          Admin Panel
        </div>

        {/* Email */}
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@tadavibes.com"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #DDD8CC', background: '#F5F0E8', fontFamily: 'var(--font-sans)', fontSize: 14, color: '#1C1A16', borderRadius: 2, marginBottom: 14, outline: 'none' }}
        />

        {/* Password */}
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
          Mật khẩu
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #DDD8CC', background: '#F5F0E8', fontFamily: 'var(--font-sans)', fontSize: 14, color: '#1C1A16', borderRadius: 2, marginBottom: 14, outline: 'none' }}
        />

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ display: 'block', width: '100%', textAlign: 'center', backgroundColor: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', padding: 12, borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', opacity: loading ? 0.7 : 1, marginTop: 4 }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        {error && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#C8102E', textAlign: 'center', marginTop: 10 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
