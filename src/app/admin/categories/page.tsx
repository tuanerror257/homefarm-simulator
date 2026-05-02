import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CategoryActions from './CategoryActions'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px', borderBottom: '1px solid #DDD8CC' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: '#1C1A16' }}>tada</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: '#C8102E', lineHeight: '0.85' }}>.</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: '#1C1A16' }}>vibes</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9A9895', marginLeft: 12, letterSpacing: '1px' }}>CATEGORIES</span>
          </Link>
          <Link href="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A5855', border: '1.5px solid #5A5855', padding: '6px 14px', borderRadius: 2, textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ← Dashboard
          </Link>
        </div>

        <div style={{ padding: '36px 0' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: '#1C1A16', marginBottom: 8 }}>
            Quản lý Chủ đề
          </h1>
          <p style={{ fontSize: 13, color: '#9A9895', marginBottom: 32, fontFamily: 'var(--font-sans)' }}>
            Thêm, sửa hoặc xoá các chủ đề. Thay đổi sẽ tự động cập nhật trên toàn bộ site.
          </p>

          <CategoryActions categories={categories || []} />
        </div>
      </div>
    </div>
  )
}
