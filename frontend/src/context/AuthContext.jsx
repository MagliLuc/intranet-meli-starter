import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    let ignore = false
    async function fetchMe() {
      if (!token) return
      setLoading(true)
      try {
        const { data } = await api.get('/auth/me')
        if (!ignore) setUser(data.user)
      } catch {
        if (!ignore) {
          setUser(null); setToken(''); localStorage.removeItem('token')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchMe()
    return () => { ignore = true }
  }, [token])

  function login(nextToken) {
    localStorage.setItem('token', nextToken)
    setToken(nextToken)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null); setToken('')
  }

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
