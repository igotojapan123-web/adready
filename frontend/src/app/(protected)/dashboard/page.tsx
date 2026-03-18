import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatCard from '@/components/dashboard/StatCard'
import PostTable from '@/components/dashboard/PostTable'
import SiteCard from '@/components/dashboard/SiteCard'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const userPlan = (session.user as { plan?: string }).plan ?? 'STARTER'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [totalSites, activeSites, publishedPosts, todayPosts, recentPosts, sites] =
    await Promise.all([
      prisma.site.count({ where: { userId } }),
      prisma.site.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.post.count({ where: { userId, status: 'PUBLISHED' } }),
      prisma.post.count({
        where: { userId, status: 'PUBLISHED', publishedAt: { gte: todayStart } },
      }),
      prisma.post.findMany({
        where:   { userId, status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        take:    5,
        select: {
          id: true, title: true, keyword: true, seoScore: true,
          publishedAt: true, permalink: true,
          site: { select: { name: true, slug: true } },
        },
      }),
      prisma.site.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        take:    3,
        select: {
          id: true, name: true, slug: true, status: true,
          installStep: true, createdAt: true,
          _count: { select: { posts: { where: { status: 'PUBLISHED' } } } },
        },
      }),
    ])

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
          {session.user.name ?? '사용자'}님, 환영합니다
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', marginTop: '6px' }}>
          ADready 대시보드에 오신 것을 환영합니다.
        </p>
      </div>

      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap:                 '16px',
        marginBottom:        '40px',
      }}>
        <Link href="/billing" style={{ textDecoration: 'none' }}>
          <StatCard
            label="현재 플랜"
            value={userPlan}
            icon="*"
            color={userPlan === 'STARTER' ? 'gray' : 'green'}
            sub="플랜 변경 >"
          />
        </Link>
        <StatCard label="전체 사이트" value={totalSites} icon="O" sub={'활성 ' + activeSites + '개'} />
        <StatCard label="발행된 글" value={publishedPosts} icon="#" />
        <StatCard label="오늘 발행" value={todayPosts} icon=">" color={todayPosts > 0 ? 'green' : 'gray'} />
      </div>

      {sites.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>내 사이트</h2>
            <a href="/sites" style={{ fontSize: '14px', color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
              전체 보기
            </a>
          </div>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap:                 '16px',
          }}>
            {sites.map(site => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>최근 발행 글</h2>
          <a href="/posts" style={{ fontSize: '14px', color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
            전체 보기
          </a>
        </div>
        <div style={{
          background: '#ffffff', borderRadius: '12px',
          border: '1px solid #e5e7eb', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <PostTable posts={recentPosts} />
        </div>
      </section>
    </div>
  )
}
