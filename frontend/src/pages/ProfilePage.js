import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService, postService } from '../services';
import { useAuthStore } from '../store';
import FollowButton from '../components/FollowButton';
import EditProfile from '../components/EditProfile';
import Post from '../components/Post';
import { getDefaultAvatar } from '../utils/defaultAvatar';

const ProfilePage = () => {
  const { userId } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile(userId);
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await postService.getUserPosts(userId);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">Profile not found</p>
      </div>
    );
  }

  const mediaPosts = posts.filter(post => post.images && post.images.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card-premium p-8 mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-6 flex-1">
            <div className="relative">
              <img
                src={profile.profileImage || getDefaultAvatar(profile.username, profile.name)}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-purple-100 shadow-lg"
                onError={(e) => {
                  e.target.src = getDefaultAvatar(profile.username, profile.name);
                }}
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-500 text-lg">@{profile.username}</p>
              
              {profile.bio && (
                <p className="mt-3 text-gray-700 leading-relaxed">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                {profile.location && (
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div>
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 border-2 border-purple-200 rounded-xl text-purple-600 font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              >
                Edit Profile
              </button>
            ) : (
              <FollowButton
                userId={userId}
                initialIsFollowing={profile.isFollowing}
                onFollowChange={(following) => {
                  setProfile((prev) => ({ ...prev, isFollowing: following }));
                }}
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex space-x-8 mt-8 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {posts.length}
            </p>
            <p className="text-gray-600 text-sm font-medium mt-1">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {profile.followers?.length || 0}
            </p>
            <p className="text-gray-600 text-sm font-medium mt-1">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {profile.following?.length || 0}
            </p>
            <p className="text-gray-600 text-sm font-medium mt-1">Following</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-premium mb-6 animate-slide-up">
        <div className="flex p-2 bg-gray-50 rounded-t-2xl">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-center font-semibold rounded-xl transition-all duration-200 ${
              activeTab === 'posts'
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">📝</span>
            Posts
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 text-center font-semibold rounded-xl transition-all duration-200 ${
              activeTab === 'media'
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">🖼️</span>
            Media
          </button>
        </div>

        <div className="p-6">
          {postsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600 mb-3"></div>
              <p className="text-gray-600 font-medium">Loading {activeTab}...</p>
            </div>
          ) : activeTab === 'posts' ? (
            posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No posts yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  {isOwnProfile ? 'Share your first post!' : 'This user hasn\'t posted anything yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Post key={post._id} post={post} onDelete={handlePostDeleted} />
                ))}
              </div>
            )
          ) : (
            mediaPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No media yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  {isOwnProfile ? 'Share photos to see them here' : 'This user hasn\'t shared any media yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaPosts.map((post) =>
                  post.images.map((image, index) => (
                    <div key={`${post._id}-${index}`} className="aspect-square rounded-xl overflow-hidden group cursor-pointer">
                      <img
                        src={image}
                        alt="Media"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfile
          user={profile}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedUser) => setProfile(updatedUser)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
