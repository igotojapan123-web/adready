import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function PostsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const posts = await prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { site: { select: { name: true, slug: true } } },
  })

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">발행된 글</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">제목</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">사이트</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">키워드</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">SEO</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">상태</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">발행일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {post.permalink ? <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{post.title}</a> : post.title}
                </td>
                <td className="px-6 py-4 text-gray-500">{post.site?.name}</td>
                <td className="px-6 py-4 text-gray-500">{post.keyword}</td>
                <td className="px-6 py-4"><span className={`font-medium ${(post.seoScore ?? 0) >= 80 ? 'text-green-600' : (post.seoScore ?? 0) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{post.seoScore ?? '-'}</span></td>
                <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : post.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{post.status}</span></td>
                <td className="px-6 py-4 text-gray-400 text-xs">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ko-KR') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <p className="text-center py-12 text-gray-500">아직 발행된 글이 없습니다</p>}
      </div>
    </div>
  )
}
