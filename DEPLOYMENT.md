# Deployment Guide - Alpha Fleet Board

## ✅ Successfully Pushed to GitHub

**Repository**: https://github.com/austinway-boop/JebinPiretShip

## 🚀 Deploy to Vercel

### Step 1: Import from GitHub

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: `austinway-boop/JebinPiretShip`
4. Click "Import"

### Step 2: Configure Project

**Framework Preset**: Other (or None)  
**Root Directory**: `./`  
**Build Command**: Leave empty  
**Output Directory**: Leave empty or `./`  
**Install Command**: Leave empty

### Step 3: Deploy

Click "Deploy" - Vercel will automatically deploy your app!

## 📦 Data Storage

The app uses **localStorage** as the primary data storage method. This means:

✅ **Works Perfectly on Vercel** - No database setup needed
✅ **Data persists in user's browser**
✅ **Each browser has its own data**
✅ **No server costs for database**

### How It Works

- All student data saves to browser localStorage automatically
- Data persists across page refreshes
- Each computer/browser has independent data
- Export CSV for backups

## 🔧 Optional: Add Database (Future Enhancement)

If you want shared data across all devices, you can add:

### Option 1: Vercel KV (Redis)

1. In Vercel dashboard → Storage → Create Database → KV
2. Connect to your project
3. Update `api/save-data.js` to use KV storage

```javascript
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const data = await kv.get('alpha_fleet_data');
    return res.json(data || { students: [], auditLog: [] });
  }
  
  if (req.method === 'POST') {
    await kv.set('alpha_fleet_data', req.body);
    return res.json({ success: true });
  }
}
```

### Option 2: Vercel Postgres

1. In Vercel dashboard → Storage → Create Database → Postgres
2. Follow setup instructions
3. Create tables for students and audit log

## 📱 Access Your Deployed App

After deployment, Vercel will give you a URL like:

```
https://jebin-piret-ship.vercel.app
```

Or you can add a custom domain in Vercel settings.

## ✨ Features That Work on Vercel

✅ All drag and drop functionality  
✅ Add/delete students  
✅ Admin mode (enabled by default)  
✅ Data persistence (localStorage)  
✅ All filters and search  
✅ CSV export  
✅ Auto-release countdown  
✅ Complete audit logging  

## 🔐 Current State

- **Storage**: localStorage (browser-based)
- **Admin Access**: Always enabled by default (no login required)
- **Data Sharing**: Each browser has its own data

## 🎯 Next Steps After Deployment

1. **Test the live site** - Make sure drag and drop works
2. **Add students** - Your real student roster
3. **Bookmark the URL** - Easy access for guides
4. **Regular CSV exports** - Backup your data
5. **(Optional) Add database** - If you want shared data across devices

## 📞 Support

If you need help with:
- Custom domain setup
- Database integration
- Authentication
- Multi-user sync

Just let me know!

---

**Current Version**: 2.0  
**GitHub**: https://github.com/austinway-boop/JebinPiretShip  
**Status**: ✅ Ready to deploy

