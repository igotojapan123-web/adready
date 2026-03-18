import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">ADready</h1>
        <nav className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">로그인</Link>
          <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600">시작하기</Link>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">AI로 워드프레스 사이트를<br />자동으로 운영하세요</h2>
        <p className="text-xl text-gray-500 mb-12">사이트 생성부터 SEO 최적화 콘텐츠 발행까지,<br />ADready가 모든 것을 자동화합니다.</p>
        <Link href="/login" className="inline-block px-8 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary-600 transition">무료로 시작하기</Link>
        <div className="grid grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">원클릭 사이트 생성</h3>
            <p className="text-sm text-gray-500">도메인, 호스팅, SSL 인증서까지 자동 설정됩니다.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI 콘텐츠 발행</h3>
            <p className="text-sm text-gray-500">키워드 기반 SEO 최적화 글을 자동으로 작성합니다.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">수익화 자동 설정</h3>
            <p className="text-sm text-gray-500">쿠팡 파트너스, 애드센스 등 수익화 플러그인을 자동 설치합니다.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
