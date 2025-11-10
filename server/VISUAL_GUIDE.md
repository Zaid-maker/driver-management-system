# Express.js to Vercel Deployment - Visual Guide

## 📦 What You Have Now

```
Your Project Structure:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
├─📁 server/                    ← YOUR BACKEND
│  ├─📁 api/
│  │  └─📄 index.ts            ← Vercel Entry Point ✨
│  ├─📁 src/
│  │  ├─📁 config/
│  │  ├─📁 controllers/
│  │  ├─📁 middleware/
│  │  ├─📁 models/
│  │  ├─📁 routes/
│  │  └─📄 index.ts
│  ├─📄 vercel.json            ← Vercel Config ✨
│  ├─📄 package.json
│  └─📄 .env.example
│
└─📁 client/                    ← YOUR FRONTEND
   └─ (your React app)
```

## 🔄 How Vercel Deployment Works

```
┌─────────────────────────────────────────────────────┐
│  1. You run: vercel --prod                          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  2. Vercel reads vercel.json configuration          │
│     {                                                │
│       "builds": [{                                   │
│         "src": "api/index.ts",                       │
│         "use": "@vercel/node"                        │
│       }]                                             │
│     }                                                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  3. Vercel builds your TypeScript code               │
│     - Installs dependencies                          │
│     - Compiles TypeScript → JavaScript               │
│     - Creates serverless function                    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  4. Deploys to Vercel's Edge Network                │
│     ✅ your-api.vercel.app                           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  5. Your API is LIVE! 🎉                            │
│     https://your-api.vercel.app/api/health          │
└─────────────────────────────────────────────────────┘
```

## 🌐 How Requests Flow

```
User Browser                    Vercel                MongoDB Atlas
─────────────                  ────────              ──────────────
     │                             │                       │
     │  GET /api/drivers           │                       │
     ├────────────────────────────►│                       │
     │                             │                       │
     │                             │  Connect to DB        │
     │                             ├──────────────────────►│
     │                             │                       │
     │                             │  ◄────────────────────┤
     │                             │  Return data          │
     │                             │                       │
     │  ◄────────────────────────────┤                       │
     │  JSON Response              │                       │
     │                             │                       │
```

## 🚀 Deployment Commands

### First Time Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Go to server directory
cd server

# 3. Login to Vercel
vercel login

# 4. Add environment variables
vercel env add MONGODB_URI
# Paste: mongodb+srv://username:password@cluster.mongodb.net/driver-management

vercel env add JWT_SECRET
# Paste: a-very-long-random-secure-string

vercel env add CORS_ORIGIN
# Paste: * (for testing) or https://your-frontend.vercel.app

vercel env add NODE_ENV
# Paste: production

# 5. Deploy!
vercel --prod
```

### After Setup (Updates)

```bash
cd server

# Deploy to production
vercel --prod

# Deploy to preview (test URL)
vercel
```

## 📝 Step-by-Step Walkthrough

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

**What this does:** Installs the Vercel command-line tool globally

### Step 2: Login

```bash
cd server
vercel login
```

**What happens:**
- Opens browser for authentication
- Links CLI to your Vercel account

### Step 3: Configure Environment Variables

```bash
vercel env add MONGODB_URI
```

**When prompted, enter:**
```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/driver-management?retryWrites=true&w=majority
```

**Where to get this:**
- MongoDB Atlas Dashboard
- Click "Connect"
- Choose "Connect your application"
- Copy the connection string

### Step 4: Add JWT Secret

```bash
vercel env add JWT_SECRET
```

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste when prompted.

### Step 5: Add CORS Origin

```bash
vercel env add CORS_ORIGIN
```

**Enter:**
- For testing: `*`
- For production: `https://your-frontend-app.vercel.app`

### Step 6: Deploy

```bash
vercel --prod
```

**What happens:**
1. Uploads code to Vercel
2. Installs dependencies
3. Builds TypeScript
4. Creates serverless function
5. Deploys to production
6. Returns URL

**Output:**
```
✅ Production: https://your-api-xxxxx.vercel.app
```

## 🧪 Testing Your Deployment

### Test 1: Health Check

```bash
curl https://your-api.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### Test 2: Root Endpoint

```bash
curl https://your-api.vercel.app/
```

**Expected Response:**
```json
{
  "message": "Driver Management System API",
  "version": "1.0.0",
  "status": "running",
  "environment": "vercel"
}
```

### Test 3: Login (with valid credentials)

```bash
curl -X POST https://your-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'
```

## 🔧 Updating Your Frontend

After backend is deployed, update your frontend:

### 1. Edit client/.env

```env
VITE_API_URL=https://your-api.vercel.app/api
```

### 2. Redeploy Frontend

```bash
cd client
vercel --prod
```

## 🎯 Complete Deployment Checklist

### Before Deployment
- [ ] MongoDB Atlas database created
- [ ] Network Access allows all IPs (0.0.0.0/0)
- [ ] Database user created with read/write permissions
- [ ] Vercel account created
- [ ] Vercel CLI installed

### During Deployment
- [ ] `vercel login` successful
- [ ] `MONGODB_URI` environment variable added
- [ ] `JWT_SECRET` environment variable added
- [ ] `CORS_ORIGIN` environment variable added
- [ ] `NODE_ENV` set to production
- [ ] `vercel --prod` executed successfully

### After Deployment
- [ ] Health check endpoint working
- [ ] Root endpoint responding
- [ ] Login endpoint working
- [ ] Frontend updated with new API URL
- [ ] Frontend redeployed
- [ ] Full integration tested

## 📊 Monitoring Your API

### View Real-Time Logs

```bash
vercel logs --follow
```

### Check Function Analytics

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Analytics"
4. View:
   - Function invocations
   - Error rates
   - Execution times
   - Regional performance

## 🚨 Troubleshooting

### Problem: "Module not found" error

**Solution:**
Check that all import statements use `.js` extension:
```typescript
// ✅ Correct
import { connectDB } from './config/database.js';

// ❌ Wrong
import { connectDB } from './config/database';
```

### Problem: "Database connection failed"

**Solution:**
1. Check MongoDB Atlas Network Access
2. Verify connection string in Vercel
3. Ensure database user has correct permissions

### Problem: "CORS error" in browser

**Solution:**
Set CORS_ORIGIN to your frontend URL:
```bash
vercel env add CORS_ORIGIN
# Enter: https://your-frontend.vercel.app
```

Then redeploy:
```bash
vercel --prod
```

## 🎉 Success!

If all steps completed successfully:

✅ Backend deployed to Vercel
✅ API accessible via public URL
✅ MongoDB connected
✅ All routes working
✅ Ready for production use

## 📚 Next Steps

1. **Set up custom domain** (optional)
   - Go to Vercel Dashboard
   - Project Settings → Domains
   - Add your custom domain

2. **Enable monitoring**
   - Vercel Analytics (built-in)
   - Error tracking (Sentry)
   - Performance monitoring

3. **Set up CI/CD**
   - Connect GitHub repository
   - Automatic deployments on push
   - Preview deployments for PRs

---

**Need help?** Check `DEPLOYMENT.md` for detailed documentation.

**Quick reference?** See `QUICKSTART.md` for condensed steps.
