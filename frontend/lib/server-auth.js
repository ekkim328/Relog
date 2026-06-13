import { redirect } from 'next/navigation'
import { backendRequest, readBackendPayload } from '@/lib/backend'
import { getSessionToken } from '@/lib/session'

export async function getCurrentUser() {
  const token = await getSessionToken()
  if (!token) return null
  try {
    const response = await backendRequest('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return null
    return readBackendPayload(response)
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}
