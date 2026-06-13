import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'relog_session'
const SESSION_MAX_AGE = 60 * 60 * 24

export async function getSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
    priority: 'high',
  }
}
