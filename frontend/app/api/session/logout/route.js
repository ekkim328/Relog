import { NextResponse } from 'next/server'
import { isSameOriginRequest } from '@/lib/security'
import { SESSION_COOKIE } from '@/lib/session'

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ detail: '허용되지 않은 요청 출처입니다.' }, { status: 403 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
