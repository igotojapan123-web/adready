'use client'
import { useState } from 'react'

export default function KeywordPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ keyword: string; volume: number; difficulty: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/keyword', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
      const data = await res.json()
      setResults(data.keywords || [])
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">키워드 리서치</h1>
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="키워드를 입력하세요" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
        <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition disabled:opacity-50">{loading ? '검색 중...' : '검색'}</button>
      </form>
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">키워드</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">검색량</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">경쟁도</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{r.keyword}</td>
                  <td className="px-6 py-4 text-gray-500">{r.volume.toLocaleString()}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${r.difficulty === '낮음' ? 'bg-green-100 text-green-700' : r.difficulty === '보통' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.difficulty}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
