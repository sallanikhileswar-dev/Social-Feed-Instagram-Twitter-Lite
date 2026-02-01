import React, { useState, useEffect } from 'react';
import { storyService } from '../services';

const StoryViewer = ({ story, onClose }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Mark story as viewed when opened
    if (story && story._id) {
      storyService.viewStory(story._id).catch(err => {
        console.error('Failed to mark story as viewed:', err);
      });
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          onClose();
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [story, onClose]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Story Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <img
            src={story.author.profileImage || '/default-avatar.png'}
            alt={story.author.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{story.author.name}</p>
            <p className="text-sm opacity-75">
              {new Date(story.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-2xl">
          ×
        </button>
      </div>

      {/* Story Image */}
      <img
        src={story.image}
        alt="Story"
        className="max-h-screen max-w-full object-contain"
      />
    </div>
  );
};

export default StoryViewer;
