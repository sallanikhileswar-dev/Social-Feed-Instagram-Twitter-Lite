# 🚀 START HERE - Quick Setup Guide

## ⚡ 3-Step Quick Start

### Step 1️⃣: Fix PowerShell (One-time only)
Right-click PowerShell → Run as Administrator → Paste this:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Press Enter → Type `Y` → Press Enter

### Step 2️⃣: Start MongoDB
Open Command Prompt and run:
```cmd
net start MongoDB
```

### Step 3️⃣: Run the App
1. Double-click: **`install-all.bat`** (first time only, wait for it to finish)
2. Double-click: **`start-backend.bat`** (keep window open)
3. Double-click: **`start-frontend.bat`** (keep window open)
4. Browser opens automatically at `http://localhost:3000`

**Done!** 🎉

---

## 📝 First Time Use

### Register Your Account
1. Click "Register" on the login page
2. Fill in:
   - Username: `yourname`
   - Email: `your@email.com`
   - Password: `yourpassword`
   - Name: `Your Full Name`
3. Click "Register"

### Start Using
- Create your first post
- Upload a profile picture
- Follow other users
- Send messages
- Check notifications

---

## ❌ Having Problems?

### Problem: "npm.ps1 cannot be loaded"
**Fix:** Do Step 1 above (PowerShell fix)

### Problem: "MongoDB connection failed"
**Fix:** Run `net start MongoDB` in Command Prompt

### Problem: "Port 5000 already in use"
**Fix:** Run this in Command Prompt:
```cmd
netstat -ano | findstr :5000
taskkill /PID <number> /F
```
(Replace `<number>` with the PID shown)

### Problem: Something else not working
**Fix:** Double-click `quick-fix.bat` and try again

---

## 📚 Need More Help?

- **Complete Setup Guide:** `COMPLETE_SETUP_GUIDE.md`
- **Debugging Help:** `DEBUG_GUIDE.md`
- **Testing Guide:** `TEST_CHECKLIST.md`

---

## 🎯 What You Can Do

✅ Create posts with text and images
✅ Like and comment on posts
✅ Follow/unfollow users
✅ Send real-time messages
✅ Get instant notifications
✅ Search for users and posts
✅ View trending content
✅ Create 24-hour stories
✅ Edit your profile
✅ Upload profile pictures

---

## 🔄 Daily Use

Every time you want to use the app:

1. Make sure MongoDB is running: `net start MongoDB`
2. Run `start-backend.bat`
3. Run `start-frontend.bat`
4. Go to `http://localhost:3000`

That's it!

---

## 🛑 Stopping the App

1. Close the browser
2. Press `Ctrl+C` in both terminal windows
3. Type `Y` and press Enter

---

## ✨ Tips

💡 Keep both terminal windows open while using the app
💡 If something breaks, run `quick-fix.bat`
💡 Check browser console (F12) if you see errors
💡 Clear browser cache if things look weird (Ctrl+Shift+Delete)

---

## 🎉 You're Ready!

Your social media app is ready to use. Have fun! 🚀

**Questions?** Check the other guide files in this folder.
