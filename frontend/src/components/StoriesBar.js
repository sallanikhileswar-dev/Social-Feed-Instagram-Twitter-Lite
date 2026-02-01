import React, { useState, useEffect } from 'react';
import { storyService } from '../services';

const StoriesBar = ({ onStoryClick }) => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await storyService.getStories();
      setStories(response.data.stories || []);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  };

  if (stories.length === 0) return null;

  return (
    <div className="card-premium p-5 mb-6 animate-fade-in">
      <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {stories.map((storyGroup) => (
          <button
            key={storyGroup.author._id}
            onClick={() => onStoryClick(storyGroup.stories[0])}
            className="flex-shrink-0 text-center group"
          >
            <div className={`w-20 h-20 rounded-full p-1 transition-all duration-300 ${
              storyGroup.allViewed 
                ? 'bg-gradient-to-tr from-gray-300 to-gray-400' 
                : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 group-hover:shadow-lg'
            }`}>
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <img
                  src={storyGroup.author.profileImage || '/default-avatar.png'}
                  alt={storyGroup.author.username}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
            </div>
            <p className="text-xs mt-2 truncate w-20 font-medium text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
              {storyGroup.author.username}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoriesBar;
