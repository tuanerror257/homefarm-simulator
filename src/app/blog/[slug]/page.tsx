import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReactionBar from '@/components/ReactionBar'
import CommentSection from '@/components/CommentSection'
import { Post } from '@/lib/types'

function tagStyle(tag: string) {
  if (tag === 'Kinh Doanh') return { background: '#EAF0EA', color: '#3D5A3E' }
  if (tag === 'AI / Tech') return { background: '#FEF0E6', color: '#B85C1A' }
  return { background: '#F3EDF8', color: '#7B4FA6' }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const { data: reactions } = await supabase
    .from('reactions')
    .select('type')
    .eq('post_id', post.id)

  const reactionCounts = {
    heart: reactions?.filter(r => r.type === 'heart').length || 0,
    fire: reactions?.filter(r => r.type === 'fire').length || 0,
    think: reactions?.filter(r => r.type === 'think').length || 0,
  }

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', post.id)
    .eq('approved', true)
    .order('created_at', { ascending: true })

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />

        <div style={{ maxWidth: 660, padding: '40px 0' }}>
          {/* Back button */}
          <a href="/blog" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px',
            textTransform: 'uppercase', backgroundColor: 'transparent',
            color: '#1C1A16', border: '2px solid #1C1A16',
            padding: '9px 18px', borderRadius: 2, cursor: 'pointer',
            marginBottom: 32, textDecoration: 'none',
          }}>
            ← Quay lại Blog
          </a>

          {/* Tag */}
          <div style={{ marginBottom: 14 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              padding: '3px 8px', borderRadius: 2,
              textTransform: 'uppercase', letterSpacing: '0.5px',
              ...tagStyle((post as Post).tag)
            }}>
              {(post as Post).tag}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 400, lineHeight: 1.2,
            letterSpacing: '-0.8px', marginBottom: 20, color: '#1C1A16'
          }}>
            {post.title}
          </h1>

          {/* Byline */}
          <div style={{
            display: 'flex', gap: 14, padding: '14px 0',
            borderTop: '1px solid #DDD8CC', borderBottom: '1px solid #DDD8CC',
            marginBottom: 36
          }}>
            {[
              new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }),
              '·',
              '5 min read',
            ].map((item, i) => (
              <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895' }}>
                {item}
              </span>
            ))}
          </div>

          {/* Thumbnail */}
          {post.thumbnail_url && (
            <div style={{ width: '100%', marginBottom: 28, borderRadius: 2, overflow: 'hidden', lineHeight: 0 }}>
              <img src={post.thumbnail_url} alt={post.title} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Content */}
          <div
            style={{ fontSize: 16, lineHeight: 1.85, color: '#5A5855', fontWeight: 300 }}
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Reactions */}
          <ReactionBar postId={post.id} initialCounts={reactionCounts} />

          {/* Comments */}
          <CommentSection postId={post.id} initialComments={comments || []} />
        </div>

        <Footer />
      </div>
    </div>
  )
}
