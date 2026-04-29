import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Post, Vibe } from '@/lib/types'

function tagStyle(tag: string) {
  if (tag === 'Kinh Doanh') return { background: '#EAF0EA', color: '#3D5A3E' }
  if (tag === 'AI / Tech') return { background: '#FEF0E6', color: '#B85C1A' }
  return { background: '#F3EDF8', color: '#7B4FA6' }
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: vibes } = await supabase
    .from('vibes')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />

        {/* Hero */}
        <div style={{ padding: '56px 0 40px', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3D5A3E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
            Tadavibes — Personal Space
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-1px', color: '#1C1A16', maxWidth: 560, marginBottom: 16 }}>
            Thoughts, <em style={{ fontStyle: 'italic', color: '#C8102E' }}>vibes</em>, và những thứ linh tinh.
          </h1>
          <div style={{ width: 40, height: 2, background: '#C8102E', margin: '24px 0' }} />
          <p style={{ fontSize: 15, color: '#5A5855', lineHeight: 1.7, maxWidth: 480, fontWeight: 300 }}>
            Nơi tớ ghi lại những gì đang nghĩ — về kinh doanh, cuộc sống, và đôi khi chỉ là mấy câu không đầu không đuôi.
          </p>
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '36px 0 16px', borderBottom: '1px solid #DDD8CC' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 400, letterSpacing: '2px', textTransform: 'uppercase', color: '#9A9895' }}>Bài Mới Nhất</span>
          <Link href="/blog" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3D5A3E', textDecoration: 'none' }}>Xem tất cả →</Link>
        </div>

        {/* Posts */}
        {(posts as Post[])?.map(post => (
          <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '0 16px', padding: '20px 0', borderBottom: '1px solid #DDD8CC', alignItems: 'start' }}>

              {/* Thumbnail */}
              <div style={{ width: 88, height: 72, borderRadius: 2, flexShrink: 0, overflow: 'hidden', background: '#2C3E50' }}>
                {post.thumbnail_url && (
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </div>

              {/* Content */}
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', ...tagStyle(post.tag) }}>
                    {post.tag}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, lineHeight: 1.3, color: '#1C1A16', marginBottom: 5 }}>
                  {post.title}
                </div>
                <div style={{ fontSize: 13, color: '#5A5855', lineHeight: 1.6, fontWeight: 300 }}>
                  {post.excerpt}
                </div>
              </div>
            </div>
          </Link>
        ))}

        <div style={{ padding: '24px 0 0', display: 'flex', justifyContent: 'center' }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', background: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 18px', borderRadius: 2, textDecoration: 'none' }}>
            Xem thêm bài viết →
          </Link>
        </div>

        {/* Vibes section */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '36px 0 16px', borderBottom: '1px solid #DDD8CC', marginTop: 16 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 400, letterSpacing: '2px', textTransform: 'uppercase', color: '#9A9895' }}>Góc Vô Tri</span>
          <Link href="/vibes" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3D5A3E', textDecoration: 'none' }}>Xem tất cả →</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#DDD8CC', border: '1px solid #DDD8CC', marginTop: 16 }}>
          {(vibes as Vibe[])?.map(vibe => (
            <div key={vibe.id} style={{ background: '#F5F0E8', padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: '#1C1A16', fontWeight: 300, flex: 1, marginBottom: 14 }}>
                {vibe.text}
              </div>
              <div style={{ marginTop: 'auto' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
                  {new Date(vibe.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '24px 0 0', display: 'flex', justifyContent: 'center' }}>
          <Link href="/vibes" style={{ display: 'inline-flex', alignItems: 'center', background: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '9px 18px', borderRadius: 2, textDecoration: 'none' }}>
            Xem thêm vô tri →
          </Link>
        </div>

        <Footer />
      </div>
    </div>
  )
}
