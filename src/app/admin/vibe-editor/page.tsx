'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminFooter from '@/components/AdminFooter'

function VibeEditorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [text, setText] = useState('')
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!editId) return
    const supabase = createClient()
    supabase.from('vibes').select('*').eq('id', editId).single().then(({ data }) => {
      if (data) { setText(data.text); setPublished(data.published) }
    })
  }, [editId])

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    const supabase = createClient()
    if (editId) {
      await supabase.from('vibes').update({ text, published }).eq('id', editId)
    } else {
      await supabase.from('vibes').insert({ text, published })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      router.push('/admin/dashboard')
    }, 800)
  }

  const mono = 'var(--font-mono)'
  const serif = 'var(--font-serif)'
  const charLimit = 280
  const over = text.length > charLimit

  return (
    <div style={{ background: 'var(--bg, #F5F0E8)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid #DDD8CC' }}>
          <a href="/admin/dashboard" style={{ fontFamily: mono, fontSize: 11, color: '#9A9895', letterSpacing: '1px', textDecoration: 'none', border: '1px solid #DDD8CC', padding: '7px 14px', borderRadius: 2 }}>
            ← DASHBOARD
          </a>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            style={{
              fontFamily: mono, fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase',
              background: saved ? '#3D5A3E' : '#1C1A16', color: '#FAF7F2',
              border: 'none', padding: '9px 20px', borderRadius: 2, cursor: 'pointer',
              opacity: (!text.trim() || saving) ? 0.5 : 1,
            }}
          >
            {saved ? 'ĐÃ ĐĂNG ✓' : saving ? 'ĐANG LƯU...' : 'ĐĂNG VÔ TRI'}
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '48px 0 64px' }}>
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>
              Góc Vô Tri
            </div>
            <h1 style={{ fontFamily: serif, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, letterSpacing: '-1px', color: '#1C1A16', margin: '0 0 8px' }}>
              short<span style={{ color: '#C8102E' }}>.</span><span style={{ fontStyle: 'italic' }}>thoughts</span>
            </h1>
            <div style={{ width: 32, height: 2, background: '#C8102E' }} />
            <p style={{ fontSize: 14, color: '#9A9895', marginTop: 16, fontWeight: 300 }}>
              Viết gì đó ngắn thôi... một suy nghĩ, một quan sát, một câu chưa hoàn chỉnh.
            </p>
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Viết gì đó..."
            style={{
              width: '100%', minHeight: 200,
              fontFamily: serif, fontSize: 18, lineHeight: 1.8,
              color: '#1C1A16', background: 'transparent',
              border: 'none', borderBottom: `2px solid ${over ? '#C8102E' : '#DDD8CC'}`,
              outline: 'none', resize: 'none', padding: '16px 0',
              boxSizing: 'border-box',
            }}
          />

          {/* Meta row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: over ? '#C8102E' : '#9A9895', letterSpacing: '0.5px' }}>
              {text.length} ký tự{over ? ` (vượt ${text.length - charLimit})` : ''}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: '#9A9895', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Hiển thị công khai
              </span>
              <div
                onClick={() => setPublished(!published)}
                style={{
                  width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                  backgroundColor: published ? '#3D5A3E' : '#DDD8CC',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: published ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  backgroundColor: '#FAF7F2', transition: 'left 0.2s',
                }} />
              </div>
            </div>
          </div>

          {/* Preview */}
          {text && (
            <div style={{ marginTop: 48 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
                Preview
              </div>
              <div style={{ background: '#FAF7F2', border: '1px solid #DDD8CC', borderRadius: 2, padding: '24px 20px' }}>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: '#1C1A16', fontWeight: 300, marginBottom: 14 }}>
                  {text}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: '#9A9895' }}>
                  {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            </div>
          )}
        </div>

        <AdminFooter />
      </div>
    </div>
  )
}

export default function VibeEditorPage() {
  return (
    <Suspense fallback={<div style={{ background: '#F5F0E8', minHeight: '100vh' }} />}>
      <VibeEditorInner />
    </Suspense>
  )
}
