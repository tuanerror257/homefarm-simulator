'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import slugify from 'slugify'
import AdminFooter from '@/components/AdminFooter'

interface Category {
  id: string
  name: string
  color_bg: string
  color_text: string
}

// Toolbar button
function TBtn({ onClick, active, title, children }: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? '#1C1A16' : '#FAF7F2',
        color: active ? '#F5F0E8' : '#5A5855',
        border: '1px solid #DDD8CC',
        padding: '6px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        cursor: 'pointer',
        borderRadius: 2,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 32,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 24, background: '#DDD8CC', margin: '0 4px' }} />
}

export default function EditorClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const imgInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [published, setPublished] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Bắt đầu viết...' }),
    ],
    editorProps: {
      attributes: {
        style: 'outline:none; min-height:400px; font-size:16px; line-height:1.85; color:#5A5855; font-weight:300; font-family:var(--font-sans); padding: 4px 0;',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      setWordCount(text.split(/\s+/).filter(Boolean).length)
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

  // Upload thumbnail
  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const supabase = createClient()
    const fileName = `thumb_${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('thumbnails').upload(fileName, file)
    if (error) { setUploading(false); return }
    const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(fileName)
    setThumbnailUrl(urlData.publicUrl); setThumbnailPreview(urlData.publicUrl)
    setUploading(false)
  }

  // Upload ảnh vào bài viết
  async function handleContentImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !editor) return
    setImgUploading(true)
    const supabase = createClient()
    const fileName = `content_${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('thumbnails').upload(fileName, file)
    if (error) { setImgUploading(false); return }
    const { data: urlData } = supabase.storage.from('thumbnails').getPublicUrl(fileName)
    editor.chain().focus().setImage({ src: urlData.publicUrl }).run()
    setImgUploading(false)
    // Reset input
    if (imgInputRef.current) imgInputRef.current.value = ''
  }

  async function handleSave(publish?: boolean) {
    if (!title.trim()) { setSaveMsg('Vui lòng nhập tiêu đề'); return }
    setSaving(true)
    const supabase = createClient()
    const content = editor?.getHTML() || ''
    const shouldPublish = publish !== undefined ? publish : published
    const excerpt = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) + '...'
    const slug = slugify(title, { lower: true, locale: 'vi', strict: true })
    const payload = {
      title: title.trim(), slug, excerpt, content, tag,
      published: shouldPublish, thumbnail_url: thumbnailUrl || null,
      updated_at: new Date().toISOString(),
    }
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
  const minRead = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      {/* Hidden file inputs */}
      <input ref={thumbInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumbnailUpload} />
      <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleContentImageUpload} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 16px', borderBottom: '1px solid #DDD8CC', gap: 12, flexWrap: 'wrap' }}>
          <a href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: '#5A5855', textDecoration: 'none' }}>
            ← Dashboard
          </a>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {saveMsg && (
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: saveMsg.includes('Lỗi') ? '#C8102E' : '#3D5A3E' }}>
                {saveMsg}
              </span>
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
              {wordCount} từ · {minRead} min read
            </span>
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

        <div style={{ padding: '28px 0' }}>
          {/* Meta row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Thumbnail */}
            <div
              onClick={() => thumbInputRef.current?.click()}
              style={{ width: 100, height: 75, background: '#EDE8DC', borderRadius: 2, border: '1px dashed #DDD8CC', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              {thumbnailPreview
                ? <img src={thumbnailPreview} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🖼</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9A9895' }}>COVER</div>
                  </div>
              }
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,240,232,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9A9895' }}>
                  Uploading...
                </div>
              )}
            </div>

            {/* Category select */}
            <select value={tag} onChange={e => setTag(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #DDD8CC', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#1C1A16', background: '#FAF7F2', cursor: 'pointer' }}>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>

            {/* Tag preview */}
            {selectedCat && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 10px', borderRadius: 2, background: selectedCat.color_bg, color: selectedCat.color_text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedCat.name}
              </span>
            )}

            {/* Status badge */}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 10px', borderRadius: 2, background: published ? '#EAF0EA' : '#EDE8DC', color: published ? '#3D5A3E' : '#9A9895' }}>
              {published ? '● Published' : '○ Draft'}
            </span>
          </div>

          {/* Title */}
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề bài viết..."
            style={{ width: '100%', fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 4vw, 36px)', border: 'none', background: 'none', color: '#1C1A16', fontWeight: 400, outline: 'none', marginBottom: 4 }} />

          <div style={{ height: 1, background: '#DDD8CC', marginBottom: 0 }} />

          {/* Toolbar */}
          {editor && (
            <div style={{ display: 'flex', gap: 4, padding: '10px 0', borderBottom: '1px solid #F0EBE0', marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Text format */}
              <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                <strong>B</strong>
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                <em>I</em>
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleStrike?.().run()} active={editor.isActive('strike')} title="Strikethrough">
                <s>S</s>
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
                {'</>'}
              </TBtn>

              <Divider />

              {/* Headings */}
              <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                H2
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                H3
              </TBtn>

              <Divider />

              {/* Lists */}
              <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                • —
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
                1.
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                "
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                —
              </TBtn>

              <Divider />

              {/* Link */}
              <TBtn onClick={() => {
                if (editor.isActive('link')) {
                  editor.chain().focus().unsetLink().run()
                } else {
                  const url = window.prompt('URL:')
                  if (url) editor.chain().focus().setLink({ href: url }).run()
                }
              }} active={editor.isActive('link')} title="Link">
                🔗
              </TBtn>

              {/* Image upload từ máy */}
              <TBtn onClick={() => imgInputRef.current?.click()} title="Upload ảnh từ máy">
                {imgUploading ? '⏳' : '📷'}
              </TBtn>

              {/* Image từ URL */}
              <TBtn onClick={() => {
                const url = window.prompt('URL ảnh:')
                if (url) editor.chain().focus().setImage({ src: url }).run()
              }} title="Chèn ảnh từ URL">
                🌐
              </TBtn>

              <Divider />

              {/* Undo/Redo */}
              <TBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
                ↩
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
                ↪
              </TBtn>
            </div>
          )}

          {/* Editor content */}
          <div style={{ minHeight: 400 }}>
            <EditorContent editor={editor} />
          </div>
        </div>

        <AdminFooter />
      </div>

      {/* Editor styles */}
      <style>{`
        .ProseMirror { outline: none; min-height: 400px; }
        .ProseMirror h2 { font-family: var(--font-serif); font-size: 22px; font-weight: 400; color: #1C1A16; margin: 32px 0 12px; }
        .ProseMirror h3 { font-family: var(--font-serif); font-size: 18px; font-weight: 400; color: #1C1A16; margin: 24px 0 10px; }
        .ProseMirror p { margin-bottom: 18px; }
        .ProseMirror blockquote { border-left: 2px solid #C8102E; padding-left: 18px; font-family: var(--font-serif); font-style: italic; font-size: 18px; color: #1C1A16; margin: 24px 0; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin-bottom: 18px; }
        .ProseMirror li { margin-bottom: 6px; line-height: 1.7; }
        .ProseMirror a { color: #3D5A3E; text-decoration: underline; }
        .ProseMirror code { font-family: var(--font-mono); font-size: 13px; background: #EDE8DC; padding: 2px 6px; border-radius: 2px; }
        .ProseMirror pre { background: #1C1A16; color: #F5F0E8; padding: 20px; border-radius: 4px; overflow-x: auto; margin: 20px 0; font-family: var(--font-mono); font-size: 13px; line-height: 1.6; }
        .ProseMirror img { max-width: 100%; border-radius: 4px; margin: 20px 0; display: block; }
        .ProseMirror hr { border: none; border-top: 1px solid #DDD8CC; margin: 28px 0; }
        .ProseMirror p.is-editor-empty:first-child::before { color: #9A9895; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  )
}
