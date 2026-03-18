import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function SitesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
  })

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">내 사이트</h1>
        <Link href="/sites/new" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition">새 사이트 만들기</Link>
      </div>
      {sites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">아직 사이트가 없습니다</p>
          <Link href="/sites/new" className="text-primary font-medium hover:underline">첫 사이트를 만들어보세요</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map(site => (
            <Link key={site.id} href={`/sites/${site.id}`} className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-primary transition">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{site.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${site.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : site.status === 'INSTALLING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{site.status}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{site.slug}.adready.kr</p>
              <p className="text-xs text-gray-400">발행 글 {site._count.posts}개</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
