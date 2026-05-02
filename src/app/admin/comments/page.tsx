import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApproveButton from '@/components/ApproveButton'
import DeleteButton from '@/components/DeleteButton'
import AdminFooter from '@/components/AdminFooter'
import Footer from '@/components/Footer'

interface Category {
  id: string
  name: string
  slug: string
  color_bg: string
  color_text: string
}

interface Comment {
  id: string
  post_id: string
  author_name: string
  content: string
  approved: boolean
  created_at: string
  posts?: { title: string; slug: string }
}

export default async function CommentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [{ data: pending }, { data: approved }, { data: categories }] = await Promise.all([
    supabase
      .from('comments')
      .select('*, posts(title, slug)')
      .eq('approved', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('comments')
      .select('*, posts(title, slug)')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('categories')
      .select('id, name, slug, color_bg, color_text')
      .order('created_at', { ascending: true }),
  ])

  const mono = 'var(--font-mono)'
  const sans = 'var(--font-sans)'

  function CommentRow({ comment }: { comment: Comment }) {
    return (
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #EDE8DC',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 12,
        alignItems: 'start',
      }}>
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: '#1C1A16' }}>
              {comment.author_name}
            </span>
            <span style={{ fontFamily: mono, fontSize: 10, color: '#9A9895' }}>
              {new Date(comment.created_at).toLocaleDateString('vi-VN')}
            </span>
            {comment.posts && (
              <a
                href={`/blog/${comment.posts.slug}`}
                target="_blank"
                style={{ fontFamily: mono, fontSize: 9, color: '#9A9895', textDecoration: 'underline', letterSpacing: '0.5px' }}
              >
                {comment.posts.title}
              </a>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#3D3A35', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
            {comment.content}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {!comment.approved && <ApproveButton id={comment.id} />}
          <DeleteButton id={comment.id} table="comments" />
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ padding: '32px 0 24px', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <a href="/admin/dashboard" style={{ fontFamily: mono, fontSize: 10, color: '#9A9895', letterSpacing: '1px', textDecoration: 'none' }}>
              ← DASHBOARD
            </a>
          </div>
          <h1 style={{ fontFamily: sans, fontSize: 24, fontWeight: 400, color: '#1C1A16', margin: 0 }}>
            Quản lý Comments
          </h1>
        </div>

        {/* Pending */}
        <div style={{ padding: '28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '1.5px', color: '#1C1A16', textTransform: 'uppercase' }}>
              Chờ duyệt
            </span>
            {pending && pending.length > 0 && (
              <span style={{
                background: '#C8102E',
                color: '#FAF7F2',
                fontFamily: mono,
                fontSize: 9,
                padding: '2px 7px',
                borderRadius: 999,
              }}>
                {pending.length}
              </span>
            )}
          </div>

          <div style={{ background: '#FAF7F2', border: '1px solid #DDD8CC', borderRadius: 4 }}>
            {!pending || pending.length === 0 ? (
              <div style={{ padding: '24px 20px', fontFamily: mono, fontSize: 11, color: '#9A9895', textAlign: 'center' }}>
                Không có comment nào chờ duyệt
              </div>
            ) : (
              (pending as Comment[]).map(c => <CommentRow key={c.id} comment={c} />)
            )}
          </div>
        </div>

        {/* Approved */}
        <div style={{ padding: '0 0 40px' }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '1.5px', color: '#1C1A16', textTransform: 'uppercase' }}>
              Đã duyệt (20 mới nhất)
            </span>
          </div>

          <div style={{ background: '#FAF7F2', border: '1px solid #DDD8CC', borderRadius: 4 }}>
            {!approved || approved.length === 0 ? (
              <div style={{ padding: '24px 20px', fontFamily: mono, fontSize: 11, color: '#9A9895', textAlign: 'center' }}>
                Chưa có comment nào được duyệt
              </div>
            ) : (
              (approved as Comment[]).map(c => <CommentRow key={c.id} comment={c} />)
            )}
          </div>
        </div>

        <Footer categories={(categories as Category[]) || []} />
        <AdminFooter />
      </div>
    </div>
  )
}
