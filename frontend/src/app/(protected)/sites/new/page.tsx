'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSitePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [plugin, setPlugin] = useState<'coupang' | 'adsense'>('coupang')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSlugChange = (v: string) => setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, slug, plugin }) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || '사이트 생성 실패') }
      const { id } = await res.json()
      router.push(`/sites/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">새 사이트 만들기</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사이트 이름</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="내 블로그" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">슬러그 (도메인)</label>
          <div className="flex items-center gap-2">
            <input type="text" value={slug} onChange={e => handleSlugChange(e.target.value)} required className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="my-blog" />
            <span className="text-sm text-gray-500">.adready.kr</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">수익화 플러그인</label>
          <select value={plugin} onChange={e => setPlugin(e.target.value as 'coupang' | 'adsense')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="coupang">쿠팡 파트너스</option>
            <option value="adsense">애드센스</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition disabled:opacity-50">{loading ? '생성 중...' : '사이트 생성'}</button>
      </form>
    </div>
  )
}
