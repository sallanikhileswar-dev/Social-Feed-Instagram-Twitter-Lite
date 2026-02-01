import { useState } from 'react';
import { postService } from '../services';
import { useAuthStore } from '../store';
import { getDefaultAvatar } from '../utils/defaultAvatar';

const CreatePost = ({ onPostCreated }) => {
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image) {
      setError('Please add some content or an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageBase64 = null;
      if (image) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        });
      }

      const postData = {
        content: content.trim(),
        ...(imageBase64 && { images: [imageBase64] }),
      };

      const response = await postService.createPost(postData);
      
      if (onPostCreated) {
        onPostCreated(response.data.post);
      }

      setContent('');
      setImage(null);
      setPreview('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-premium p-6 mb-6 animate-fade-in">
      <div className="flex items-start space-x-4">
        <img
          src={user?.profileImage || getDefaultAvatar(user?.username, user?.name)}
          alt={user?.username}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
          onError={(e) => {
            e.target.src = getDefaultAvatar(user?.username, user?.name);
          }}
        />
        
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none transition-all duration-200 resize-none bg-gray-50 hover:bg-white"
            rows="3"
          />

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-800 font-medium">⚠️ {error}</p>
            </div>
          )}

          {preview && (
            <div className="mt-4 relative rounded-xl overflow-hidden group">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer p-2.5 rounded-xl text-purple-600 hover:bg-purple-50 transition-all duration-200 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </label>
              
              <button
                type="button"
                className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                title="Add emoji"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || (!content.trim() && !image)}
              className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
