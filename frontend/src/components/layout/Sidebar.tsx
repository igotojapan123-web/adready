'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV_ITEMS = [
  { href: '/dashboard', label: '대시보드', icon: '📊' },
  { href: '/sites', label: '사이트', icon: '🌐' },
  { href: '/posts', label: '글 관리', icon: '📝' },
  { href: '/keyword', label: '키워드', icon: '🔍' },
  { href: '/billing', label: '플랜/결제', icon: '💳' },
  { href: '/settings', label: '설정', icon: '⚙️' },
]

interface SidebarProps {
  user: { name?: string | null; email: string; plan: string }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">ADready</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{(user.name ?? 'U')[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name ?? user.email}</p>
            <p className="text-xs text-gray-500">{user.plan}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition">로그아웃</button>
      </div>
    </aside>
  )
}
