import { createContext, useContext, useMemo, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('relog_user')
    return stored ? JSON.parse(stored) : null
  })

  const saveSession = (session) => {
    localStorage.setItem('relog_token', session.access_token)
    localStorage.setItem('relog_user', JSON.stringify(session.user))
    setUser(session.user)
  }

  const value = useMemo(() => ({
    user,
    async login(credentials) { saveSession(await authApi.login(credentials)) },
    async register(credentials) { saveSession(await authApi.register(credentials)) },
    logout() {
      localStorage.removeItem('relog_token')
      localStorage.removeItem('relog_user')
      setUser(null)
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

