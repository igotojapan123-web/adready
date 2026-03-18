'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">ADready</h1>
        <p className="text-sm text-center text-gray-500 mb-8">로그인하고 사이트 자동화를 시작하세요</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => signIn('kakao', { callbackUrl: '/dashboard' })} className="w-full py-3 px-4 rounded-lg font-medium text-sm bg-[#FEE500] text-[#191919] hover:brightness-95 transition">카카오로 시작하기</button>
          <button onClick={() => signIn('naver', { callbackUrl: '/dashboard' })} className="w-full py-3 px-4 rounded-lg font-medium text-sm bg-[#03C75A] text-white hover:brightness-95 transition">네이버로 시작하기</button>
          <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className="w-full py-3 px-4 rounded-lg font-medium text-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition">Google로 시작하기</button>
        </div>
      </div>
    </div>
  )
}
