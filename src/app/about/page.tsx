import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('created_at', { ascending: true })

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        <Navbar />

        <div style={{ padding: '64px 0 80px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>
            About
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 50px)', fontWeight: 400, letterSpacing: '-1.5px', lineHeight: 1.1, color: '#1C1A16', marginBottom: 12 }}>
            Hoàng Anh Tuấn{' '}
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 400, fontStyle: 'italic', color: '#9A9895', letterSpacing: '-0.5px' }}>
              (Tada)
            </span>
          </h1>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9A9895', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 32 }}>
            COO — Strategist — Human
          </div>

          <div style={{ borderLeft: '2px solid #C8102E', paddingLeft: 20 }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontStyle: 'italic', color: '#5A5855', lineHeight: 1.7, margin: 0 }}>
              "Người sống nhiều không phải người sống lâu nhất — mà là người ít bỏ lỡ nhất."
            </p>
          </div>
        </div>

        <Footer categories={categories || []} />
      </div>
    </div>
  )
}
