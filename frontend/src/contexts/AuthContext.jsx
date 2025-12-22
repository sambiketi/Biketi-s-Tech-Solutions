import { createContext, useState, useContext, useEffect } from 'react'
import { adminApi } from '../api'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    
    if (token) {
      const verify = async () => {
        try {
          console.log('Verifying token:', token)
          const response = await adminApi.verifyToken(token)
          setUser(response.data.user)
          setError('')
        } catch (err) {
          console.error('Token verification failed:', err)
          localStorage.removeItem('admin_token')
          setUser(null)
          setError('Session expired. Please login again.')
        } finally {
          setLoading(false)
        }
      }

      verify().catch(err => {
        console.error('Unexpected error verifying token:', err)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    setError('')
    try {
      const response = await adminApi.login(username, password)
      const { token, user } = response.data

      localStorage.setItem('admin_token', token)
      setUser(user)
      return { success: true, user }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please check your credentials.'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
    window.location.href = '/admin/login'
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isEditor: user?.role === 'editor' || user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
