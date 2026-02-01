# Setup Notes

## ✅ Environment Files Created

I've created the `.env` files for both backend and frontend with default development values.

## ⚠️ Important: Configure These Before Running

### 1. MongoDB Setup

The backend is configured to use: `mongodb://localhost:27017/social-media-app`

**Option A - Local MongoDB:**
- Install MongoDB: https://www.mongodb.com/try/download/community
- Start MongoDB service:
  ```bash
  # Windows
  net start MongoDB
  
  # Mac
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  ```

**Option B - MongoDB Atlas (Cloud - Recommended for quick start):**
1. Create free account: https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social-media-app
   ```

### 2. Cloudinary Setup (Required for Image Upload)

Images won't upload until you configure Cloudinary:

1. Sign up for free: https://cloudinary.com
2. Go to Dashboard
3. Copy your credentials
4. Update `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```

### 3. Email Setup (Optional - Only for Password Reset)

If you want password reset functionality:

1. Use Gmail with App Password:
   - Enable 2FA on your Google account
   - Generate App Password: https://myaccount.google.com/apppasswords
   
2. Update `backend/.env`:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_digit_app_password
   ```

**Note:** Password reset will fail without email configuration, but all other features work fine.

## 🚀 Quick Start After Configuration

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm start
```

## ✅ What's Already Configured

- ✅ JWT secrets (development values - change for production)
- ✅ CORS settings
- ✅ Rate limiting
- ✅ Port numbers (Backend: 5000, Frontend: 3000)

## 🔧 Current Status

### Backend `.env` Status:
- ✅ Created with default values
- ⚠️ MongoDB: Using local connection (configure if needed)
- ⚠️ Cloudinary: Placeholder values (MUST configure for image upload)
- ⚠️ Email: Placeholder values (optional, only for password reset)

### Frontend `.env` Status:
- ✅ Created and ready to use
- ✅ Points to localhost:5000 backend

## 🐛 Troubleshooting

### Backend won't start - MongoDB error
```
Error: The `uri` parameter to `openUri()` must be a string, got "undefined"
```
**Solution:** Configure MongoDB URI in `backend/.env` (see MongoDB Setup above)

### Image upload fails
```
Error: Cloudinary configuration error
```
**Solution:** Configure Cloudinary credentials in `backend/.env` (see Cloudinary Setup above)

### Duplicate index warnings
```
Warning: Duplicate schema index on {"username":1} found
```
**Solution:** Already fixed! This was resolved by removing duplicate index definitions.

## 📝 Next Steps

1. **Choose MongoDB option** (local or Atlas)
2. **Configure Cloudinary** (required for images)
3. **Optionally configure email** (for password reset)
4. **Start both servers** (backend and frontend)
5. **Register your first user**
6. **Test all features**

## 🎯 Minimum Required Configuration

To get the app running with basic features:

1. **MongoDB** - Either local or Atlas (REQUIRED)
2. **Cloudinary** - For image uploads (REQUIRED for profile pics and posts with images)
3. **Email** - Optional (app works without it, just no password reset)

## 📚 Additional Resources

- Full setup guide: `QUICK_START.md`
- Project overview: `PROJECT_STATUS.md`
- API documentation: `backend/API_DOCUMENTATION.md`
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`

---

**Ready to start?** Follow the Quick Start guide after configuring MongoDB and Cloudinary!
