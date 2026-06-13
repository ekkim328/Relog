import { NextResponse } from 'next/server'
import { backendRequest, readBackendPayload } from '@/lib/backend'
import { isSameOriginRequest } from '@/lib/security'
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

export async function createSession(request, endpoint) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ detail: '허용되지 않은 요청 출처입니다.' }, { status: 403 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 10_000) {
    return NextResponse.json({ detail: '요청 본문이 너무 큽니다.' }, { status: 413 })
  }

  let credentials
  try {
    credentials = await request.json()
  } catch {
    return NextResponse.json({ detail: '요청 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  const username = typeof credentials.username === 'string' ? credentials.username.trim() : ''
  const password = typeof credentials.password === 'string' ? credentials.password : ''
  if (username.length < 3 || password.length < 8) {
    return NextResponse.json({ detail: '아이디는 3자 이상, 비밀번호는 8자 이상이어야 합니다.' }, { status: 422 })
  }

  let backendResponse
  try {
    backendResponse = await backendRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    return NextResponse.json({ detail: '인증 서버에 연결할 수 없습니다.' }, { status: 502 })
  }
  const payload = await readBackendPayload(backendResponse)
  if (!backendResponse.ok) {
    return NextResponse.json(payload || { detail: '인증에 실패했습니다.' }, { status: backendResponse.status })
  }

  const response = NextResponse.json({ user: payload.user }, { status: backendResponse.status })
  response.cookies.set(SESSION_COOKIE, payload.access_token, sessionCookieOptions())
  return response
}
