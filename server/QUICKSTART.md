# Quick Deployment Guide

## Deploy Backend to Vercel in 5 Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
cd server
vercel login
```

### 3. Set Environment Variables
```bash
vercel env add MONGODB_URI
# Enter your MongoDB connection string (e.g., mongodb+srv://...)

vercel env add JWT_SECRET
# Enter a secure random string (e.g., generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

vercel env add CORS_ORIGIN
# Enter: * (for testing) or your frontend URL (e.g., https://your-frontend.vercel.app)

vercel env add NODE_ENV
# Enter: production
```

### 4. Deploy
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

### 5. Test Your API
After deployment, test your API endpoints:

```bash
# Replace YOUR_VERCEL_URL with your actual Vercel URL
curl https://YOUR_VERCEL_URL.vercel.app/api/health
```

## Important MongoDB Setup

If using MongoDB Atlas:

1. Go to Network Access in MongoDB Atlas
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

This allows Vercel's serverless functions to connect to your database.

## Update Frontend

After backend deployment, update your frontend's `.env` file:

```env
VITE_API_URL=https://YOUR_VERCEL_URL.vercel.app/api
```

Then redeploy your frontend.

## Troubleshooting

**Issue: "Module not found"**
- Solution: Make sure all imports use `.js` extension even for `.ts` files

**Issue: "Database connection failed"**
- Solution: Check MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
- Verify your MONGODB_URI is correct

**Issue: "CORS error"**
- Solution: Set CORS_ORIGIN to your frontend URL or "*" for testing

## View Logs

```bash
vercel logs
```

Or view in Vercel Dashboard: https://vercel.com/dashboard

## Continuous Deployment (Optional)

1. Push your code to GitHub
2. Import project in Vercel Dashboard
3. Connect repository
4. Add environment variables
5. Deploy!

Every git push will automatically deploy your backend.

---

For detailed documentation, see [DEPLOYMENT.md](./DEPLOYMENT.md)
