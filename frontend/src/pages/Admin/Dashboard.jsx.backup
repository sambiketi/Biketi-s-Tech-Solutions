import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminApi } from '../../api'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentSubmissions, setRecentSubmissions] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [statsRes, submissionsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getSubmissions({ limit: 5 })
      ])
      
      setStats(statsRes.data.stats)
      setRecentSubmissions(submissionsRes.data.slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, description, color = 'blue' }) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
    }
    
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${colors[color].bg}`}>
              <span className={`text-xl ${colors[color].text}`}>{icon}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {title}
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {value}
                </dd>
                {description && (
                  <dd className="text-sm text-gray-500 mt-1">
                    {description}
                  </dd>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
      reviewed: { color: 'bg-yellow-100 text-yellow-800', label: 'Reviewed' },
      contacted: { color: 'bg-green-100 text-green-800', label: 'Contacted' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archived' }
    }
    
    const config = statusConfig[status] || statusConfig.new
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-semibold">{user?.username}</span>!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Submissions"
            value={stats?.submissions?.total || 0}
            icon="📥"
            description={`${stats?.submissions?.new || 0} new`}
            color="blue"
          />
          <StatCard
            title="Blog Posts"
            value={stats?.posts?.total || 0}
            icon="📝"
            description={`${stats?.posts?.published || 0} published`}
            color="green"
          />
          <StatCard
            title="Courses"
            value={stats?.courses?.total || 0}
            icon="🎓"
            description={`${stats?.courses?.published || 0} published`}
            color="purple"
          />
          <StatCard
            title="Conversion Rate"
            value={`${Math.round((stats?.submissions?.contacted || 0) / (stats?.submissions?.total || 1) * 100)}%`}
            icon="📈"
            description="Contacted submissions"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Recent Submissions
                </h3>
                <Link 
                  to="/admin/submissions"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {recentSubmissions.length > 0 ? (
                <div className="flow-root">
                  <ul className="-my-5 divide-y divide-gray-200">
                    {recentSubmissions.map((submission) => (
                      <li key={submission.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {submission.full_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {submission.email}
                            </p>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {submission.service_slug || 'General Inquiry'}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(submission.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(submission.status)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📭</div>
                  <h3 className="text-sm font-medium text-gray-900">No submissions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    New client inquiries will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/admin/submissions"
                    className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <span className="mr-2">📨</span>
                    View Submissions
                  </Link>
                  <Link
                    to="/admin/blog"
                    className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <span className="mr-2">📝</span>
                    Manage Blog
                  </Link>
                  <Link
                    to="/admin/courses"
                    className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <span className="mr-2">🎓</span>
                    Manage Courses
                  </Link>
                  <Link
                    to="/admin/services"
                    className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                  >
                    <span className="mr-2">⚙️</span>
                    Manage Services
                  </Link>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  System Status
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Backend API</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Connected
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">User Role</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-900">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
