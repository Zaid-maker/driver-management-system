# Deploying Express.js Backend to Vercel

This guide will walk you through deploying your Driver Management System backend to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed globally: `npm i -g vercel`
3. A MongoDB database (MongoDB Atlas recommended)

## Project Structure

The project has been configured for Vercel deployment with the following structure:

```
server/
├── api/
│   └── index.ts          # Vercel entry point
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.ts          # Original Express app
├── vercel.json           # Vercel configuration
├── tsconfig.json
└── package.json
```

## Step-by-Step Deployment Guide

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### 3. Navigate to Server Directory

```bash
cd server
```

### 4. Configure Environment Variables

Before deploying, you need to set up environment variables in Vercel. You can do this via:

**Option A: Vercel CLI (Recommended)**

```bash
vercel env add MONGODB_URI
# Paste your MongoDB connection string when prompted

vercel env add JWT_SECRET
# Paste your JWT secret when prompted

vercel env add CORS_ORIGIN
# Enter your frontend URL (e.g., https://your-frontend.vercel.app)

vercel env add NODE_ENV
# Enter: production
```

**Option B: Vercel Dashboard**

1. Go to your project settings on https://vercel.com
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `CORS_ORIGIN`: Your frontend URL
   - `NODE_ENV`: production

### 5. Deploy to Vercel

For the first deployment:

```bash
vercel
```

The CLI will ask you some questions:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (for first deployment)
- What's your project's name? **driver-management-api** (or your preferred name)
- In which directory is your code located? **./** (current directory)

For subsequent deployments:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 6. Verify Deployment

After deployment, Vercel will provide you with a URL like:
- Preview: `https://your-project-xxxxx.vercel.app`
- Production: `https://your-project.vercel.app`

Test the deployment:

```bash
# Check health endpoint
curl https://your-project.vercel.app/api/health

# Check root endpoint
curl https://your-project.vercel.app/
```

### 7. Update Frontend Configuration

Update your frontend's `.env` file with the Vercel backend URL:

```env
VITE_API_URL=https://your-project.vercel.app/api
```

## Important Configuration Details

### vercel.json Explained

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",      // Entry point for Vercel
      "use": "@vercel/node"        // Use Node.js runtime
    }
  ],
  "routes": [
    {
      "src": "/(.*)",              // Route all requests
      "dest": "api/index.ts"       // To our API handler
    }
  ]
}
```

### Database Connection Optimization

The `api/index.ts` file implements connection caching to reuse MongoDB connections across serverless function invocations, improving performance and reducing cold start times.

## Troubleshooting

### Issue: Function Timeout
If you encounter timeout errors, you may need to upgrade to a paid Vercel plan for longer execution times, or optimize your database queries.

### Issue: CORS Errors
Make sure your `CORS_ORIGIN` environment variable matches your frontend URL exactly.

### Issue: Database Connection Failed
- Verify your MongoDB connection string is correct
- Ensure your MongoDB cluster allows connections from anywhere (0.0.0.0/0) or whitelist Vercel's IPs
- Check that your database user has the correct permissions

### Issue: Module Not Found
Ensure all dependencies are listed in `package.json` and not just in `devDependencies`.

## Viewing Logs

To view deployment logs:

```bash
vercel logs
```

Or view them in the Vercel Dashboard under your project's "Deployments" tab.

## Continuous Deployment

To set up automatic deployments from GitHub:

1. Push your code to a GitHub repository
2. Go to Vercel Dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy!

Now, every push to your main branch will automatically deploy to production, and pull requests will create preview deployments.

## Production Checklist

- [ ] MongoDB connection string configured
- [ ] JWT_SECRET set to a secure random string
- [ ] CORS_ORIGIN configured with your frontend domain
- [ ] All environment variables added in Vercel
- [ ] Database allows Vercel connections
- [ ] Test all API endpoints after deployment
- [ ] Update frontend API URL
- [ ] Monitor function execution times
- [ ] Set up error monitoring (optional: Sentry, LogRocket)

## Monitoring and Maintenance

### Check Function Analytics
- Go to Vercel Dashboard → Your Project → Analytics
- Monitor function execution times, errors, and invocations

### Update Deployment
```bash
# Make changes to your code
git commit -am "Update API"
git push

# Or deploy directly
vercel --prod
```

### Rollback to Previous Deployment
If something goes wrong, you can instantly rollback in the Vercel Dashboard:
1. Go to Deployments
2. Find a previous working deployment
3. Click "Promote to Production"

## Cost Considerations

Vercel's free Hobby plan includes:
- 100 GB bandwidth
- Serverless Function Execution: 100 GB-Hours
- 1000 Edge Middleware invocations

For production applications with higher traffic, consider upgrading to the Pro plan.

## Next Steps

1. Set up monitoring with error tracking services
2. Implement rate limiting for API endpoints
3. Add API documentation (Swagger/OpenAPI)
4. Set up automated tests in CI/CD
5. Configure custom domain for your API

## Support

For more information:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

---

**Note**: Vercel serverless functions have a maximum execution time limit. For long-running tasks, consider using Vercel's Background Functions or a separate worker service.
