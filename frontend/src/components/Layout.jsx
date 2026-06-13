import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const signOut = () => { logout(); navigate('/login') }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">R</div>
          <h1>Relog</h1>
          <p className="muted">관계를 기록하고 흐름을 읽는 공간</p>
        </div>
        <nav>
          <NavLink to="/relationship-dashboard">대시보드</NavLink>
          <NavLink to="/relationships">관계 목록</NavLink>
          <NavLink to="/relationships/new">새 관계 등록</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span>{user?.username}</span>
          <button className="text-button" onClick={signOut}>로그아웃</button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  )
}

