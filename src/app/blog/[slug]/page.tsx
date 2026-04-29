import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReactionBar from '@/components/ReactionBar'
import CommentSection from '@/components/CommentSection'

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('title, excerpt, thumbnail_url').eq('slug', slug).single()
  if (!post) return { title: 'Không tìm thấy — tadavibes' }
  return {
    title: `${post.title} — tadavibes`,
    description: post.excerpt || '',
    openGraph: { title: post.title, description: post.excerpt || '', type: 'article', images: post.thumbnail_url ? [{ url: post.thumbnail_url, width: 1200, height: 630 }] : [] },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt || '', images: post.thumbnail_url ? [post.thumbnail_url] : [] },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase.from('posts').select('*').eq('slug', slug).eq('published', true).single()
  if (!post) notFound()

  // Load categories, reactions, comments, related posts in parallel
  const [
    { data: categories },
    { data: reactions },
    { data: comments },
    { data: related },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: true }),
    supabase.from('reactions').select('type').eq('post_id', post.id),
    supabase.from('comments').select('*').eq('post_id', post.id).eq('approved', true).order('created_at', { ascending: true }),
    supabase.from('posts').select('id, title, slug, excerpt, tag, created_at, thumbnail_url')
      .eq('published', true).eq('tag', post.tag).neq('id', post.id).limit(3),
  ])

  const reactionCounts = {
    heart: reactions?.filter(r => r.type === 'heart').length || 0,
    fire: reactions?.filter(r => r.type === 'fire').length || 0,
    think: reactions?.filter(r => r.type === 'think').length || 0,
  }
  const minRead = readingTime(post.content || '')

  // Find category color
  const category = categories?.find(c => c.name === post.tag)
  const tagBg = category?.color_bg || '#EAF0EA'
  const tagColor = category?.color_text || '#3D5A3E'

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />

        <div style={{ maxWidth: 660, padding: '40px 0' }}>
          <a href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', backgroundColor: 'transparent', color: '#1C1A16', border: '2px solid #1C1A16', padding: '9px 18px', borderRadius: 2, marginBottom: 32, textDecoration: 'none' }}>
            ← Quay lại Blog
          </a>

          {/* Tag */}
          <div style={{ marginBottom: 14 }}>
            <Link href={`/blog?tag=${encodeURIComponent(post.tag)}`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', background: tagBg, color: tagColor, textDecoration: 'none' }}>
              {post.tag}
            </Link>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.8px', marginBottom: 20, color: '#1C1A16' }}>
            {post.title}
          </h1>

          {/* Byline */}
          <div style={{ display: 'flex', gap: 14, padding: '14px 0', borderTop: '1px solid #DDD8CC', borderBottom: '1px solid #DDD8CC', marginBottom: 36, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895' }}>
              {new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895' }}>{minRead} min read</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895' }}>{comments?.length || 0} comments</span>
          </div>

          {/* Thumbnail */}
          {post.thumbnail_url && (
            <div style={{ width: '100%', marginBottom: 28, borderRadius: 2, overflow: 'hidden', lineHeight: 0 }}>
              <img src={post.thumbnail_url} alt={post.title} style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Content */}
          <div className="article-content" style={{ fontSize: 16, lineHeight: 1.85, color: '#5A5855', fontWeight: 300 }}
            dangerouslySetInnerHTML={{ __html: post.content || '' }} />

          {/* Reactions */}
          <ReactionBar postId={post.id} initialCounts={reactionCounts} />

          {/* Related Posts */}
          {related && related.length > 0 && (
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #DDD8CC' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 400, letterSpacing: '2px', textTransform: 'uppercase', color: '#9A9895', marginBottom: 20 }}>
                Bài viết liên quan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {related.map(p => {
                  const relCat = categories?.find(c => c.name === p.tag)
                  return (
                    <Link key={p.id} href={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0 14px', padding: '16px 0', borderBottom: '1px solid #DDD8CC', alignItems: 'start' }}>
                        <div style={{ width: 80, height: 60, borderRadius: 2, overflow: 'hidden', background: '#2C3E50', flexShrink: 0 }}>
                          {p.thumbnail_url && (
                            <img src={p.thumbnail_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          )}
                        </div>
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', background: relCat?.color_bg || '#EAF0EA', color: relCat?.color_text || '#3D5A3E' }}>
                              {p.tag}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
                              {new Date(p.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 400, lineHeight: 1.3, color: '#1C1A16' }}>
                            {p.title}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentSection postId={post.id} initialComments={comments || []} />
        </div>

        <Footer />
      </div>
    </div>
  )
}
