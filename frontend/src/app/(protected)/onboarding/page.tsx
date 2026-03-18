'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = ['사이트 목적', '니치 선택', '도메인 설정']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [niche, setNiche] = useState('')
  const [purpose, setPurpose] = useState('')

  async function handleComplete() {
    await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ niche, purpose }) })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-gray-200">
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (<div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />))}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">{STEPS[step]}</h2>
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">어떤 목적으로 사이트를 운영하시나요?</p>
            {['블로그 수익화', '비즈니스 홍보', '포트폴리오', '기타'].map(p => (
              <button key={p} onClick={() => { setPurpose(p); setStep(1) }} className={`w-full p-3 text-left rounded-lg border text-sm ${purpose === p ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>{p}</button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">어떤 분야의 콘텐츠를 만드시겠어요?</p>
            {['건강/의료', '재테크/금융', '여행', 'IT/테크', '음식/요리', '교육', '기타'].map(n => (
              <button key={n} onClick={() => { setNiche(n); setStep(2) }} className={`w-full p-3 text-left rounded-lg border text-sm ${niche === n ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>{n}</button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">설정이 완료되었습니다. 대시보드로 이동합니다.</p>
            <button onClick={handleComplete} className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition">시작하기</button>
          </div>
        )}
      </div>
    </div>
  )
}
