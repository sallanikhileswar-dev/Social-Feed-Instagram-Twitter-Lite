# Quick Start Guide

Get the MERN Social Media App running in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Cloudinary account (free tier works)

## Step 1: Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Configure Backend

1. Create backend `.env` file:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your credentials:

```env
# Minimum required configuration
NODE_ENV=development
PORT=5000

# MongoDB - Use local or Atlas connection string
MONGODB_URI=mongodb://localhost:27017/social-media-app

# JWT Secrets - Generate random strings
JWT_ACCESS_SECRET=your_random_secret_here_123456
JWT_REFRESH_SECRET=your_random_refresh_secret_here_789
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary - Get from cloudinary.com dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
CLIENT_URL=http://localhost:3000

# Email (optional for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Getting Cloudinary Credentials:
1. Sign up at https://cloudinary.com (free)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### MongoDB Options:

**Option A - Local MongoDB:**
```bash
# Make sure MongoDB is running
mongod
```

**Option B - MongoDB Atlas (Cloud):**
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Replace `MONGODB_URI` in `.env`

## Step 3: Configure Frontend

1. Create frontend `.env` file:
```bash
cd frontend
cp .env.example .env
```

2. Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Step 4: Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Browser should open automatically at `http://localhost:3000`

## Step 5: Create Your First Account

1. Click "Register" on the login page
2. Fill in:
   - Username (unique)
   - Email
   - Password
   - Name
3. Click "Register"
4. You'll be logged in automatically!

## What to Try First

### 1. Complete Your Profile
- Click your avatar in the top right
- Click "Profile"
- Click "Edit Profile"
- Upload a profile picture
- Add bio, website, location

### 2. Create Your First Post
- Go to Home page
- Type in the "What's on your mind?" box
- Optionally add images (up to 4)
- Click "Post"

### 3. Explore Features
- **Explore**: See all posts from all users
- **Trending**: See posts with high engagement
- **Search**: Find users and posts
- **Stories**: Create 24-hour temporary content

### 4. Test Real-Time Features
- Open app in two different browsers
- Log in with different accounts
- Send messages (click Messages icon)
- Like/comment on posts
- Watch notifications appear in real-time!

## Troubleshooting

### Backend won't start

**Error: MongoDB connection failed**
- Check MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`
- For Atlas, check IP whitelist and credentials

**Error: Port 5000 already in use**
- Change `PORT=5001` in `backend/.env`
- Update `REACT_APP_API_URL` in `frontend/.env`

### Frontend won't start

**Error: Port 3000 already in use**
- Press `Y` to run on different port
- Or kill process using port 3000

**Error: Cannot connect to backend**
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in `frontend/.env`
- Check browser console for CORS errors

### Image upload not working

**Error: Cloudinary upload failed**
- Verify Cloudinary credentials in `backend/.env`
- Check Cloud Name, API Key, API Secret are correct
- Ensure no extra spaces in `.env` file

### Real-time features not working

**Messages/Notifications not appearing**
- Check browser console for Socket.IO errors
- Verify `REACT_APP_SOCKET_URL` in `frontend/.env`
- Check backend logs for Socket.IO connection

## Testing with Multiple Users

To test social features, you need multiple accounts:

### Option 1: Multiple Browsers
- Chrome (normal)
- Chrome (incognito)
- Firefox
- Safari

### Option 2: Multiple Browser Profiles
- Chrome: Click profile icon → Add profile
- Create separate profiles for testing

### Option 3: Use Different Devices
- Desktop + Mobile
- Desktop + Tablet

## Default Admin Account

To test admin features, you need to manually set a user as admin:

1. Register a normal account
2. Connect to MongoDB:
```bash
# Local MongoDB
mongosh

# MongoDB Atlas
mongosh "your_connection_string"
```

3. Make user admin:
```javascript
use social-media-app
db.users.updateOne(
  { email: "your_email@example.com" },
  { $set: { isAdmin: true } }
)
```

4. Refresh the app - you'll see "Admin" link in navbar

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

## Need Help?

- Check `PROJECT_STATUS.md` for feature overview
- Read `backend/API_DOCUMENTATION.md` for API details
- Review `backend/README.md` and `frontend/README.md`
- Check `.kiro/specs/mern-social-media-app/` for requirements

## Next Steps

Once everything is running:
1. Explore all features
2. Test real-time messaging
3. Try admin moderation tools
4. Check responsive design on mobile
5. Review code structure
6. Add custom features!

---

**Enjoy building your social media app!** 🚀
