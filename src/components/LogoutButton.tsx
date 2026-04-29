'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'inline-flex', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: '#1C1A16', border: '1.5px solid #1C1A16',
        backgroundColor: 'transparent',
        padding: '6px 14px', borderRadius: 2,
        cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
      }}
      onMouseOver={e => {
        const el = e.currentTarget
        el.style.backgroundColor = '#1C1A16'
        el.style.color = '#F5F0E8'
      }}
      onMouseOut={e => {
        const el = e.currentTarget
        el.style.backgroundColor = 'transparent'
        el.style.color = '#1C1A16'
      }}
    >
      Đăng xuất
    </button>
  )
}
