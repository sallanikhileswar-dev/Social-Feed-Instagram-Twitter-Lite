import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useNotificationStore } from '../store';
import { authService } from '../services';
import socketService from '../utils/socket';
import { getDefaultAvatar } from '../utils/defaultAvatar';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Disconnect socket
      socketService.disconnect();
      // Clear auth state
      logout();
      // Navigate to login
      navigate('/login');
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.profile-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="glass sticky top-0 z-40 border-b border-white/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-200">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                SocialApp
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-2">
              <Link
                to="/"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-white/50 transition-all duration-200"
              >
                Home
              </Link>
              <Link
                to="/explore"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-white/50 transition-all duration-200"
              >
                Explore
              </Link>
              <Link
                to="/trending"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-white/50 transition-all duration-200"
              >
                Trending
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/search"
              className="p-2.5 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-white/50 transition-all duration-200 text-xl"
              title="Search"
            >
              🔍
            </Link>
            
            <Link
              to="/messages"
              className="p-2.5 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-white/50 transition-all duration-200 text-xl"
              title="Messages"
            >
              💬
            </Link>
            
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-white/50 transition-all duration-200 text-xl"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {user?.isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Admin
              </Link>
            )}

            <div className="relative profile-dropdown">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:ring-4 hover:ring-purple-100 transition-all duration-200"
              >
                <div className="relative">
                  <img
                    src={user?.profileImage || getDefaultAvatar(user?.username, user?.name)}
                    alt={user?.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl py-2 z-50 animate-scale-in border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                  </div>
                  <Link
                    to={`/profile/${user?._id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-200"
                  >
                    <span className="mr-3 text-lg">👤</span>
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-2xl"
                  >
                    <span className="mr-3 text-lg">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
