# 🏴‍☠️ Alpha Fleet Board (Pirate Ship)

A modern, minimalist student accountability dashboard for Alpha Afterschool program.

---

## 🚀 Quick Start - Vercel Deployment

### Prerequisites
- GitHub account (you already have this!)
- Vercel account (free at https://vercel.com)

---

## 📋 Step-by-Step Setup Guide

### 1. Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Import from GitHub: **`austinway-boop/JebinPiretShip`**
4. Click **"Deploy"** (use all default settings)
5. Wait for deployment to complete

### 2. Create Vercel KV Database (REQUIRED to fix 404 error)

**In your Vercel project dashboard:**

1. Click the **"Storage"** tab
2. Click **"Create Database"**
3. Select **"KV"** (this is Redis - perfect for our app)
4. Database Name: `alpha-fleet-db`
5. Region: Choose closest to you (e.g., US East)
6. Click **"Create"**

### 3. Connect Database to Your Project

1. After creating the database, you'll see **"Connect to Project"** button
2. Click it
3. Select your project: **`JebinPiretShip`**
4. Click **"Connect"**
5. Vercel will automatically add these environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`

### 4. Trigger Redeploy

1. Go to **"Deployments"** tab
2. Click the **three dots (•••)** next to your latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes for deployment to complete

### 5. Test Your App! ✅

Visit your Vercel URL (something like `https://jebin-piret-ship.vercel.app`)

The app should now work with:
- ✅ No 404 errors
- ✅ Drag and drop functionality
- ✅ Data persistence across all devices
- ✅ Cloud backup of all student data

---

## 🎯 What This App Does

### For Students/Guides (Read-Only Mode):
- View all students in Active or Pirate Ship status
- See countdown timers for students in Pirate Ship
- Filter by status or search by name
- Export data to CSV

### For Admins (Admin Mode - Enabled by Default):
- **Drag students** between Active ↔ Pirate Ship
- **Add new students** with + Add Student button
- **Delete students** from the detail drawer
- **Edit notes** and extend Pirate Ship periods
- **Bulk actions** in table view
- **Full audit trail** of all changes

### Automation:
- **14-day Pirate Ship period** (automatically calculated)
- **Countdown badges** with color coding:
  - 🟡 Yellow: >7 days remaining
  - 🟠 Orange: ≤7 days remaining
  - 🔴 Red: ≤3 days remaining
- **Auto-release** when period expires

---

## 💾 How Data Storage Works

### Dual Storage System:
1. **localStorage** (Browser) - Instant saves, works offline
2. **Vercel KV** (Cloud) - Persistent, shared across all devices

### Data Flow:
```
User makes change → Saves to localStorage (instant)
                 → Syncs to Vercel KV (backup)

Page loads → Loads from localStorage (fast)
          → Falls back to Vercel KV if needed
```

### Benefits:
- 🚀 **Lightning fast** - localStorage for instant UI
- ☁️ **Persistent** - KV keeps data forever
- 🔄 **Shared** - All devices see the same data
- 💪 **Reliable** - Multiple backup layers

---

## 📊 What Information I Need (If You Need My Help)

### To Help You Further, Share:

1. **Vercel Project URL**
   - Example: `https://jebin-piret-ship.vercel.app`
   - Find it in: Vercel Dashboard → Your Project → Domains

2. **Deployment Status**
   - Tell me: "Deployed successfully" or "Getting 404 error"
   - Or share screenshot of any errors

3. **KV Database Status**
   - Go to: Storage tab in Vercel
   - Tell me: "KV database created and connected" or "Having issues"

4. **Environment Variables** (optional, for debugging)
   - Go to: Settings → Environment Variables
   - Check if these exist:
     - `KV_REST_API_URL` ✅
     - `KV_REST_API_TOKEN` ✅
     - `KV_URL` ✅
   - Just tell me "Environment variables are set" (don't share the actual values!)

### What I Can Help With:
- ✅ Database setup troubleshooting
- ✅ Custom domain configuration
- ✅ Adding authentication (if needed)
- ✅ Multi-user permissions
- ✅ Data migration or backup
- ✅ Custom features

---

## 🎨 Features

### Board View (Kanban Style)
- Two columns: **Active** and **Pirate Ship**
- Drag and drop cards between columns
- Visual countdown badges
- Search and filter by name or status

### Table View (Spreadsheet Style)
- Full student roster
- Bulk actions: select multiple students
- Move to Pirate Ship, Release, or Extend periods
- Sortable columns

### Student Detail Drawer
- Complete student information
- Edit notes
- View recent history (last 5 changes)
- Quick actions: Extend, Release, Custom dates, Delete

### Admin Features
- **Enabled by default** - no login needed
- Toggle on/off for read-only view
- Full drag and drop
- Add/edit/delete students
- Complete audit logging

---

## 🔧 Troubleshooting

### Getting 404 Error?
**Cause**: KV database not connected yet  
**Solution**: Follow "Step 2: Create Vercel KV Database" above

### Data Not Saving?
1. Check Storage tab - database should show "Connected"
2. Check Environment Variables are set
3. Trigger a new deployment

### Drag and Drop Not Working?
1. Make sure Admin Mode is enabled (button should say "🔓 Admin Mode")
2. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Check browser console (F12) for errors

### Need to Reset All Data?
1. Go to Storage → Your KV Database
2. Click "Data" tab
3. Find key: `alpha_fleet_data`
4. Click Delete
5. Refresh your app

---

## 📱 Local Development (Optional)

Want to run it locally?

```bash
# Clone the repository
git clone https://github.com/austinway-boop/JebinPiretShip.git
cd JebinPiretShip

# Start the local server
node server.js

# Or use Python
python3 -m http.server 7000

# Open in browser
http://localhost:7000
```

**Note**: Local version uses localStorage only (no cloud sync).

---

## 🔐 Security & Privacy

- **No user authentication** required by default (admin mode always on)
- **Data stored in your Vercel account** - you control it
- **No external services** - everything runs on Vercel
- **HTTPS by default** - all data encrypted in transit
- **Add authentication later** if needed (just ask me!)

---

## 📈 Scaling & Limits

### Vercel Free Tier (More Than Enough):
- ✅ Unlimited requests
- ✅ 100GB bandwidth/month
- ✅ Generous KV storage
- ✅ Automatic HTTPS
- ✅ Global CDN

### KV Database (Free Tier):
- ✅ 256 MB storage (handles thousands of students)
- ✅ 100,000 reads/month
- ✅ 1,000 writes/month
- ✅ Perfect for school use

---

## 🎯 Quick Reference

### Admin Actions:
- **Drag to Pirate Ship** → Sets 14-day period
- **Drag to Active** → Releases immediately
- **+ Add Student** → Top right button
- **Click any card** → View details/delete
- **Bulk actions** → Switch to Table View

### Keyboard Shortcuts:
- **Enter** in Add Student modal → Saves student
- **Esc** → Closes modals
- **F12** → Open browser console (for debugging)

### Export Data:
- Click **"Export CSV"** button (top right)
- Downloads complete roster with all data
- Use for backups or reporting

---

## 📞 Support

### Need Help?

**Share with me:**
1. Your Vercel URL
2. What's not working
3. Any error messages

**I can help with:**
- Database setup
- Custom features
- Authentication
- Data migration
- Troubleshooting

---

## 🔗 Links

- **GitHub**: https://github.com/austinway-boop/JebinPiretShip
- **Vercel**: https://vercel.com
- **Your Deployment**: [You'll get this after deploying]

---

## 📜 Version

**Current**: 2.1  
**Updated**: November 2025  
**Status**: ✅ Production Ready

---

## ⚡ TL;DR - Just Get It Working

1. Deploy to Vercel from GitHub
2. Create KV database in Storage tab
3. Connect database to project
4. Redeploy
5. Done! 🎉

Everything else is automatic!

---

**Built with**: HTML, CSS, vanilla JavaScript  
**Hosted on**: Vercel  
**Database**: Vercel KV (Redis)  
**No frameworks**: Pure web standards

