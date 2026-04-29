import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApproveButton from '@/components/ApproveButton'
import DeleteButton from '@/components/DeleteButton'

export default async function CommentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: pending } = await supabase
    .from('comments')
    .select('*, posts(title, slug)')
    .eq('approved', false)
    .order('created_at', { ascending: false })

  const { data: approved } = await supabase
    .from('comments')
    .select('*, posts(title, slug)')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: '#1C1A16' }}>tada</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: '#C8102E', lineHeight: '0.85' }}>.</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: '#1C1A16' }}>vibes</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 12, letterSpacing: '1px' }}>COMMENTS</span>
          </div>
          <a href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', border: '1.5px solid #5A5855', padding: '6px 14px', borderRadius: 2, textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ← Dashboard
          </a>
        </div>

        <div style={{ padding: '36px 0' }}>

          {/* Pending */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A5855', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Chờ duyệt
              </div>
              {pending && pending.length > 0 && (
                <span style={{ background: '#C8102E', color: '#FAF7F2', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>
                  {pending.length}
                </span>
              )}
            </div>

            {!pending?.length ? (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#9A9895', padding: '20px 0' }}>
                Không có comment nào chờ duyệt ✓
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#DDD8CC', border: '1px solid #DDD8CC' }}>
                {pending.map((comment: any) => (
                  <div key={comment.id} style={{ background: '#FAF7F2', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1A16', fontFamily: 'var(--font-sans)' }}>
                          {comment.author_name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 10 }}>
                          {comment.author_email}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 10 }}>
                          {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                        <ApproveButton id={comment.id} />
                        <DeleteButton id={comment.id} table="comments" />
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: '#5A5855', lineHeight: 1.65, fontFamily: 'var(--font-sans)', marginBottom: 8 }}>
                      {comment.body}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
                      Bài: <a href={`/blog/${(comment.posts as any)?.slug}`} target="_blank" style={{ color: '#3D5A3E', textDecoration: 'none' }}>
                        {(comment.posts as any)?.title}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A5855', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
              Đã duyệt (20 gần nhất)
            </div>

            {!approved?.length ? (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#9A9895', padding: '20px 0' }}>
                Chưa có comment nào được duyệt
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Tên', 'Nội dung', 'Bài viết', 'Ngày', ''].map(h => (
                      <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 0', borderBottom: '1px solid #DDD8CC', textAlign: 'left' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approved.map((comment: any) => (
                    <tr key={comment.id}>
                      <td style={{ padding: '12px 0', borderBottom: '1px solid #DDD8CC', fontSize: 13, color: '#1C1A16', whiteSpace: 'nowrap', paddingRight: 16 }}>
                        {comment.author_name}
                      </td>
                      <td style={{ padding: '12px 0', borderBottom: '1px solid #DDD8CC', fontSize: 13, color: '#5A5855', maxWidth: 300 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                          {comment.body}
                        </div>
                      </td>
                      <td style={{ padding: '12px 0', borderBottom: '1px solid #DDD8CC', fontSize: 12, color: '#3D5A3E', whiteSpace: 'nowrap', paddingRight: 16 }}>
                        <a href={`/blog/${(comment.posts as any)?.slug}`} target="_blank" style={{ color: '#3D5A3E', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                          {(comment.posts as any)?.title?.slice(0, 30)}...
                        </a>
                      </td>
                      <td style={{ padding: '12px 0', borderBottom: '1px solid #DDD8CC', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', whiteSpace: 'nowrap', paddingRight: 16 }}>
                        {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '12px 0', borderBottom: '1px solid #DDD8CC' }}>
                        <DeleteButton id={comment.id} table="comments" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
