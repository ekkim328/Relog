import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('relog_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('relog_token')
      localStorage.removeItem('relog_user')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export const errorMessage = (error) => {
  const detail = error.response?.data?.detail
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(', ')
  return detail || error.message || '요청 처리 중 오류가 발생했습니다.'
}

export default client

