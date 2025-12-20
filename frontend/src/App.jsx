import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/Admin/ProtectedRoute'

// Public Pages
import Home from './pages/Public/Home'

// Admin Pages
import Login from './pages/Admin/Login'
import Dashboard from './pages/Admin/Dashboard'
import Submissions from './pages/Admin/Submissions'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<div className="min-h-screen p-8">Services Page - Coming Soon</div>} />
          <Route path="/services/:slug" element={<div className="min-h-screen p-8">Service Detail Page - Coming Soon</div>} />
          <Route path="/blog" element={<div className="min-h-screen p-8">Blog Page - Coming Soon</div>} />
          <Route path="/courses" element={<div className="min-h-screen p-8">Courses Page - Coming Soon</div>} />
          <Route path="/contact" element={<div className="min-h-screen p-8">Contact Page - Coming Soon</div>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/submissions" 
            element={
              <ProtectedRoute>
                <Submissions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/blog" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen p-8">Blog Manager - Coming Soon</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/courses" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen p-8">Course Manager - Coming Soon</div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/services" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen p-8">Service Manager - Coming Soon</div>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
