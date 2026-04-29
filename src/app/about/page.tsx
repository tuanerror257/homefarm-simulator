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
        <div style={{ padding: '56px 0' }}>
          <div style={{ width: 1, height: 56, background: '#C8102E', marginBottom: 32 }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 400, letterSpacing: '-1px', marginBottom: 6, color: '#1C1A16' }}>Hoàng Anh Tuấn</h1>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9A9895', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 36 }}>COO — Strategist — Human</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #DDD8CC' }}>
            {[
              { label: 'Vai trò', value: 'COO @ Homefarm', sub: '286 cửa hàng thực phẩm tươi sạch' },
              { label: 'Thế mạnh', value: 'Strategy & Marketing', sub: 'Nhìn xa trông rộng' },
              { label: 'Đang nghiên cứu', value: 'AI trong vận hành', sub: 'Automation, data' },
              { label: 'Ngoài giờ làm', value: 'Chạy bộ. Tử vi. Tản văn.', sub: 'Cai thuốc 16 tháng rồi' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid #DDD8CC', ...(i % 2 === 0 ? { paddingRight: 36, borderRight: '1px solid #DDD8CC' } : { paddingLeft: 36 }) }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: '#1C1A16', lineHeight: 1.5 }}>
                  {item.value}<br />
                  <span style={{ color: '#9A9895', fontSize: 13 }}>{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, paddingLeft: 20, borderLeft: '2px solid #C8102E', fontFamily: 'var(--font-serif)', fontSize: 20, fontStyle: 'italic', color: '#5A5855', lineHeight: 1.5 }}>
            "Được mời vào, không phải xin vào."
          </div>
        </div>
        <Footer categories={categories || []} />
      </div>
    </div>
  )
}
