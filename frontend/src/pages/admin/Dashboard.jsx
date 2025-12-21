import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'https://biketi-backend.onrender.com';
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await axios.get(`${API_URL}/api/v1/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsResponse.data.stats);
      
      // Fetch submissions
      const submissionsResponse = await axios.get(`${API_URL}/api/v1/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(submissionsResponse.data);
      
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const updateSubmissionStatus = async (submissionId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/v1/admin/submissions/${submissionId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Status updated successfully');
      fetchDashboardData(); // Refresh data
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.username} ({user.role})</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.submissions.total}</dd>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="text-green-600 font-medium">New: {stats.submissions.new}</span>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600 font-medium">Reviewed: {stats.submissions.reviewed}</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Posts</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.posts.total}</dd>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="text-green-600 font-medium">Published: {stats.posts.published}</span>
                  <span className="mx-2">•</span>
                  <span className="text-yellow-600 font-medium">Drafts: {stats.posts.drafts}</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Courses</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.courses.total}</dd>
                <div className="mt-2 text-sm text-gray-600">
                  <span className="text-green-600 font-medium">Published: {stats.courses.published}</span>
                  <span className="mx-2">•</span>
                  <span className="text-yellow-600 font-medium">Drafts: {stats.courses.drafts}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Submissions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Service requests from customers</p>
          </div>
          
          {submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.service_slug || 'General'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${submission.status === 'new' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${submission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : ''}
                          ${submission.status === 'contacted' ? 'bg-green-100 text-green-800' : ''}
                          ${submission.status === 'archived' ? 'bg-gray-100 text-gray-800' : ''}
                        `}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={submission.status}
                          onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="contacted">Contacted</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No submissions yet
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
