interface Post {
  id: string
  title: string
  keyword: string | null
  seoScore: number | null
  publishedAt: Date | string | null
  permalink: string | null
  site: { name: string; slug: string } | null
}

export default function PostTable({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="text-center py-8 text-gray-500 text-sm">아직 발행된 글이 없습니다</p>

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="text-left px-5 py-3 font-medium text-gray-500">제목</th>
          <th className="text-left px-5 py-3 font-medium text-gray-500">사이트</th>
          <th className="text-left px-5 py-3 font-medium text-gray-500">SEO</th>
          <th className="text-left px-5 py-3 font-medium text-gray-500">발행일</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {posts.map(post => (
          <tr key={post.id} className="hover:bg-gray-50">
            <td className="px-5 py-3">
              {post.permalink ? <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{post.title}</a> : <span>{post.title}</span>}
            </td>
            <td className="px-5 py-3 text-gray-500">{post.site?.name ?? '-'}</td>
            <td className="px-5 py-3"><span className={`font-medium ${(post.seoScore ?? 0) >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>{post.seoScore ?? '-'}</span></td>
            <td className="px-5 py-3 text-gray-400 text-xs">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ko-KR') : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
