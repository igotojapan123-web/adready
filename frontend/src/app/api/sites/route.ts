import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canCreateSite } from '@/lib/plan-limits'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { posts: { where: { status: 'PUBLISHED' } } } } },
  })
  return NextResponse.json({ sites })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { name, slug, plugin } = await req.json()
  if (!name || !slug) return NextResponse.json({ error: '이름과 슬러그를 입력하세요' }, { status: 400 })

  const userPlan = (session.user as { plan?: string }).plan
  const allowed = await canCreateSite(session.user.id, userPlan)
  if (!allowed) return NextResponse.json({ error: '플랜 사이트 한도 초과' }, { status: 403 })

  const existing = await prisma.site.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: '이미 사용 중인 슬러그입니다' }, { status: 409 })

  const site = await prisma.site.create({
    data: { name, slug, plugin: plugin || 'coupang', userId: session.user.id, status: 'PENDING' },
  })

  return NextResponse.json({ id: site.id }, { status: 201 })
}
