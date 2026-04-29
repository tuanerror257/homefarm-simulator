import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const POSTS_PER_PAGE = 5

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ tag?: string; page?: string }> }) {
  const { tag, page } = await searchParams
  const currentPage = Number(page) || 1
  const supabase = await createClient()

  const { data: categories } = await supabase.from('categories').select('*').order('created_at', { ascending: true })

  let query = supabase.from('posts').select('*', { count: 'exact' }).eq('published', true).order('created_at', { ascending: false })
  if (tag) query = query.eq('tag', tag)
  const from = (currentPage - 1) * POSTS_PER_PAGE
  query = query.range(from, from + POSTS_PER_PAGE - 1)
  const { data: posts, count } = await query
  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)

  function getCatStyle(tagName: string) {
    const cat = categories?.find(c => c.name === tagName)
    return { background: cat?.color_bg || '#EAF0EA', color: cat?.color_text || '#3D5A3E' }
  }

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />
        <div style={{ padding: '56px 0 40px', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3D5A3E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Writing</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-1px', color: '#1C1A16' }}>
            some<span style={{ color: '#C8102E' }}>.</span><span style={{ fontStyle: 'italic' }}>things</span>
          </h1>
          <div style={{ width: 40, height: 2, background: '#C8102E', margin: '24px 0' }} />
          <p style={{ fontSize: 15, color: '#5A5855', lineHeight: 1.7, maxWidth: 480, fontWeight: 300 }}>Tớ viết về những gì đang làm, đang nghĩ, và đang học.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '16px 0', borderBottom: '1px solid #DDD8CC', flexWrap: 'wrap' }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 2, border: `2px solid ${!tag ? '#1C1A16' : '#5A5855'}`, backgroundColor: !tag ? '#1C1A16' : '#F5F0E8', color: !tag ? '#F5F0E8' : '#1C1A16', textDecoration: 'none' }}>Tất Cả</Link>
          {categories?.map(cat => {
            const isActive = tag === cat.name
            return (
              <Link key={cat.id} href={`/blog?tag=${encodeURIComponent(cat.name)}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.5px', textTransform: 'uppercase', padding: '8px 18px', borderRadius: 2, border: `2px solid ${isActive ? '#1C1A16' : '#5A5855'}`, backgroundColor: isActive ? '#1C1A16' : '#F5F0E8', color: isActive ? '#F5F0E8' : '#1C1A16', textDecoration: 'none' }}>{cat.name}</Link>
            )
          })}
        </div>
        {posts?.map((post: any) => (
          <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0 20px', padding: '24px 0', borderBottom: '1px solid #DDD8CC', alignItems: 'start' }}>
              <div style={{ width: 120, height: 90, borderRadius: 2, flexShrink: 0, overflow: 'hidden', background: '#2C3E50' }}>
                {post.thumbnail_url && <img src={post.thumbnail_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', ...getCatStyle(post.tag) }}>{post.tag}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, lineHeight: 1.3, color: '#1C1A16', marginBottom: 5 }}>{post.title}</div>
                <div style={{ fontSize: 13, color: '#5A5855', lineHeight: 1.6, fontWeight: 300 }}>{post.excerpt}</div>
              </div>
            </div>
          </Link>
        ))}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '32px 0', flexWrap: 'wrap' }}>
            {currentPage > 1 && <Link href={`/blog?${tag ? `tag=${encodeURIComponent(tag)}&` : ''}page=${currentPage - 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '8px 14px', borderRadius: 2, textDecoration: 'none', minWidth: 38 }}>←</Link>}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link key={p} href={`/blog?${tag ? `tag=${encodeURIComponent(tag)}&` : ''}page=${p}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: `2px solid ${p === currentPage ? '#1C1A16' : '#5A5855'}`, backgroundColor: p === currentPage ? '#1C1A16' : '#F5F0E8', color: p === currentPage ? '#F5F0E8' : '#1C1A16', padding: '8px 14px', borderRadius: 2, textDecoration: 'none', minWidth: 38 }}>{p}</Link>
            ))}
            {currentPage < totalPages && <Link href={`/blog?${tag ? `tag=${encodeURIComponent(tag)}&` : ''}page=${currentPage + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '8px 14px', borderRadius: 2, textDecoration: 'none', minWidth: 38 }}>→</Link>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 8 }}>{currentPage}/{totalPages} trang</span>
          </div>
        )}
        <Footer categories={categories || []} />
      </div>
    </div>
  )
}
