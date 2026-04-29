import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Vibe } from '@/lib/types'

const VIBES_PER_PAGE = 6

export default async function VibesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const supabase = await createClient()

  const [{ data: categories }] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: true }),
  ])

  const from = (currentPage - 1) * VIBES_PER_PAGE
  const { data: vibes, count } = await supabase
    .from('vibes').select('*', { count: 'exact' }).eq('published', true)
    .order('created_at', { ascending: false }).range(from, from + VIBES_PER_PAGE - 1)
  const totalPages = Math.ceil((count || 0) / VIBES_PER_PAGE)

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />
        <div style={{ padding: '56px 0 40px', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3D5A3E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Góc Vô Tri</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-1px', color: '#1C1A16' }}>
            short<span style={{ color: '#C8102E' }}>.</span><span style={{ fontStyle: 'italic' }}>thoughts</span>
          </h1>
          <div style={{ width: 40, height: 2, background: '#C8102E', margin: '24px 0' }} />
          <p style={{ fontSize: 15, color: '#5A5855', lineHeight: 1.7, maxWidth: 480, fontWeight: 300 }}>Không phải blog, không phải nhật ký. Chỉ là những mảnh suy nghĩ ngắn.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#DDD8CC', border: '1px solid #DDD8CC', marginTop: 24 }}>
          {(vibes as Vibe[])?.map(vibe => (
            <div key={vibe.id} style={{ background: '#F5F0E8', padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: '#1C1A16', fontWeight: 300, flex: 1, marginBottom: 14 }}>{vibe.text}</div>
              <div style={{ marginTop: 'auto' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>
                  {new Date(vibe.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '32px 0', flexWrap: 'wrap' }}>
            {currentPage > 1 && <a href={`/vibes?page=${currentPage - 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '8px 14px', borderRadius: 2, textDecoration: 'none', minWidth: 38 }}>←</a>}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <a key={p} href={`/vibes?page=${p}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: `2px solid ${p === currentPage ? '#1C1A16' : '#5A5855'}`, backgroundColor: p === currentPage ? '#1C1A16' : '#F5F0E8', color: p === currentPage ? '#F5F0E8' : '#1C1A16', padding: '8px 14px', borderRadius: 2, textDecoration: 'none', minWidth: 38 }}>{p}</a>
            ))}
            {currentPage < totalPages && <a href={`/vibes?page=${currentPage + 1}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, border: '2px solid #5A5855', backgroundColor: '#F5F0E8', color: '#1C1A16', padding: '8px 14px', borderRadius: 2, textDecoration: 'none', minWidth: 38 }}>→</a>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 8 }}>{currentPage}/{totalPages} trang</span>
          </div>
        )}

        <Footer categories={categories || []} />
      </div>
    </div>
  )
}
