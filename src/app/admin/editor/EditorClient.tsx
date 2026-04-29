'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import slugify from 'slugify'

interface Category {
  id: string
  name: string
  color_bg: string
  color_text: string
}

function ToolbarBtn({ onClick, children, active }: { onClick: () => void; children: React.ReactNode; active?: boolean }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#1C1A16' : 'none', color: active ? '#F5F0E8' : '#5A5855', border: '1px solid #DDD8CC', padding: '5px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', borderRadius: 2 }}>
      {children}
    </button>
  )
}

export default function EditorClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [published, setPublished] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Bắt đầu viết...' }),
    ],
    editorProps: {
      attributes: { style: 'outline:none; min-height:300px; font-size:16px; line-height:1.85; color:#5A5855; font-weight:300; font-family:var(--font-sans);' },
    },
  })

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setCategories(data)
        if (!tag && !editId) setTag(data[0].name)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (!editId || !editor) return
    async function loadPost() {
      const supabase = createClient()
      const { data } = await supabase.from('posts').select('*').eq('id', editId).single()
      if (data) {
        setTitle(data.title); setTag(data.tag); setPublished(data.published)
        setThumbnailUrl(data.thumbnail_url || ''); setThumbnailPreview(data.thumbnail_url || '')
        editor?.commands.setContent(data.content || '')
      }
    }
    loadPost()
  }, [editId, editor])

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const supabase = createClient()
    const fileName = `${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('thumbnails').upload(fileName, file)
    if (error) { setUploading(false); return }
    const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(fileName)
    setThumbnailUrl(urlData.publicUrl); setThumbnailPreview(urlData.publicUrl)
    setUploading(false)
  }

  async function handleSave(publish?: boolean) {
    if (!title.trim()) { setSaveMsg('Vui lòng nhập tiêu đề'); return }
    setSaving(true)
    const supabase = createClient()
    const content = editor?.getHTML() || ''
    const shouldPublish = publish !== undefined ? publish : published
    const excerpt = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) + '...'
    const slug = slugify(title, { lower: true, locale: 'vi', strict: true })
    const payload = { title: title.trim(), slug, excerpt, content, tag, published: shouldPublish, thumbnail_url: thumbnailUrl || null, updated_at: new Date().toISOString() }

    if (editId) {
      const { error } = await supabase.from('posts').update(payload).eq('id', editId)
      if (error) { setSaveMsg('Lỗi: ' + error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('posts').insert({ ...payload, created_at: new Date().toISOString() })
      if (error) { setSaveMsg('Lỗi: ' + error.message); setSaving(false); return }
    }

    setSaving(false); setPublished(shouldPublish)
    setSaveMsg(shouldPublish ? 'Đã publish ✓' : 'Đã lưu draft ✓')
    setTimeout(() => setSaveMsg(''), 3000)
    if (!editId) setTimeout(() => router.push('/admin/dashboard'), 1000)
  }

  const selectedCat = categories.find(c => c.name === tag)

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px', borderBottom: '1px solid #DDD8CC' }}>
          <a href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: 'transparent', color: '#1C1A16', border: '2px solid #1C1A16', padding: '7px 16px', borderRadius: 2, textDecoration: 'none' }}>← Dashboard</a>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saveMsg && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: saveMsg.includes('Lỗi') ? '#C8102E' : '#3D5A3E' }}>{saveMsg}</span>}
            <button onClick={() => handleSave(false)} disabled={saving}
              style={{ display: 'inline-flex', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: 'transparent', color: '#1C1A16', border: '2px solid #1C1A16', padding: '7px 16px', borderRadius: 2, cursor: 'pointer' }}>
              Lưu Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              style={{ display: 'inline-flex', backgroundColor: '#3D5A3E', color: '#FAF7F2', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 18px', borderRadius: 2, cursor: 'pointer', border: 'none' }}>
              {saving ? 'Đang lưu...' : published ? 'Cập nhật' : 'Publish'}
            </button>
          </div>
        </div>

        <div style={{ padding: '32px 0' }}>
          {/* Thumbnail */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Thumbnail</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 160, height: 120, background: '#EDE8DC', borderRadius: 2, border: '1px dashed #DDD8CC', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {thumbnailPreview ? <img src={thumbnailPreview} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>No image</span>}
              </div>
              <div>
                <input type="file" id="thumb-upload" accept="image/*" style={{ display: 'none' }} onChange={handleThumbnailUpload} />
                <button onClick={() => document.getElementById('thumb-upload')?.click()} disabled={uploading}
                  style={{ display: 'inline-flex', backgroundColor: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 2, cursor: 'pointer', border: 'none', marginBottom: 8 }}>
                  {uploading ? 'Đang upload...' : 'Upload ảnh'}
                </button>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>JPG, PNG — tỉ lệ 4:3</div>
              </div>
            </div>
          </div>

          {/* Tag — dynamic từ DB */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
            <select value={tag} onChange={e => setTag(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid #DDD8CC', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#1C1A16', background: '#FAF7F2', cursor: 'pointer' }}>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
            {selectedCat && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 10px', borderRadius: 2, background: selectedCat.color_bg, color: selectedCat.color_text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedCat.name}
              </span>
            )}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 10px', borderRadius: 2, background: published ? '#EAF0EA' : '#EDE8DC', color: published ? '#3D5A3E' : '#9A9895' }}>
              {published ? 'Published' : 'Draft'}
            </div>
          </div>

          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề bài viết..."
            style={{ width: '100%', fontFamily: 'var(--font-serif)', fontSize: 32, border: 'none', background: 'none', color: '#1C1A16', marginBottom: 14, fontWeight: 400, outline: 'none' }} />
          <div style={{ borderTop: '1px solid #DDD8CC' }} />

          {editor && (
            <div style={{ display: 'flex', gap: 4, padding: '10px 0', borderBottom: '1px solid #DDD8CC', marginBottom: 20, flexWrap: 'wrap' }}>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><b>B</b></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><i>I</i></ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>"</ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>• List</ToolbarBtn>
              <ToolbarBtn onClick={() => { const url = window.prompt('URL:'); if (url) editor.chain().focus().setLink({ href: url }).run() }} active={editor.isActive('link')}>Link</ToolbarBtn>
              <ToolbarBtn onClick={() => { const url = window.prompt('URL ảnh:'); if (url) editor.chain().focus().setImage({ src: url }).run() }}>IMG</ToolbarBtn>
              <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>Code</ToolbarBtn>
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
