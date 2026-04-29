'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  table: 'posts' | 'vibes' | 'comments'
}

export default function DeleteButton({ id, table }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from(table).delete().eq('id', id)
    router.refresh()
  }

  if (deleting) {
    return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>Đang xoá...</span>
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#C8102E' }}>Chắc chắn?</span>
        <button
          onClick={handleDelete}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FAF7F2', background: '#C8102E', border: 'none', padding: '3px 10px', borderRadius: 2, cursor: 'pointer' }}
        >
          Xoá
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Huỷ
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C8102E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      Xoá
    </button>
  )
}
