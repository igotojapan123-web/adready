import { prisma } from "./prisma"

export const PLAN_LIMITS = {
  STARTER: { aiMessages: 30, postsPerDay: 1, sites: 1, initialPosts: 10, searchEngine: false },
  PRO: { aiMessages: 100, postsPerDay: 2, sites: 3, initialPosts: 20, searchEngine: true },
  BUSINESS: { aiMessages: 300, postsPerDay: 3, sites: 10, initialPosts: 30, searchEngine: true },
} as const

type PlanKey = keyof typeof PLAN_LIMITS

// 하위 호환성을 위한 별도 export
export const DAILY_POST_LIMITS: Record<string, number> = {
  free: 0,
  STARTER: 1,
  starter: 1,
  PRO: 2,
  pro: 2,
  BUSINESS: 3,
  business: 3,
}

function getPlanKey(plan: string | null | undefined): PlanKey {
  const p = (plan || 'STARTER').toUpperCase()
  if (p === 'STARTER' || p === 'PRO' || p === 'BUSINESS') {
    return p as PlanKey
  }
  return 'STARTER'
}

// 사이트 추가 가능 여부 체크
export async function canCreateSite(userId: string, plan: string | null | undefined): Promise<boolean> {
  const planKey = getPlanKey(plan)
  const count = await prisma.site.count({
    where: { userId, deletedAt: null },
  })
  return count < PLAN_LIMITS[planKey].sites
}

// 오늘 AI 메시지 사용량 체크
export async function checkAiMessageLimit(
  userId: string,
  plan: string | null | undefined
): Promise<{
  allowed: boolean
  used: number
  limit: number
}> {
  const planKey = getPlanKey(plan)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const used = await prisma.onboardingMessage.count({
    where: {
      userId,
      role: "user",
      createdAt: { gte: today },
    },
  })

  const limit = PLAN_LIMITS[planKey].aiMessages
  return { allowed: used < limit, used, limit }
}

// 오늘 자동발행 횟수 체크 (기존 함수)
export async function checkDailyPostLimit(siteId: string, plan: string | null | undefined): Promise<boolean> {
  const planKey = getPlanKey(plan)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const count = await prisma.post.count({
    where: {
      siteId,
      publishedAt: { gte: today },
      status: "PUBLISHED",
    },
  })
  return count < PLAN_LIMITS[planKey].postsPerDay
}

// 확장된 발행 한도 체크 함수
export async function checkDailyPostLimitExtended(
  userId: string,
  plan: string | null | undefined,
  siteId: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const planKey = getPlanKey(plan)
  const maxPosts = PLAN_LIMITS[planKey].postsPerDay

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const used = await prisma.post.count({
    where: {
      userId,
      siteId,
      status: 'PUBLISHED',
      publishedAt: { gte: todayStart },
    },
  })

  return { allowed: used < maxPosts, used, limit: maxPosts }
}
