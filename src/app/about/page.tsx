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

        {/* Hero section */}
        <div style={{ padding: '64px 0 48px', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3D5A3E', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>
                About
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-1.5px', color: '#1C1A16', marginBottom: 24 }}>
                Hoàng Anh Tuấn
              </h1>
              {/* Tagline */}
              <div style={{ borderLeft: '2px solid #C8102E', paddingLeft: 20, marginBottom: 28 }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontStyle: 'italic', color: '#5A5855', lineHeight: 1.6 }}>
                  "Người sống nhiều không phải người sống lâu nhất — mà là người ít bỏ lỡ nhất."
                </p>
              </div>
              <p style={{ fontSize: 15, color: '#5A5855', lineHeight: 1.8, fontWeight: 300, maxWidth: 480 }}>
                COO tại Homefarm. Strategist nhiều hơn operator. Được mời vào, không phải xin vào.
                Đang dùng AI để làm việc của 10 người — và vẫn dậy lúc 5h sáng để chạy bộ một mình.
              </p>
            </div>

            {/* Avatar illustration */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background circle */}
                <circle cx="90" cy="90" r="88" fill="#EDE8DC" stroke="#DDD8CC" strokeWidth="1"/>
                {/* Body */}
                <ellipse cx="90" cy="145" rx="42" ry="28" fill="#2C3E50"/>
                {/* Head */}
                <circle cx="90" cy="72" r="32" fill="#C8A882"/>
                {/* Hair */}
                <ellipse cx="90" cy="48" rx="32" ry="18" fill="#1C1A16"/>
                <ellipse cx="70" cy="56" rx="12" ry="16" fill="#1C1A16"/>
                <ellipse cx="110" cy="56" rx="12" ry="16" fill="#1C1A16"/>
                {/* Eyes */}
                <ellipse cx="80" cy="72" rx="4" ry="4.5" fill="#1C1A16"/>
                <ellipse cx="100" cy="72" rx="4" ry="4.5" fill="#1C1A16"/>
                {/* Eye shine */}
                <circle cx="82" cy="70" r="1.5" fill="white"/>
                <circle cx="102" cy="70" r="1.5" fill="white"/>
                {/* Subtle smile */}
                <path d="M82 82 Q90 88 98 82" stroke="#1C1A16" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                {/* Collar */}
                <path d="M72 118 L90 130 L108 118" stroke="#F5F0E8" strokeWidth="2" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Now section */}
        <div style={{ padding: '48px 0', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 24 }}>
            Hiện tại
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }}>
            <div>
              <p style={{ fontSize: 15, color: '#1C1A16', lineHeight: 1.8, fontWeight: 400, marginBottom: 16 }}>
                Đang là COO tại <strong>Homefarm</strong> — chuỗi thực phẩm tươi sạch với 286 cửa hàng trên toàn quốc.
                Phụ trách Operations, Procurement, và Marketing.
              </p>
              <p style={{ fontSize: 15, color: '#5A5855', lineHeight: 1.8, fontWeight: 300 }}>
                Thế mạnh là nhìn xa và làm rõ chiến lược — không phải chạy từng việc nhỏ.
                Được mời vào từ ngày đầu bởi CEO, không phải qua CV hay phỏng vấn thông thường.
              </p>
            </div>
            <div>
              <p style={{ fontSize: 15, color: '#5A5855', lineHeight: 1.8, fontWeight: 300, marginBottom: 16 }}>
                Đang tích cực ứng dụng AI vào công việc hàng ngày — từ phân tích dữ liệu,
                tự động hoá báo cáo, đến xây dựng các công cụ nội bộ mà không cần đội kỹ thuật.
              </p>
              <p style={{ fontSize: 15, color: '#5A5855', lineHeight: 1.8, fontWeight: 300 }}>
                Trang blog này cũng là một phần của hành trình đó — viết để nghĩ rõ hơn,
                không phải để xây thương hiệu cá nhân.
              </p>
            </div>
          </div>
        </div>

        {/* Interests grid */}
        <div style={{ padding: '48px 0', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 24 }}>
            Ngoài giờ làm
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#DDD8CC', border: '1px solid #DDD8CC' }}>
            {[
              {
                icon: '🏃',
                title: 'Chạy bộ mỗi sáng',
                desc: 'Dậy 5h. Chạy trước khi ai nhắn tin. Không phải vì kỷ luật — mà vì đó là lúc duy nhất đầu óc thực sự yên tĩnh.',
              },
              {
                icon: '🤖',
                title: 'AI & Automation',
                desc: 'Không phải vì trend. Mà vì tớ ghét làm đi làm lại những việc có thể tự động hoá. Đang build nhiều thứ với Claude API.',
              },
              {
                icon: '📊',
                title: 'Kinh doanh & Data',
                desc: 'Tin rằng mọi quyết định kinh doanh tốt đều bắt đầu từ việc hiểu đúng số liệu — không phải cảm tính.',
              },
              {
                icon: '🌿',
                title: 'Wellness routine',
                desc: 'Intermittent fasting, supplement stack, ngủ đủ giấc. Cai thuốc được 16 tháng rồi — không có bí quyết, chỉ là thay đổi cách nhìn.',
              },
              {
                icon: '✍️',
                title: 'Viết & Suy nghĩ',
                desc: 'Viết để hiểu bản thân hơn là để người khác đọc. Những gì lên blog là những thứ đã được nghĩ đi nghĩ lại nhiều lần.',
              },
              {
                icon: '🚗',
                title: 'Lái xe số sàn',
                desc: 'Kia Cerato 2019, số sàn. Mọi người hỏi sao không đi tự động. Vì đó là lúc duy nhất tớ buộc phải tập trung vào đúng một việc.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: '#F5F0E8', padding: '28px 24px' }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 400, color: '#1C1A16', marginBottom: 8, lineHeight: 1.3 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: '#5A5855', lineHeight: 1.65, fontWeight: 300 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy */}
        <div style={{ padding: '48px 0', borderBottom: '1px solid #DDD8CC' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 32 }}>
            Một vài thứ tớ tin
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              'Được mời vào bao giờ cũng tốt hơn xin vào — không phải vì tự ái, mà vì nó có nghĩa là người ta thực sự cần mình.',
              'AI không lấy job của bạn. Người biết dùng AI mới lấy job của bạn.',
              'Data không nói dối. Nhưng người đọc data thì có thể.',
              'Habit thay đổi khi identity thay đổi — không phải ngược lại.',
              'Cuộc sống đo bằng trải nghiệm, không phải thành tích. Người sống nhiều nhất là người ít bỏ lỡ nhất.',
            ].map((belief, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#C8102E', marginTop: 4, flexShrink: 0 }}>0{i + 1}</span>
                <p style={{ fontSize: 15, color: '#1C1A16', lineHeight: 1.7, fontWeight: 300 }}>{belief}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact / closing */}
        <div style={{ padding: '48px 0' }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9A9895', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>
              Liên hệ
            </div>
            <p style={{ fontSize: 15, color: '#5A5855', lineHeight: 1.8, fontWeight: 300, marginBottom: 24 }}>
              Tớ không hay reply nhanh — nhưng đọc hết mọi thứ được gửi đến.
              Nếu có gì muốn nói, cứ tự nhiên.
            </p>
            <a href="mailto:tada@tadavibes.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: '#1C1A16', border: '2px solid #1C1A16', padding: '10px 20px', borderRadius: 2, textDecoration: 'none' }}>
              tada@tadavibes.com →
            </a>
          </div>
        </div>

        <Footer categories={categories || []} />
      </div>
    </div>
  )
}
