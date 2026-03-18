import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                     request.nextUrl.pathname.startsWith("/register")

  // 보호된 경로 목록
  const protectedPaths = [
    "/dashboard",
    "/onboarding",
    "/sites",
    "/posts",
    "/keyword",
    "/billing",
    "/settings",
  ]

  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // 로그인 안 된 유저가 보호된 경로 접근 시 → 로그인 페이지로
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 로그인된 유저가 인증 페이지 접근 시 → 대시보드로
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/sites/:path*",
    "/posts/:path*",
    "/keyword/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
}
