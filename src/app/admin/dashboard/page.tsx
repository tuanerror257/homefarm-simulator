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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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

  const postFrom = (currentPostPage - 1) * PER_PAGE
  const { data: posts } = await supabase
    .from('posts').select('*')
    .order('created_at', { ascending: false })
    .range(postFrom, postFrom + PER_PAGE - 1)

  const vibeFrom = (currentVibePage - 1) * PER_PAGE
  const { data: vibes } = await supabase
    .from('vibes').select('*')
    .order('created_at', { ascending: false })
    .range(vibeFrom, vibeFrom + PER_PAGE - 1)

  const totalPostPages = Math.ceil((totalPosts || 0) / PER_PAGE)
  const totalVibePages = Math.ceil((totalVibes || 0) / PER_PAGE)

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <style>{`
        .admin-wrap { max-width: 960px; margin: 0 auto; padding: 0 16px; }
        .admin-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 0 14px; border-bottom: 1px solid #DDD8CC; flex-wrap: wrap; gap: 10px; }
        .admin-logo { display: flex; align-items: baseline; }
        .admin-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .admin-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #DDD8CC; border: 1px solid #DDD8CC; margin: 20px 0; }
        .stat-card { background: #FAF7F2; padding: 14px; }
        .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .admin-table th { font-family: var(--font-mono); font-size: 10px; color: #9A9895; text-transform: uppercase; letter-spacing: 1px; padding: 10px 8px 10px 0; border-bottom: 1px solid #DDD8CC; text-align: left; white-space: nowrap; }
        .admin-table td { padding: 12px 8px 12px 0; border-bottom: 1px solid #DDD8CC; font-size: 13px; vertical-align: middle; }
        .admin-tabs { display: flex; gap: 0; border-bottom: 2px solid #DDD8CC; margin-bottom: 20px; }
        .admin-tab { padding: 10px 20px; font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; white-space: nowrap; }
        .btn-sm { font-family: var(--font-mono); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; padding: 6px 10px; border-radius: 2px; text-decoration: none; white-space: nowrap; border: 1.5px solid; cursor: pointer; }
        @media (max-width: 640px) {
          .admin-stats { grid-template-columns: repeat(2,1fr); }
          .stat-num { font-size: 22px !important; }
          .admin-actions { width: 100%; }
          .admin-tab { padding: 8px 14px; font-size: 10px; }
        }
      `}</style>

      <div class="admin-wrap">
        {/* Header */}
        <div class="admin-header">
          <div class="admin-logo">
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: '#1C1A16' }}>tada</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#C8102E', lineHeight: '0.85' }}>.</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, fontStyle: 'italic', color: '#1C1A16' }}>vibes</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9A9895', marginLeft: 10, letterSpacing: '1px' }}>ADMIN</span>
          </div>
          <div class="admin-actions">
            <Link href="/" className="btn-sm" style={{ color: '#5A5855', borderColor: '#5A5855', display: 'inline-flex' }}>← Site</Link>
            <Link href="/admin/categories" className="btn-sm" style={{ color: '#5A5855', borderColor: '#5A5855', display: 'inline-flex' }}>Chủ đề</Link>
            <Link href="/admin/comments" className="btn-sm" style={{ color: pendingComments ? '#C8102E' : '#5A5855', borderColor: pendingComments ? '#C8102E' : '#5A5855', display: 'inline-flex' }}>
              Comments{pendingComments ? ` (${pendingComments})` : ''}
            </Link>
            <LogoutButton />
            <Link href="/admin/vibe-editor" className="btn-sm" style={{ color: '#3D5A3E', borderColor: '#3D5A3E', display: 'inline-flex' }}>+ Vô Tri</Link>
            <Link href="/admin/editor" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 14px', borderRadius: 2, textDecoration: 'none' }}>+ Bài Mới</Link>
          </div>
        </div>

        {/* Stats */}
        <div class="admin-stats">
          {[
            { label: 'Tổng Bài', value: totalPosts || 0, delta: 'posts' },
            { label: 'Tổng Vô Tri', value: totalVibes || 0, delta: 'vibes' },
            { label: 'Comments', value: totalComments || 0, delta: `${pendingComments || 0} chờ duyệt`, alert: !!pendingComments },
            { label: 'Reactions', value: totalReactions || 0, delta: 'total' },
          ].map(stat => (
            <div key={stat.label} class="stat-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>{stat.label}</div>
              <div className="stat-num" style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: '#1C1A16' }}>{stat.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: stat.alert ? '#C8102E' : '#3D5A3E', marginTop: 3 }}>{stat.delta}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div class="admin-tabs">
          <Link href="?tab=posts" className="admin-tab" style={{ color: activeTab === 'posts' ? '#1C1A16' : '#9A9895', borderBottom: activeTab === 'posts' ? '2px solid #1C1A16' : '2px solid transparent', marginBottom: -2, textDecoration: 'none' }}>
            Bài viết ({totalPosts || 0})
          </Link>
          <Link href="?tab=vibes" className="admin-tab" style={{ color: activeTab === 'vibes' ? '#1C1A16' : '#9A9895', borderBottom: activeTab === 'vibes' ? '2px solid #1C1A16' : '2px solid transparent', marginBottom: -2, textDecoration: 'none' }}>
            Vô Tri ({totalVibes || 0})
          </Link>
        </div>

        {/* Posts tab */}
        {activeTab === 'posts' && (
          <div>
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tag</th>
                    <th>Thời gian</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(posts as Post[])?.map(post => {
                    const { bg, text } = tagBadge(post.tag, categories || [])
                    return (
                      <tr key={post.id}>
                        <td style={{ color: '#1C1A16', maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{post.title}</div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase', background: bg, color: text, whiteSpace: 'nowrap' }}>{post.tag}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', whiteSpace: 'nowrap' }}>
                          {formatDate(post.created_at)}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, background: post.published ? '#EAF0EA' : '#EDE8DC', color: post.published ? '#3D5A3E' : '#9A9895', padding: '2px 6px', borderRadius: 2, whiteSpace: 'nowrap' }}>
                            {post.published ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <Link href={`/blog/${post.slug}`} target="_blank" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textDecoration: 'none' }}>↗</Link>
                            <Link href={`/admin/editor?id=${post.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3D5A3E', textDecoration: 'none' }}>Edit</Link>
                            <DeleteButton id={post.id} table="posts" />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPostPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '20px 0', flexWrap: 'wrap' }}>
                {currentPostPage > 1 && <Link href={`?tab=posts&postPage=${currentPostPage - 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none' }}>←</Link>}
                {Array.from({ length: totalPostPages }, (_, i) => i + 1).map(p => (
                  <Link key={p} href={`?tab=posts&postPage=${p}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: `2px solid ${p === currentPostPage ? '#1C1A16' : '#5A5855'}`, backgroundColor: p === currentPostPage ? '#1C1A16' : '#F5F0E8', color: p === currentPostPage ? '#F5F0E8' : '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none', minWidth: 34 }}>{p}</Link>
                ))}
                {currentPostPage < totalPostPages && <Link href={`?tab=posts&postPage=${currentPostPage + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none' }}>→</Link>}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 8 }}>{currentPostPage}/{totalPostPages} trang</span>
              </div>
            )}
          </div>
        )}

        {/* Vibes tab */}
        {activeTab === 'vibes' && (
          <div>
            <div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Nội dung</th>
                    <th>Thời gian</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(vibes as Vibe[])?.map(vibe => (
                    <tr key={vibe.id}>
                      <td style={{ color: '#1C1A16' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{vibe.text}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', whiteSpace: 'nowrap' }}>
                        {formatDate(vibe.created_at)}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, background: vibe.published ? '#EAF0EA' : '#EDE8DC', color: vibe.published ? '#3D5A3E' : '#9A9895', padding: '2px 6px', borderRadius: 2 }}>
                          {vibe.published ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <Link href={`/admin/vibe-editor?id=${vibe.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#3D5A3E', textDecoration: 'none' }}>Edit</Link>
                          <DeleteButton id={vibe.id} table="vibes" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalVibePages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '20px 0', flexWrap: 'wrap' }}>
                {currentVibePage > 1 && <Link href={`?tab=vibes&vibePage=${currentVibePage - 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none' }}>←</Link>}
                {Array.from({ length: totalVibePages }, (_, i) => i + 1).map(p => (
                  <Link key={p} href={`?tab=vibes&vibePage=${p}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: `2px solid ${p === currentVibePage ? '#1C1A16' : '#5A5855'}`, backgroundColor: p === currentVibePage ? '#1C1A16' : '#F5F0E8', color: p === currentVibePage ? '#F5F0E8' : '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none', minWidth: 34 }}>{p}</Link>
                ))}
                {currentVibePage < totalVibePages && <Link href={`?tab=vibes&vibePage=${currentVibePage + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '6px 12px', borderRadius: 2, textDecoration: 'none' }}>→</Link>}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 8 }}>{currentVibePage}/{totalVibePages} trang</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
