'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VibeEditorClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [text, setText] = useState('')
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    if (!editId) return
    async function loadVibe() {
      const supabase = createClient()
      const { data, error } = await supabase.from('vibes').select('*').eq('id', editId).single()
      if (error) { console.error(error); return }
      if (data) { setText(data.text); setPublished(data.published) }
    }
    loadVibe()
  }, [editId])

  async function handleSave() {
    if (!text.trim()) { setSaveMsg('Vui lòng nhập nội dung'); return }
    setSaving(true)
    setSaveMsg('')
    const supabase = createClient()

    if (editId) {
      const { error } = await supabase.from('vibes').update({ text: text.trim(), published }).eq('id', editId)
      if (error) { setSaveMsg('Lỗi: ' + error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('vibes').insert({ text: text.trim(), published })
      if (error) { setSaveMsg('Lỗi: ' + error.message); setSaving(false); return }
    }

    setSaving(false)
    setSaveMsg('Đã lưu ✓')
    setTimeout(() => router.push('/admin/dashboard'), 800)
  }

  const charCount = text.length

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px', borderBottom: '1px solid #DDD8CC' }}>
          <a href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: 'transparent', color: '#1C1A16', border: '2px solid #1C1A16', padding: '7px 16px', borderRadius: 2, textDecoration: 'none' }}>
            ← Dashboard
          </a>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saveMsg && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: saveMsg.includes('Lỗi') ? '#C8102E' : '#3D5A3E' }}>{saveMsg}</span>}
            <button onClick={handleSave} disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#3D5A3E', color: '#FAF7F2', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 18px', borderRadius: 2, cursor: saving ? 'not-allowed' : 'pointer', border: 'none', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Đăng vô tri'}
            </button>
          </div>
        </div>

        <div style={{ padding: '40px 0' }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', color: '#9A9895', marginBottom: 4 }}>Góc Vô Tri</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: '#1C1A16' }}>
              short<span style={{ color: '#C8102E' }}>.</span><span style={{ fontStyle: 'italic' }}>thoughts</span>
            </h1>
          </div>
          <div style={{ width: 40, height: 2, background: '#C8102E', margin: '20px 0 32px' }} />

          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Viết gì đó ngắn thôi... một suy nghĩ, một quan sát, một câu chưa hoàn chỉnh."
            rows={6}
            style={{ width: '100%', fontFamily: 'var(--font-sans)', fontSize: 18, lineHeight: 1.8, color: '#1C1A16', background: 'transparent', border: 'none', borderBottom: '1px solid #DDD8CC', outline: 'none', resize: 'none', paddingBottom: 16, fontWeight: 300 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: charCount > 280 ? '#C8102E' : '#9A9895' }}>
              {charCount} ký tự {charCount > 280 && '— hơi dài rồi đó bro'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', letterSpacing: '1px', textTransform: 'uppercase' }}>Hiển thị công khai</span>
              <div onClick={() => setPublished(!published)}
                style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', backgroundColor: published ? '#3D5A3E' : '#DDD8CC', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: published ? 23 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#FAF7F2', transition: 'left 0.2s' }} />
              </div>
            </div>
          </div>

          {text && (
            <div style={{ marginTop: 48 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Preview</div>
              <div style={{ background: '#FAF7F2', border: '1px solid #DDD8CC', borderRadius: 2, padding: '24px 20px' }}>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: '#1C1A16', fontWeight: 300, marginBottom: 14 }}>{text}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
                  {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
