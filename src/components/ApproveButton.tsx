'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ApproveButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('comments').update({ approved: true }).eq('id', id)
    router.refresh()
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: '#FAF7F2', background: '#3D5A3E',
        border: 'none', padding: '4px 12px',
        borderRadius: 2, cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? '...' : 'Duyệt ✓'}
    </button>
  )
}
