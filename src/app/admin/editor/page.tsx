import { Suspense } from 'react'
import EditorClient from './EditorClient'

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9A9895' }}>Loading...</span>
      </div>
    }>
      <EditorClient />
    </Suspense>
  )
}
