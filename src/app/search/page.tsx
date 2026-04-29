import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories').select('*').order('created_at', { ascending: true })

  let posts: any[] = []
  let vibes: any[] = []

  if (q && q.trim().length > 0) {
    const query = q.trim()

    // Search posts
    const { data: postResults } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, tag, created_at, thumbnail_url')
      .eq('published', true)
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10)

    // Search vibes
    const { data: vibeResults } = await supabase
      .from('vibes')
      .select('id, text, created_at')
      .eq('published', true)
      .ilike('text', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(6)

    posts = postResults || []
    vibes = vibeResults || []
  }

  function getCatStyle(tagName: string) {
    const cat = categories?.find(c => c.name === tagName)
    return { background: cat?.color_bg || '#EAF0EA', color: cat?.color_text || '#3D5A3E' }
  }

  const totalResults = posts.length + vibes.length

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />

        {/* Search hero */}
        <div style={{ padding: '56px 0 40px', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3D5A3E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>
            Tìm kiếm
          </div>

          <form action="/search" method="GET">
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '2px solid #1C1A16', paddingBottom: 12, marginBottom: 0 }}>
              <input
                name="q"
                defaultValue={q || ''}
                placeholder="Gõ từ khoá..."
                autoFocus
                style={{ flex: 1, fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 4vw, 32px)', fontStyle: 'italic', border: 'none', background: 'none', outline: 'none', color: '#1C1A16' }}
              />
              <button type="submit"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', background: 'none', border: 'none', color: '#9A9895', cursor: 'pointer', padding: '0 0 0 16px', flexShrink: 0 }}>
                Tìm →
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div style={{ padding: '32px 0' }}>
          {!q ? (
            <p style={{ fontSize: 14, color: '#9A9895', fontFamily: 'var(--font-mono)' }}>
              Gõ từ khoá để tìm bài viết hoặc vô tri...
            </p>
          ) : totalResults === 0 ? (
            <div style={{ padding: '40px 0' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: '#1C1A16', marginBottom: 8 }}>
                Không tìm thấy kết quả cho "<em>{q}</em>"
              </p>
              <p style={{ fontSize: 13, color: '#9A9895', fontWeight: 300 }}>Thử từ khoá khác nhé bro.</p>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', letterSpacing: '1px', marginBottom: 28 }}>
                {totalResults} kết quả cho "{q}"
              </div>

              {/* Blog posts */}
              {posts.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
                    Bài viết ({posts.length})
                  </div>
                  {posts.map(post => (
                    <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '0 16px', padding: '18px 0', borderBottom: '1px solid #DDD8CC', alignItems: 'start' }}>
                        <div style={{ width: 88, height: 66, borderRadius: 2, overflow: 'hidden', background: '#2C3E50', flexShrink: 0 }}>
                          {post.thumbnail_url && <img src={post.thumbnail_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', ...getCatStyle(post.tag) }}>{post.tag}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, lineHeight: 1.3, color: '#1C1A16', marginBottom: 4 }}>{post.title}</div>
                          <div style={{ fontSize: 13, color: '#5A5855', lineHeight: 1.6, fontWeight: 300 }}>{post.excerpt}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Vibes */}
              {vibes.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
                    Góc Vô Tri ({vibes.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#DDD8CC', border: '1px solid #DDD8CC' }}>
                    {vibes.map(vibe => (
                      <div key={vibe.id} style={{ background: '#F5F0E8', padding: '20px' }}>
                        <div style={{ fontSize: 14, lineHeight: 1.7, color: '#1C1A16', fontWeight: 300, marginBottom: 10 }}>{vibe.text}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
                          {new Date(vibe.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Footer categories={categories || []} />
      </div>
    </div>
  )
}
