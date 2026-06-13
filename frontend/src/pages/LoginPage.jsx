import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { ErrorNotice } from '../components/PageState'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  if (user) return <Navigate to="/relationship-dashboard" replace />

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true); setError('')
    try {
      await (mode === 'login' ? login(form) : register(form))
      navigate(location.state?.from?.pathname || '/relationship-dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally { setSubmitting(false) }
  }

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <div className="brand-mark large">R</div>
        <p className="eyebrow">RELATIONSHIP JOURNAL</p>
        <h1>기억은 흐려져도,<br />기록은 관계의 맥락을 남깁니다.</h1>
        <p>사건과 감정을 차분히 기록하고 시간에 따른 관계의 변화를 확인하세요.</p>
      </section>
      <section className="auth-card">
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>로그인</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>회원가입</button>
        </div>
        <h2>{mode === 'login' ? '다시 만나서 반가워요' : '새 기록을 시작해요'}</h2>
        <p className="muted">아이디와 비밀번호로 안전하게 시작합니다.</p>
        <ErrorNotice message={error} />
        <form onSubmit={submit} className="form-stack">
          <label>아이디<input required minLength="3" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="3자 이상" /></label>
          <label>비밀번호<input required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8자 이상" /></label>
          <button className="primary-button wide" disabled={submitting}>{submitting ? '처리 중...' : mode === 'login' ? '로그인' : '계정 만들기'}</button>
        </form>
      </section>
    </div>
  )
}

