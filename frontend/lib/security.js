const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function isSameOriginRequest(request) {
  if (SAFE_METHODS.has(request.method)) return true
  const origin = request.headers.get('origin')
  if (!origin) return false
  return origin === new URL(request.url).origin
}
