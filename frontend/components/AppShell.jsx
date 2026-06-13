'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const links = [
  ['/relationship-dashboard', '대시보드'],
  ['/relationships', '관계 목록'],
  ['/relationships/new', '새 관계 등록'],
]

export default function AppShell({ user, children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    setLoggingOut(true)
    await fetch('/api/session/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">R</div>
          <h1>Relog</h1>
          <p className="muted">관계를 기록하고 흐름을 읽는 공간</p>
        </div>
        <nav>
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={pathname === href ? 'active' : ''}>{label}</Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>{user.username}</span>
          <button className="text-button" onClick={logout} disabled={loggingOut}>
            {loggingOut ? '로그아웃 중' : '로그아웃'}
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
