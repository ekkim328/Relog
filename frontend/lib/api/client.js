export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function apiRequest(path, options = {}) {
  const { headers: optionHeaders, ...requestOptions } = options
  const response = await fetch(`/api/backend${path}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...optionHeaders,
    },
    ...requestOptions,
  })

  if (response.status === 401) {
    window.location.assign('/login')
    throw new ApiError('로그인이 필요합니다.', 401)
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    const detail = payload?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail || '요청 처리 중 오류가 발생했습니다.'
    throw new ApiError(message, response.status)
  }
  return payload
}

export const errorMessage = (error) => error?.message || '요청 처리 중 오류가 발생했습니다.'
