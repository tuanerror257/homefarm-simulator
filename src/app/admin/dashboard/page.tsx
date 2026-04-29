import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import DeleteButton from '@/components/DeleteButton'
import { Post, Vibe } from '@/lib/types'

function tagBadge(tag: string, categories: any[]) {
  const cat = categories.find(c => c.name === tag)
  return { bg: cat?.color_bg || '#EAF0EA', text: cat?.color_text || '#3D5A3E' }
}

const PER_PAGE = 10

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; postPage?: string; vibePage?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { tab, postPage, vibePage } = await searchParams
  const activeTab = tab || 'posts'
  const currentPostPage = Number(postPage) || 1
  const currentVibePage = Number(vibePage) || 1

  const [
    { count: totalPosts },
    { count: totalVibes },
    { count: totalComments },
    { count: totalReactions },
    { count: pendingComments },
    { data: categories },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('vibes').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('reactions').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('approved', false),
    supabase.from('categories').select('*').order('created_at', { ascending: true }),
  ])

  // Load posts với pagination
  const postFrom = (currentPostPage - 1) * PER_PAGE
  const { data: posts } = await supabase
    .from('posts').select('*')
    .order('created_at', { ascending: false })
    .range(postFrom, postFrom + PER_PAGE - 1)

  // Load vibes với pagination
  const vibeFrom = (currentVibePage - 1) * PER_PAGE
  const { data: vibes } = await supabase
    .from('vibes').select('*')
    .order('created_at', { ascending: false })
    .range(vibeFrom, vibeFrom + PER_PAGE - 1)

  const totalPostPages = Math.ceil((totalPosts || 0) / PER_PAGE)
  const totalVibePages = Math.ceil((totalVibes || 0) / PER_PAGE)

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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', border: '1.5px solid #5A5855', padding: '6px 12px', borderRadius: 2, textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>← Site</Link>
            <Link href="/admin/categories" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', border: '1.5px solid #5A5855', padding: '6px 12px', borderRadius: 2, textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>Chủ đề</Link>
            <Link href="/admin/comments" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: pendingComments ? '#C8102E' : '#5A5855', border: `1.5px solid ${pendingComments ? '#C8102E' : '#5A5855'}`, padding: '6px 12px', borderRadius: 2, textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Comments{pendingComments ? ` (${pendingComments})` : ''}
            </Link>
            <LogoutButton />
            <Link href="/admin/vibe-editor" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'transparent', color: '#3D5A3E', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 16px', borderRadius: 2, border: '2px solid #3D5A3E', textDecoration: 'none' }}>+ Vô Tri</Link>
            <Link href="/admin/editor" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 16px', borderRadius: 2, textDecoration: 'none' }}>+ Bài Mới</Link>
          </div>
        </div>

        <div style={{ padding: '32px 0' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#DDD8CC', border: '1px solid #DDD8CC', marginBottom: 32 }}>
            {[
              { label: 'Tổng Bài', value: totalPosts || 0, delta: 'posts' },
              { label: 'Tổng Vô Tri', value: totalVibes || 0, delta: 'vibes' },
              { label: 'Comments', value: totalComments || 0, delta: `${pendingComments || 0} chờ duyệt`, alert: !!pendingComments },
              { label: 'Reactions', value: totalReactions || 0, delta: 'total' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#FAF7F2', padding: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{stat.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: '#1C1A16' }}>{stat.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: stat.alert ? '#C8102E' : '#3D5A3E', marginTop: 3 }}>{stat.delta}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #DDD8CC', marginBottom: 24 }}>
            <Link href="?tab=posts" style={{ padding: '10px 24px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', color: activeTab === 'posts' ? '#1C1A16' : '#9A9895', borderBottom: activeTab === 'posts' ? '2px solid #1C1A16' : '2px solid transparent', marginBottom: -2 }}>
              Bài viết ({totalPosts || 0})
            </Link>
            <Link href="?tab=vibes" style={{ padding: '10px 24px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', color: activeTab === 'vibes' ? '#1C1A16' : '#9A9895', borderBottom: activeTab === 'vibes' ? '2px solid #1C1A16' : '2px solid transparent', marginBottom: -2 }}>
              Góc Vô Tri ({totalVibes || 0})
            </Link>
          </div>

          {/* ===== POSTS TAB ===== */}
          {activeTab === 'posts' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Tiêu đề', 'Tag', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => (
                      <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 0', borderBottom: '1px solid #DDD8CC', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(posts as Post[])?.map(post => {
                    const { bg, text } = tagBadge(post.tag, categories || [])
                    return (
                      <tr key={post.id}>
                        <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', fontSize: 13, color: '#1C1A16', maxWidth: 280, paddingRight: 16 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{post.title}</div>
                        </td>
                        <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', paddingRight: 16 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', background: bg, color: text }}>{post.tag}</span>
                        </td>
                        <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', whiteSpace: 'nowrap', paddingRight: 16 }}>
                          {new Date(post.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', paddingRight: 16 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, background: post.published ? '#EAF0EA' : '#EDE8DC', color: post.published ? '#3D5A3E' : '#9A9895', padding: '3px 8px', borderRadius: 2 }}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <Link href={`/blog/${post.slug}`} target="_blank" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textDecoration: 'none' }}>Xem ↗</Link>
                            <Link href={`/admin/editor?id=${post.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3D5A3E', textDecoration: 'none' }}>Edit</Link>
                            <DeleteButton id={post.id} table="posts" />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Post pagination */}
              {totalPostPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '24px 0', flexWrap: 'wrap' }}>
                  {currentPostPage > 1 && (
                    <Link href={`?tab=posts&postPage=${currentPostPage - 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none' }}>←</Link>
                  )}
                  {Array.from({ length: totalPostPages }, (_, i) => i + 1).map(p => (
                    <Link key={p} href={`?tab=posts&postPage=${p}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: `2px solid ${p === currentPostPage ? '#1C1A16' : '#5A5855'}`, backgroundColor: p === currentPostPage ? '#1C1A16' : '#F5F0E8', color: p === currentPostPage ? '#F5F0E8' : '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none', minWidth: 36 }}>{p}</Link>
                  ))}
                  {currentPostPage < totalPostPages && (
                    <Link href={`?tab=posts&postPage=${currentPostPage + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none' }}>→</Link>
                  )}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 8 }}>{currentPostPage}/{totalPostPages} trang</span>
                </div>
              )}
            </div>
          )}

          {/* ===== VIBES TAB ===== */}
          {activeTab === 'vibes' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Nội dung', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => (
                      <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 0', borderBottom: '1px solid #DDD8CC', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(vibes as Vibe[])?.map(vibe => (
                    <tr key={vibe.id}>
                      <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', fontSize: 13, color: '#1C1A16', paddingRight: 16 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 }}>{vibe.text}</div>
                      </td>
                      <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', whiteSpace: 'nowrap', paddingRight: 16 }}>
                        {new Date(vibe.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC', paddingRight: 16 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, background: vibe.published ? '#EAF0EA' : '#EDE8DC', color: vibe.published ? '#3D5A3E' : '#9A9895', padding: '3px 8px', borderRadius: 2 }}>
                          {vibe.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 0', borderBottom: '1px solid #DDD8CC' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <Link href={`/admin/vibe-editor?id=${vibe.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3D5A3E', textDecoration: 'none' }}>Edit</Link>
                          <DeleteButton id={vibe.id} table="vibes" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Vibe pagination */}
              {totalVibePages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '24px 0', flexWrap: 'wrap' }}>
                  {currentVibePage > 1 && (
                    <Link href={`?tab=vibes&vibePage=${currentVibePage - 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none' }}>←</Link>
                  )}
                  {Array.from({ length: totalVibePages }, (_, i) => i + 1).map(p => (
                    <Link key={p} href={`?tab=vibes&vibePage=${p}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: `2px solid ${p === currentVibePage ? '#1C1A16' : '#5A5855'}`, backgroundColor: p === currentVibePage ? '#1C1A16' : '#F5F0E8', color: p === currentVibePage ? '#F5F0E8' : '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none', minWidth: 36 }}>{p}</Link>
                  ))}
                  {currentVibePage < totalVibePages && (
                    <Link href={`?tab=vibes&vibePage=${currentVibePage + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none' }}>→</Link>
                  )}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 8 }}>{currentVibePage}/{totalVibePages} trang</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
