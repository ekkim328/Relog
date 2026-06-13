const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000'

export function backendUrl(pathname) {
  return new URL(pathname, BACKEND_API_URL)
}

export async function backendRequest(pathname, options = {}) {
  return fetch(backendUrl(pathname), { cache: 'no-store', ...options })
}

export async function readBackendPayload(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  const text = await response.text()
  return text ? { detail: text } : null
}
