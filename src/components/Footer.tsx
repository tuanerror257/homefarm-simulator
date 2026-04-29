import Link from 'next/link'

interface Category {
  id: string
  name: string
  color_bg: string
  color_text: string
}

export default function Footer({ categories = [] }: { categories?: Category[] }) {
  return (
    <footer style={{ borderTop: '1px solid #DDD8CC', marginTop: 64, padding: '40px 0 28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, color: '#1C1A16' }}>tada</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#C8102E', lineHeight: '0.85' }}>.</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, fontStyle: 'italic', color: '#1C1A16' }}>vibes</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9A9895', letterSpacing: '1.5px', marginTop: 4 }}>Góc nhỏ của Tada</div>
          <p style={{ fontSize: 13, color: '#9A9895', lineHeight: 1.6, marginTop: 12, fontWeight: 300 }}>
            Góc nhỏ trên internet để viết, nghĩ, và tản mạn.
          </p>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>Khám phá</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([['/', 'Home'], ['/blog', 'Blog'], ['/vibes', 'Góc Vô Tri'], ['/about', 'About']] as [string, string][]).map(([href, label]) => (
              <Link key={href} href={href} style={{ fontSize: 13, color: '#5A5855', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>Chủ đề</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categories.length > 0 ? categories.map(cat => (
              <Link key={cat.id} href={`/blog?tag=${encodeURIComponent(cat.name)}`}
                style={{ display: 'inline-block', alignSelf: 'flex-start', background: cat.color_bg, color: cat.color_text, fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none' }}>
                {cat.name}
              </Link>
            )) : (
              // Fallback nếu không có categories
              <>
                <Link href="/blog?tag=Kinh+Doanh" style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#EAF0EA', color: '#3D5A3E', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none' }}>Kinh Doanh</Link>
                <Link href="/blog?tag=AI+%2F+Tech" style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#FEF0E6', color: '#B85C1A', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none' }}>AI / Tech</Link>
                <Link href="/blog?tag=Lifestyle" style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#F3EDF8', color: '#7B4FA6', fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 10px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none' }}>Lifestyle</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #DDD8CC', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>© 2026 tadavibes — Hoàng Anh Tuấn</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895' }}>Made with intention, not perfection.</span>
      </div>
    </footer>
  )
}
