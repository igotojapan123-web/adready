import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PLAN_LIMITS } from '@/lib/plan-limits'

const PLAN_PRICES: Record<string, { monthly: number; name: string; desc: string }> = {
  STARTER: { monthly: 0, name: '스타터', desc: '무료로 시작하기' },
  PRO: { monthly: 29000, name: '프로', desc: '본격적인 수익화' },
  BUSINESS: { monthly: 79000, name: '비즈니스', desc: '대규모 운영' },
}

export default async function BillingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  const currentPlan = (session.user as { plan?: string }).plan ?? 'STARTER'

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">플랜 & 결제</h1>
      <p className="text-sm text-gray-500 mb-8">현재 플랜: <span className="font-semibold text-primary">{PLAN_PRICES[currentPlan]?.name ?? currentPlan}</span></p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(PLAN_LIMITS) as Array<keyof typeof PLAN_LIMITS>).map(plan => {
          const price = PLAN_PRICES[plan]
          const limits = PLAN_LIMITS[plan]
          const isCurrent = plan === currentPlan
          return (
            <div key={plan} className={`p-6 rounded-xl border-2 ${isCurrent ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}`}>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{price.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{price.desc}</p>
              <p className="text-3xl font-bold text-gray-900 mb-6">{price.monthly === 0 ? '무료' : `₩${price.monthly.toLocaleString()}`}<span className="text-sm font-normal text-gray-500">/월</span></p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>사이트 {limits.sites}개</li>
                <li>일 발행 {limits.postsPerDay}건</li>
                <li>AI 메시지 {limits.aiMessages}회/일</li>
                <li>초기 글 {limits.initialPosts}개</li>
                <li>{limits.searchEngine ? '검색엔진 등록 포함' : '검색엔진 등록 미포함'}</li>
              </ul>
              <button disabled={isCurrent} className={`w-full py-2 rounded-lg font-medium text-sm transition ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-primary text-white hover:bg-primary-600'}`}>{isCurrent ? '현재 플랜' : '업그레이드'}</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
