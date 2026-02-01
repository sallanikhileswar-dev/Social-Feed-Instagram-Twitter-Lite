import { useState, useEffect } from 'react';
import { searchService } from '../services';
import UserCard from '../components/UserCard';
import Post from '../components/Post';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setUsers([]);
      setPosts([]);
    }
  }, [query, activeTab]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await searchService.searchUsers(query);
        setUsers(response.data.users);
      } else {
        const response = await searchService.searchPosts(query);
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Search
        </h1>
        <p className="text-gray-600">Discover people and content</p>
      </div>

      {/* Search Input */}
      <div className="mb-8 animate-slide-up">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for users or posts..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none transition-all duration-200 text-base shadow-sm"
          />
          <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 p-1 bg-gray-100 rounded-2xl animate-slide-up">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-white text-purple-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="mr-2">👥</span>
          Users
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 px-6 font-semibold rounded-xl transition-all duration-200 ${
            activeTab === 'posts'
              ? 'bg-white text-purple-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="mr-2">📝</span>
          Posts
        </button>
      </div>

      {/* Results */}
      <div className="animate-fade-in">
        {!query.trim() ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium text-lg">Start searching</p>
            <p className="text-gray-400 text-sm mt-2">Enter a query to find users or posts</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Searching...</p>
          </div>
        ) : activeTab === 'users' ? (
          users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <UserCard key={user._id} user={user} showFollowButton />
              ))}
            </div>
          )
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No posts found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          posts.map((post) => <Post key={post._id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default SearchPage;
