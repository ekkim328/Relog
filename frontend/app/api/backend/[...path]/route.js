import { NextResponse } from 'next/server'
import { backendUrl, readBackendPayload } from '@/lib/backend'
import { isSameOriginRequest } from '@/lib/security'
import { getSessionToken, SESSION_COOKIE } from '@/lib/session'

const ALLOWED_ROOTS = new Set(['relationships', 'logs', 'emotion-tags', 'dashboard', 'ai-reports'])

async function proxy(request, context) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ detail: '허용되지 않은 요청 출처입니다.' }, { status: 403 })
  }

  const token = await getSessionToken()
  if (!token) return NextResponse.json({ detail: '로그인이 필요합니다.' }, { status: 401 })

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 1_000_000) {
    return NextResponse.json({ detail: '요청 본문이 너무 큽니다.' }, { status: 413 })
  }

  const { path = [] } = await context.params
  if (!path.length || !ALLOWED_ROOTS.has(path[0])) {
    return NextResponse.json({ detail: '허용되지 않은 API 경로입니다.' }, { status: 404 })
  }

  const target = backendUrl(`/${path.map(encodeURIComponent).join('/')}`)
  target.search = new URL(request.url).search
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: request.headers.get('accept') || 'application/json',
  }
  const contentType = request.headers.get('content-type')
  if (contentType) headers['Content-Type'] = contentType

  const options = { method: request.method, headers, cache: 'no-store' }
  if (!['GET', 'HEAD'].includes(request.method)) options.body = await request.arrayBuffer()

  let backendResponse
  try {
    backendResponse = await fetch(target, options)
  } catch {
    return NextResponse.json({ detail: '백엔드 API에 연결할 수 없습니다.' }, { status: 502 })
  }
  const payload = await readBackendPayload(backendResponse)
  const response = payload === null
    ? new NextResponse(null, { status: backendResponse.status })
    : NextResponse.json(payload, { status: backendResponse.status })

  if (backendResponse.status === 401) {
    response.cookies.set(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  }
  return response
}

export const GET = proxy
export const POST = proxy
export const PATCH = proxy
export const PUT = proxy
export const DELETE = proxy
