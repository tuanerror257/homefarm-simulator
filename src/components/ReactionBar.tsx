'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  postId: string
  initialCounts: { heart: number; fire: number; think: number }
}

export default function ReactionBar({ postId, initialCounts }: Props) {
  const [counts, setCounts] = useState(initialCounts)
  const [reacted, setReacted] = useState<Record<string, boolean>>({})

  async function handleReact(type: 'heart' | 'fire' | 'think') {
    if (reacted[type]) return

    const supabase = createClient()
    await supabase.from('reactions').insert({ post_id: postId, type })

    setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }))
    setReacted(prev => ({ ...prev, [type]: true }))
  }

  const buttons = [
    { type: 'heart' as const, emoji: '♥', activeColor: '#C8102E' },
    { type: 'fire' as const, emoji: '🔥', activeColor: '#3D5A3E' },
    { type: 'think' as const, emoji: '🤔', activeColor: '#3D5A3E' },
  ]

  return (
    <div style={{
      display: 'flex', gap: 10, padding: '20px 0',
      borderTop: '1px solid #DDD8CC', borderBottom: '1px solid #DDD8CC',
      margin: '36px 0 28px'
    }}>
      {buttons.map(({ type, emoji, activeColor }) => (
        <button
          key={type}
          onClick={() => handleReact(type)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            backgroundColor: reacted[type] ? activeColor : '#5A5855',
            color: '#F5F0E8', border: 'none',
            padding: '9px 20px', borderRadius: 2, cursor: reacted[type] ? 'default' : 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.5px',
            opacity: reacted[type] ? 0.9 : 1,
          }}
        >
          {emoji} <span>{counts[type]}</span>
        </button>
      ))}
    </div>
  )
}
