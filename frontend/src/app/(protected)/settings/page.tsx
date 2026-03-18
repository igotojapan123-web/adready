import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">설정</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <p className="text-gray-900">{session.user.name ?? '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <p className="text-gray-900">{session.user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">플랜</label>
          <p className="text-gray-900">{(session.user as { plan?: string }).plan ?? 'STARTER'}</p>
        </div>
      </div>
    </div>
  )
}
