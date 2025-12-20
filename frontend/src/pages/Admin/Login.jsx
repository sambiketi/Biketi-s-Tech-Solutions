import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { user, login, error: authError } = useAuth()
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin123'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    if (user) {
      navigate('/admin')
    }
  }, [user, navigate])

  useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/health')
      if (response.ok) {
        setBackendStatus('connected')
      } else {
        setBackendStatus('error')
      }
    } catch (error) {
      setBackendStatus('error')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setLocalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setLocalError('')
    
    if (!formData.username || !formData.password) {
      setLocalError('Please enter both username and password')
      setIsLoading(false)
      return
    }
    
    const result = await login(formData.username, formData.password)
    
    if (!result.success) {
      setLocalError(result.error)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-blue-600 font-bold text-xl">A</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Agency Platform Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your agency platform
          </p>
          
          {/* Backend status */}
          <div className={`mt-4 p-3 text-center text-sm rounded-md ${
            backendStatus === 'connected' ? 'bg-green-100 text-green-800' :
            backendStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {backendStatus === 'connected' && '✓ Backend connected'}
            {backendStatus === 'checking' && 'Checking backend connection...'}
            {backendStatus === 'error' && (
              <div>
                ✗ Backend not reachable
                <p className="text-xs mt-1">Make sure backend is running on port 5000</p>
              </div>
            )}
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter username"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter password"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error messages */}
          {(localError || authError) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {localError || authError}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || backendStatus !== 'connected'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  </span>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p className="font-medium">Demo credentials:</p>
            <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
              username: admin | password: admin123
            </p>
            <p className="mt-2 text-xs">
              Need to initialize data? Run:<br/>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                curl -X POST http://localhost:5000/api/v1/init-demo
              </code>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
