import React, { useState, useEffect } from 'react';
import { adminService } from '../services';
import { useAuthStore } from '../store';
import { Navigate } from 'react-router-dom';

const AdminPage = () => {
  const user = useAuthStore((state) => state.user);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user?.isAdmin) {
      fetchStats();
      fetchLogs();
      fetchUsers();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await adminService.getAdminLogs();
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 px-4 font-medium ${
            activeTab === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 font-medium ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 font-medium ${
            activeTab === 'logs'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Activity Logs
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Statistics Cards */}
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Posts</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalPosts || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Active Today</p>
                <p className="text-3xl font-bold text-purple-600">{stats.activeToday || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">New This Week</p>
                <p className="text-3xl font-bold text-orange-600">{stats.newThisWeek || 0}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <p className="text-center text-gray-500">Loading statistics...</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Moderation Tools</h2>
            <p className="text-gray-600 mb-4">
              Use the moderation tools throughout the app to manage content and users.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">User Management</h3>
                <p className="text-sm text-gray-600">View and manage all users, delete accounts</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Content Moderation</h3>
                <p className="text-sm text-gray-600">Delete posts, manage reports</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">All Users ({users.length})</h2>
          </div>
          <div className="divide-y">
            {users.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No users found</div>
            ) : (
              users.map((u) => (
                <div key={u._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.profileImage || '/default-avatar.png'}
                      alt={u.username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-gray-500">@{u.username}</p>
                      <p className="text-xs text-gray-400">
                        Joined: {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-600">
                        {u.followers?.length || 0} followers
                      </p>
                      <p className="text-gray-600">
                        {u.following?.length || 0} following
                      </p>
                    </div>
                    {u._id !== user._id && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Admin Action Logs</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No admin actions yet</div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {log.action.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        By: {log.admin?.username || 'Unknown'} | Target: {log.targetType} ({log.targetId})
                      </p>
                      {log.reason && (
                        <p className="text-sm text-gray-500 mt-1">
                          Reason: {log.reason}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
