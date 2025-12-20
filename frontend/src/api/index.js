import axios from 'axios'

// For Codespaces/GitHub, we need to handle dynamic URLs
const getApiBaseUrl = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
  }
  // For production, use environment variable
  return import.meta.env.VITE_API_URL || '/api/v1'
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    })
    
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Network error - backend may be down')
    }
    
    return Promise.reject(error)
  }
)

// Public API calls
export const publicApi = {
  getHealth: () => api.get('/health'),
  getServices: () => api.get('/services'),
  getService: (slug) => api.get(`/services/${slug}`),
  submitService: (slug, data) => api.post(`/services/${slug}/submit`, data),
  getBlogPosts: () => api.get('/posts'),
  getCourses: () => api.get('/courses'),
}

// Admin API calls (require authentication)
export const adminApi = {
  login: (username, password) => api.post('/admin/login', { username, password }),
  verifyToken: () => api.post('/admin/verify-token'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSubmissions: (params) => api.get('/admin/submissions', { params }),
  updateSubmission: (id, data) => api.put(`/admin/submissions/${id}`, data),
  getPosts: () => api.get('/admin/posts'),
  createPost: (data) => api.post('/admin/posts', data),
  updatePost: (id, data) => api.put(`/admin/posts/${id}`, data),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
}

export default api
