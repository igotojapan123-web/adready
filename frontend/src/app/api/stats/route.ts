import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
  }

  const userId = session.user.id

  const [
    totalSites,
    activeSites,
    totalPosts,
    publishedPosts,
    failedPosts,
    todayPosts,
    recentPosts,
    sites,
  ] = await Promise.all([
    prisma.site.count({ where: { userId } }),
    prisma.site.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.post.count({ where: { userId } }),
    prisma.post.count({ where: { userId, status: 'PUBLISHED' } }),
    prisma.post.count({ where: { userId, status: 'FAILED' } }),
    prisma.post.count({
      where: {
        userId,
        status: 'PUBLISHED',
        publishedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.post.findMany({
      where:   { userId, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take:    5,
      select: {
        id:          true,
        title:       true,
        keyword:     true,
        seoScore:    true,
        publishedAt: true,
        permalink:   true,
        site: { select: { name: true, slug: true } },
      },
    }),
    prisma.site.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take:    20,
      select: {
        id:          true,
        name:        true,
        slug:        true,
        status:      true,
        installStep: true,
        createdAt:   true,
        _count: { select: { posts: { where: { status: 'PUBLISHED' } } } },
      },
    }),
  ])

  return NextResponse.json({
    stats: {
      totalSites,
      activeSites,
      totalPosts,
      publishedPosts,
      failedPosts,
      todayPosts,
    },
    recentPosts,
    sites,
  })
}
