'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Comment } from '@/lib/types'

interface Props {
  postId: string
  initialComments: Comment[]
}

export default function CommentSection({ postId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !body.trim()) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
      return
    }
    setStatus('loading')
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_name: name.trim(),
      author_email: email.trim(),
      body: body.trim(),
    })
    if (error) { setStatus('error'); setTimeout(() => setStatus('idle'), 2000); return }
    setStatus('done')
    setName(''); setEmail(''); setBody('')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: '#1C1A16', marginBottom: 24 }}>
        Comments ({comments.length})
      </div>

      {comments.map(comment => (
        <div key={comment.id} style={{ padding: '18px 0', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1A16', fontFamily: 'var(--font-sans)' }}>
              {comment.author_name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
              {new Date(comment.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div style={{ fontSize: 14, color: '#5A5855', lineHeight: 1.65, fontWeight: 300, fontFamily: 'var(--font-sans)' }}>
            {comment.body}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 28, background: '#EDE8DC', border: '1px solid #DDD8CC', borderRadius: 4, padding: 24 }}>
        {/* Tiêu đề form — dùng font-sans vì có tiếng Việt */}
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#5A5855', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 20, fontWeight: 500 }}>
          Để lại bình luận
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#1C1A16', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Tên *
            </label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên của bạn"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #DDD8CC', background: '#FAF7F2', fontFamily: 'var(--font-sans)', fontSize: 13, color: '#1C1A16', borderRadius: 2, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: '#1C1A16', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Email *
            </label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #DDD8CC', background: '#FAF7F2', fontFamily: 'var(--font-sans)', fontSize: 13, color: '#1C1A16', borderRadius: 2, outline: 'none' }} />
          </div>
        </div>

        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Chia sẻ suy nghĩ của bạn..." rows={4}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #DDD8CC', background: '#FAF7F2', fontFamily: 'var(--font-sans)', fontSize: 14, color: '#1C1A16', lineHeight: 1.65, resize: 'vertical', borderRadius: 2, marginBottom: 16, outline: 'none', minHeight: 100 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#9A9895' }}>
            * Bắt buộc — email không hiển thị công khai
          </span>
          <button onClick={handleSubmit} disabled={status === 'loading'}
            style={{ display: 'inline-flex', backgroundColor: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, padding: '10px 22px', borderRadius: 2, cursor: status === 'loading' ? 'not-allowed' : 'pointer', border: 'none', opacity: status === 'loading' ? 0.7 : 1 }}>
            {status === 'loading' ? 'Đang gửi...' : status === 'done' ? 'Đã gửi ✓' : status === 'error' ? 'Điền đủ thông tin *' : 'Đăng bình luận →'}
          </button>
        </div>

        {status === 'done' && (
          <div style={{ marginTop: 12, fontFamily: 'var(--font-sans)', fontSize: 12, color: '#3D5A3E' }}>
            Comment đang chờ duyệt — sẽ hiển thị sau khi admin approve.
          </div>
        )}
      </div>
    </div>
  )
}
