'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ErrorNotice } from '@/components/PageState'

export default function LoginForm() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch(`/api/session/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || '인증에 실패했습니다.')
      router.replace('/relationship-dashboard')
      router.refresh()
    } catch (err) {
      setError(err.message || '인증에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
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
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>로그인</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>회원가입</button>
        </div>
        <h2>{mode === 'login' ? '다시 만나서 반가워요' : '새 기록을 시작해요'}</h2>
        <p className="muted">세션은 브라우저 JavaScript에서 읽을 수 없는 보안 쿠키에 저장됩니다.</p>
        <ErrorNotice message={error} />
        <form onSubmit={submit} className="form-stack">
          <label>아이디<input required minLength="3" autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="3자 이상" /></label>
          <label>비밀번호<input required minLength="8" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="8자 이상" /></label>
          <button className="primary-button wide" disabled={submitting}>{submitting ? '처리 중...' : mode === 'login' ? '로그인' : '계정 만들기'}</button>
        </form>
      </section>
    </div>
  )
}
