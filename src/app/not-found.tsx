import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 480, padding: '0 24px', textAlign: 'center' }}>

        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(80px, 15vw, 120px)', fontWeight: 400, color: '#DDD8CC', lineHeight: 1, marginBottom: 8 }}>
          404
        </div>

        <div style={{ width: 40, height: 2, background: '#C8102E', margin: '0 auto 28px' }} />

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 400, color: '#1C1A16', lineHeight: 1.3, marginBottom: 16 }}>
          Trang này không tồn tại
        </h1>

        <p style={{ fontSize: 14, color: '#9A9895', lineHeight: 1.7, fontWeight: 300, marginBottom: 36 }}>
          Có thể bro gõ nhầm URL, hoặc trang đã bị xoá.<br />
          Không sao — quay lại từ đầu thôi.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#1C1A16', color: '#F5F0E8', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 2, textDecoration: 'none' }}>
            ← Về trang chủ
          </Link>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'transparent', color: '#1C1A16', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: 2, border: '2px solid #1C1A16', textDecoration: 'none' }}>
            Đọc blog
          </Link>
        </div>

      </div>
    </div>
  )
}
