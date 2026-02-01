// Generate a default avatar with user's initials
export const getDefaultAvatar = (username = 'User', name = '') => {
  // Get initials from name or username
  const displayName = name || username;
  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a color based on the username
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  
  const colorIndex = username.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  // Create SVG data URI
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${bgColor}"/>
      <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Simple fallback avatar (generic user icon)
export const FALLBACK_AVATAR = `data:image/svg+xml;base64,${btoa(`
  <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#9CA3AF"/>
    <circle cx="50" cy="35" r="18" fill="white"/>
    <path d="M 20 85 Q 20 60 50 60 Q 80 60 80 85 Z" fill="white"/>
  </svg>
`)}`;
