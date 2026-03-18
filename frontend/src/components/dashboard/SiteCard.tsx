import Link from 'next/link'

interface SiteCardProps {
  site: {
    id: string
    name: string
    slug: string
    status: string
    installStep: number | null
    createdAt: Date | string
    _count: { posts: number }
  }
}

export default function SiteCard({ site }: SiteCardProps) {
  const statusMap: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: '운영 중', color: 'bg-green-100 text-green-700' },
    INSTALLING: { label: '설치 중', color: 'bg-yellow-100 text-yellow-700' },
    PENDING: { label: '대기', color: 'bg-gray-100 text-gray-600' },
    FAILED: { label: '실패', color: 'bg-red-100 text-red-700' },
  }
  const s = statusMap[site.status] ?? statusMap.PENDING

  return (
    <Link href={`/sites/${site.id}`} className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{site.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
      </div>
      <p className="text-sm text-gray-500 mb-3">{site.slug}.adready.kr</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>글 {site._count.posts}개</span>
        <span>{new Date(site.createdAt).toLocaleDateString('ko-KR')}</span>
      </div>
      {site.status === 'INSTALLING' && site.installStep && (
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-primary rounded-full h-1.5" style={{ width: `${(site.installStep / 7) * 100}%` }} /></div>
          <p className="text-xs text-gray-400 mt-1">설치 단계 {site.installStep}/7</p>
        </div>
      )}
    </Link>
  )
}
