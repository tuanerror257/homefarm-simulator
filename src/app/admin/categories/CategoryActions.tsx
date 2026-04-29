'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import slugify from 'slugify'

interface Category {
  id: string
  name: string
  slug: string
  color_bg: string
  color_text: string
  created_at: string
}

const PRESET_COLORS = [
  { bg: '#EAF0EA', text: '#3D5A3E', label: 'Xanh lá' },
  { bg: '#FEF0E6', text: '#B85C1A', label: 'Cam' },
  { bg: '#F3EDF8', text: '#7B4FA6', label: 'Tím' },
  { bg: '#E6F0FE', text: '#1A5CB8', label: 'Xanh dương' },
  { bg: '#FEF9E6', text: '#B8941A', label: 'Vàng' },
  { bg: '#FEE6E6', text: '#B81A1A', label: 'Đỏ' },
  { bg: '#E6FEFC', text: '#1A9B8F', label: 'Xanh ngọc' },
  { bg: '#EDE8DC', text: '#5A5855', label: 'Xám' },
]

export default function CategoryActions({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [colorBg, setColorBg] = useState('#EAF0EA')
  const [colorText, setColorText] = useState('#3D5A3E')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setName(cat.name)
    setColorBg(cat.color_bg)
    setColorText(cat.color_text)
    setShowAdd(false)
  }

  function startAdd() {
    setShowAdd(true)
    setEditingId(null)
    setName('')
    setColorBg('#EAF0EA')
    setColorText('#3D5A3E')
  }

  function cancel() {
    setShowAdd(false)
    setEditingId(null)
    setName('')
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const slug = slugify(name, { lower: true, strict: true })

    if (editingId) {
      await supabase.from('categories').update({
        name: name.trim(), slug, color_bg: colorBg, color_text: colorText
      }).eq('id', editingId)
    } else {
      await supabase.from('categories').insert({
        name: name.trim(), slug, color_bg: colorBg, color_text: colorText
      })
    }

    setSaving(false)
    cancel()
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', id)
    setConfirmDeleteId(null)
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div>
      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#DDD8CC', border: '1px solid #DDD8CC', marginBottom: 24 }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: '#FAF7F2', padding: '16px 20px' }}>
            {editingId === cat.id ? (
              // Edit form inline
              <EditForm
                name={name} setName={setName}
                colorBg={colorBg} setColorBg={setColorBg}
                colorText={colorText} setColorText={setColorText}
                saving={saving}
                onSave={handleSave}
                onCancel={cancel}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    padding: '4px 12px', borderRadius: 2,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    background: cat.color_bg, color: cat.color_text,
                    fontWeight: 500,
                  }}>
                    {cat.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
                    /{cat.slug}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <button onClick={() => startEdit(cat)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3D5A3E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Edit
                  </button>
                  {confirmDeleteId === cat.id ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#C8102E' }}>Chắc chắn?</span>
                      <button onClick={() => handleDelete(cat.id)} disabled={deletingId === cat.id}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#FAF7F2', background: '#C8102E', border: 'none', padding: '3px 10px', borderRadius: 2, cursor: 'pointer' }}>
                        {deletingId === cat.id ? '...' : 'Xoá'}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Huỷ
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(cat.id)}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C8102E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Xoá
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      {showAdd ? (
        <div style={{ background: '#FAF7F2', border: '1px solid #DDD8CC', borderRadius: 2, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
            Thêm chủ đề mới
          </div>
          <EditForm
            name={name} setName={setName}
            colorBg={colorBg} setColorBg={setColorBg}
            colorText={colorText} setColorText={setColorText}
            saving={saving}
            onSave={handleSave}
            onCancel={cancel}
          />
        </div>
      ) : (
        <button onClick={startAdd}
          style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 18px', borderRadius: 2, cursor: 'pointer', border: 'none' }}>
          + Thêm chủ đề
        </button>
      )}
    </div>
  )
}

function EditForm({ name, setName, colorBg, setColorBg, colorText, setColorText, saving, onSave, onCancel }: {
  name: string
  setName: (v: string) => void
  colorBg: string
  setColorBg: (v: string) => void
  colorText: string
  setColorText: (v: string) => void
  saving: boolean
  onSave: () => void
  onCancel: () => void
}) {
  const PRESET_COLORS = [
    { bg: '#EAF0EA', text: '#3D5A3E', label: 'Xanh lá' },
    { bg: '#FEF0E6', text: '#B85C1A', label: 'Cam' },
    { bg: '#F3EDF8', text: '#7B4FA6', label: 'Tím' },
    { bg: '#E6F0FE', text: '#1A5CB8', label: 'Xanh dương' },
    { bg: '#FEF9E6', text: '#B8941A', label: 'Vàng' },
    { bg: '#FEE6E6', text: '#B81A1A', label: 'Đỏ' },
    { bg: '#E6FEFC', text: '#1A9B8F', label: 'Xanh ngọc' },
    { bg: '#EDE8DC', text: '#5A5855', label: 'Xám' },
  ]

  return (
    <div>
      {/* Name input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#1C1A16', display: 'block', marginBottom: 6, fontWeight: 500 }}>
          Tên chủ đề
        </label>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Ví dụ: Tâm lý học"
          onKeyDown={e => e.key === 'Enter' && onSave()}
          style={{ padding: '9px 12px', border: '1px solid #DDD8CC', background: '#F5F0E8', fontFamily: 'var(--font-sans)', fontSize: 14, color: '#1C1A16', borderRadius: 2, outline: 'none', width: 280 }} />
      </div>

      {/* Color presets */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#1C1A16', display: 'block', marginBottom: 10, fontWeight: 500 }}>
          Màu sắc
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {PRESET_COLORS.map(preset => (
            <button key={preset.bg} onClick={() => { setColorBg(preset.bg); setColorText(preset.text) }}
              style={{
                padding: '5px 14px', borderRadius: 2, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
                background: preset.bg, color: preset.text,
                border: colorBg === preset.bg ? `2px solid ${preset.text}` : '2px solid transparent',
                fontWeight: colorBg === preset.bg ? 700 : 400,
              }}>
              {preset.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        {name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#9A9895' }}>Preview:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '4px 12px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', background: colorBg, color: colorText }}>
              {name}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onSave} disabled={saving || !name.trim()}
          style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#3D5A3E', color: '#FAF7F2', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 2, cursor: 'pointer', border: 'none', opacity: !name.trim() ? 0.5 : 1 }}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button onClick={onCancel}
          style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'transparent', color: '#5A5855', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 2, cursor: 'pointer', border: '1.5px solid #DDD8CC' }}>
          Huỷ
        </button>
      </div>
    </div>
  )
}
