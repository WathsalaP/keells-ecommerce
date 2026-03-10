import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'
import { useNotification } from './NotificationContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showNotification } = useNotification()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (e) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = (data) => {
    localStorage.setItem('token', data.token)
    const u = { email: data.email, fullName: data.fullName, role: data.role, userId: data.userId }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    showNotification('Logged in successfully! 🎉', 'success')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    showNotification('Logged out successfully', 'success')
  }

  // ✅ expose token for ai-service calls
  const getToken = () => localStorage.getItem('token')

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}