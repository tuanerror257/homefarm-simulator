import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import DeleteButton from '@/components/DeleteButton'
import { Post, Vibe } from '@/lib/types'

function tagStyle(tag: string) {
  if (tag === 'Kinh Doanh') return { background: '#EAF0EA', color: '#3D5A3E' }
  if (tag === 'AI / Tech') return { background: '#FEF0E6', color: '#B85C1A' }
  return { background: '#F3EDF8', color: '#7B4FA6' }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [
    { count: totalPosts },
    { count: totalVibes },
    { count: totalComments },
    { count: totalReactions },
    { data: posts },
    { data: vibes },
    { count: pendingComments },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('vibes').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('reactions').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.from('vibes').select('*').order('created_at', { ascending: false }),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('approved', false),
  ])

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: '#1C1A16' }}>tada</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: '#C8102E', lineHeight: '0.85' }}>.</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: '#1C1A16' }}>vibes</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 12, letterSpacing: '1px' }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', border: '1.5px solid #5A5855', padding: '6px 14px', borderRadius: 2, textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ← Xem site
            </Link>
            <Link href="/admin/categories" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', border: '1.5px solid #5A5855', padding: '6px 14px', borderRadius: 2, textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Chủ đề
            </Link>
            <LogoutButton />
            <Link href="/admin/vibe-editor" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'transparent', color: '#3D5A3E', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 18px', borderRadius: 2, border: '2px solid #3D5A3E', textDecoration: 'none' }}>
              + Vô Tri Mới
            </Link>
            <Link href="/admin/editor" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 18px', borderRadius: 2, textDecoration: 'none' }}>
              + Viết Bài Mới
            </Link>
          </div>
        </div>

        <div style={{ padding: '36px 0' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: '#1C1A16', marginBottom: 28 }}>Dashboard</h1>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#DDD8CC', border: '1px solid #DDD8CC', marginBottom: 40 }}>
            {[
              { label: 'Tổng Bài', value: totalPosts || 0, delta: 'posts' },
              { label: 'Tổng Vô Tri', value: totalVibes || 0, delta: 'vibes' },
              { label: 'Comments', value: totalComments || 0, delta: `${pendingComments || 0} chờ duyệt` },
              { label: 'Reactions', value: totalReactions || 0, delta: 'total' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#FAF7F2', padding: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: '#1C1A16' }}>{stat.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3D5A3E', marginTop: 3 }}>{stat.delta}</div>
              </div>
            ))}
          </div>

          {/* ===== POSTS TABLE ===== */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A5855', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
              Bài viết ({totalPosts || 0})
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tiêu đề', 'Tag', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 0', borderBottom: '1px solid #DDD8CC', textAlign: 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(posts as Post[])?.map(post => (
                  <tr key={post.id}>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', fontSize: 13, color: '#1C1A16', maxWidth: 260 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                        {post.title}
                      </div>
                    </td>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', ...tagStyle(post.tag) }}>
                        {post.tag}
                      </span>
                    </td>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', whiteSpace: 'nowrap' }}>
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, background: post.published ? '#EAF0EA' : '#EDE8DC', color: post.published ? '#3D5A3E' : '#9A9895', padding: '3px 8px', borderRadius: 2 }}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <Link href={`/blog/${post.slug}`} target="_blank"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textDecoration: 'none' }}>
                          Xem ↗
                        </Link>
                        <Link href={`/admin/editor?id=${post.id}`}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3D5A3E', textDecoration: 'none' }}>
                          Edit
                        </Link>
                        <DeleteButton id={post.id} table="posts" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== VIBES TABLE ===== */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A5855', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
              Góc Vô Tri ({totalVibes || 0})
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nội dung', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 0', borderBottom: '1px solid #DDD8CC', textAlign: 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(vibes as Vibe[])?.map(vibe => (
                  <tr key={vibe.id}>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', fontSize: 13, color: '#1C1A16' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 460 }}>
                        {vibe.text}
                      </div>
                    </td>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', whiteSpace: 'nowrap' }}>
                      {new Date(vibe.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, background: vibe.published ? '#EAF0EA' : '#EDE8DC', color: vibe.published ? '#3D5A3E' : '#9A9895', padding: '3px 8px', borderRadius: 2 }}>
                        {vibe.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <Link href={`/admin/vibe-editor?id=${vibe.id}`}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3D5A3E', textDecoration: 'none' }}>
                          Edit
                        </Link>
                        <DeleteButton id={vibe.id} table="vibes" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
