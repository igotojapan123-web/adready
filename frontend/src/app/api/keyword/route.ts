import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })

  const { query } = await req.json()
  if (!query) return NextResponse.json({ error: '키워드를 입력하세요' }, { status: 400 })

  // TODO: 실제 키워드 API 연동 (네이버 검색광고 API 등)
  const keywords = [
    { keyword: query, volume: Math.floor(Math.random() * 10000), difficulty: '보통' },
    { keyword: `${query} 추천`, volume: Math.floor(Math.random() * 5000), difficulty: '낮음' },
    { keyword: `${query} 비교`, volume: Math.floor(Math.random() * 3000), difficulty: '높음' },
    { keyword: `${query} 후기`, volume: Math.floor(Math.random() * 8000), difficulty: '낮음' },
    { keyword: `${query} 가격`, volume: Math.floor(Math.random() * 6000), difficulty: '보통' },
  ]

  return NextResponse.json({ keywords })
}
