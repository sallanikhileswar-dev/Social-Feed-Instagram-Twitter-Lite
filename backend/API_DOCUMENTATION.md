# MERN Social Media API Documentation

Base URL: `http://localhost:5000/api`

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Posts](#posts)
- [Messages](#messages)
- [Notifications](#notifications)
- [Search](#search)
- [Stories](#stories)
- [Admin](#admin)
- [WebSocket Events](#websocket-events)

---

## Authentication

### Register
```http
POST /auth/register
```

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

### Refresh Token
```http
POST /auth/refresh
```

**Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### Forgot Password
```http
POST /auth/forgot-password
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /auth/reset-password
```

**Body:**
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

---

## Users

### Get User Profile
```http
GET /users/:id
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "name": "John Doe",
  "bio": "Software developer",
  "website": "https://johndoe.com",
  "location": "New York"
}
```

### Upload Profile Image
```http
POST /users/profile/image
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

### Follow User
```http
POST /users/:id/follow
Authorization: Bearer {accessToken}
```

### Unfollow User
```http
DELETE /users/:id/follow
Authorization: Bearer {accessToken}
```

### Get Followers
```http
GET /users/:id/followers?page=1&limit=20
```

### Get Following
```http
GET /users/:id/following?page=1&limit=20
```

---

## Posts

### Create Post
```http
POST /posts
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "content": "This is my post",
  "images": ["data:image/jpeg;base64,..."]
}
```

### Get Post
```http
GET /posts/:id
```

### Delete Post
```http
DELETE /posts/:id
Authorization: Bearer {accessToken}
```

### Like Post
```http
POST /posts/:id/like
Authorization: Bearer {accessToken}
```

### Unlike Post
```http
DELETE /posts/:id/like
Authorization: Bearer {accessToken}
```

### Comment on Post
```http
POST /posts/:id/comment
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "content": "Great post!"
}
```

### Repost
```http
POST /posts/:id/repost
Authorization: Bearer {accessToken}
```

### Bookmark Post
```http
POST /posts/:id/bookmark
Authorization: Bearer {accessToken}
```

### Remove Bookmark
```http
DELETE /posts/:id/bookmark
Authorization: Bearer {accessToken}
```

### Get Bookmarked Posts
```http
GET /posts/bookmarks/me?page=1&limit=20
Authorization: Bearer {accessToken}
```

### Get Following Feed
```http
GET /posts/feed/following?page=1&limit=20
Authorization: Bearer {accessToken}
```

### Get Global Feed
```http
GET /posts/feed/global?page=1&limit=20
```

### Get Trending Posts
```http
GET /posts/feed/trending?page=1&limit=20
```

---

## Messages

### Get Conversations
```http
GET /messages/conversations
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "user": { ... },
        "lastMessage": { ... },
        "unreadCount": 3
      }
    ]
  }
}
```

### Get Messages with User
```http
GET /messages/:userId?page=1&limit=50
Authorization: Bearer {accessToken}
```

### Mark Messages as Seen
```http
PUT /messages/:userId/seen
Authorization: Bearer {accessToken}
```

---

## Notifications

### Get Notifications
```http
GET /notifications?page=1&limit=20
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [ ... ],
    "unreadCount": 5,
    "pagination": { ... }
  }
}
```

### Mark Notifications as Read
```http
PUT /notifications/read
Authorization: Bearer {accessToken}
```

---

## Search

### Search Users
```http
GET /search/users?q=john&page=1&limit=20
```

### Search Posts
```http
GET /search/posts?q=javascript&page=1&limit=20
```

---

## Stories

### Create Story
```http
POST /stories
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

### Get Stories
```http
GET /stories
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stories": [
      {
        "author": { ... },
        "stories": [ ... ]
      }
    ]
  }
}
```

### Delete Story
```http
DELETE /stories/:id
Authorization: Bearer {accessToken}
```

---

## Admin

**Note:** All admin routes require admin privileges.

### Delete Post (Admin)
```http
DELETE /admin/posts/:id
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "reason": "Violates community guidelines"
}
```

### Delete Comment (Admin)
```http
DELETE /admin/comments/:id
Authorization: Bearer {accessToken}
```

### Delete User (Admin)
```http
DELETE /admin/users/:id
Authorization: Bearer {accessToken}
```

### Get Admin Logs
```http
GET /admin/logs?page=1&limit=50
Authorization: Bearer {accessToken}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_access_token'
  }
});
```

### Client to Server Events

#### Send Message
```javascript
socket.emit('send_message', {
  recipientId: 'user_id',
  content: 'Hello!'
});
```

#### Typing Indicator
```javascript
socket.emit('typing', {
  recipientId: 'user_id'
});
```

#### Stop Typing
```javascript
socket.emit('stop_typing', {
  recipientId: 'user_id'
});
```

### Server to Client Events

#### Receive Message
```javascript
socket.on('receive_message', (data) => {
  console.log('New message:', data.message);
});
```

#### Message Sent Confirmation
```javascript
socket.on('message_sent', (data) => {
  console.log('Message sent:', data.message);
});
```

#### User Typing
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data.userId);
});
```

#### User Stopped Typing
```javascript
socket.on('user_stopped_typing', (data) => {
  console.log('User stopped typing:', data.userId);
});
```

#### New Notification
```javascript
socket.on('new_notification', (data) => {
  console.log('New notification:', data.notification);
});
```

#### Message Seen
```javascript
socket.on('message_seen', (data) => {
  console.log('Message seen:', data.messageId);
});
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `USER_NOT_FOUND` - User does not exist
- `POST_NOT_FOUND` - Post does not exist
- `INVALID_CREDENTIALS` - Login failed
- `INVALID_TOKEN` - JWT token invalid or expired
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `ALREADY_LIKED` - Post already liked
- `ALREADY_FOLLOWING` - Already following user

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Response:** 429 Too Many Requests

---

## Image Upload

Images should be sent as base64 encoded strings:

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Supported Formats:** JPEG, PNG, GIF, WEBP  
**Max Size:** 5MB  
**Max Images per Post:** 4

---

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

## Setup Instructions

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`

4. Start the server:
```bash
npm run dev
```

5. Server runs on: `http://localhost:5000`

---

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

---

For more information, see the [README.md](./README.md) file.
