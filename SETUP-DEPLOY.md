# 🔧 Auto-Deploy Setup Guide

Follow these steps to configure automatic deployment for Framegeist.

## 🛤️ Step 1: Railway Setup

1. Go to [Railway.app](https://railway.app) and sign up
2. Create a new project:
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your `Framegeist` repository
   - Railway will auto-detect the Dockerfile

3. Get your Railway token:
   - Go to Railway dashboard → **Account Settings** → **Tokens**
   - Click **"Create Token"**
   - Copy the token (starts with `railway_`)

## 🔺 Step 2: Vercel Setup

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Import your repository:
   - Click **"New Project"**
   - Import your GitHub `Framegeist` repository
   - Set **Root Directory** to `frontend`
   - Deploy once to create the project

3. Get Vercel credentials:
   - Go to [Vercel Tokens](https://vercel.com/account/tokens)
   - Create a new token, copy it
   - Go to your project → **Settings** → **General**
   - Copy your **Project ID** and **Team ID** (if you have a team)

## 🔐 Step 3: GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and Variables** → **Actions**

Add these **Repository Secrets**:

### Railway Secrets
```
RAILWAY_TOKEN = railway_your_token_here
```

### Vercel Secrets
```
VERCEL_TOKEN = vercel_your_token_here
VERCEL_ORG_ID = your_org_or_team_id_here
VERCEL_PROJECT_ID = your_project_id_here
```

## 🚀 Step 4: Test Auto-Deploy

1. Make a small change to README.md
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push
   ```

3. Go to GitHub → **Actions** tab
4. Watch the deployment pipeline run:
   - 🧪 Test Backend
   - 🛤️ Deploy Backend to Railway  
   - 🔺 Deploy Frontend to Vercel
   - 🔄 Update CORS Settings

## 📊 Step 5: Get Your URLs

After successful deployment:

### Backend URL (Railway)
- Go to Railway dashboard
- Your backend will be at: `https://framegeist-backend-production.railway.app`

### Frontend URL (Vercel)  
- Go to Vercel dashboard
- Your frontend will be at: `https://framegeist-your-username.vercel.app`

## 🔧 Step 6: Configure CORS

In Railway dashboard:
1. Go to your project → **Variables**
2. Add environment variable:
   ```
   ALLOWED_ORIGINS = https://framegeist-your-username.vercel.app
   ```

## ✅ Step 7: Test Everything

1. Visit your Vercel frontend URL
2. Upload an image or video
3. Verify ASCII conversion works
4. Check configuration persistence

## 🐛 Troubleshooting

### GitHub Actions Failing?
- Check all secrets are set correctly
- Verify token permissions
- Look at the Actions logs for specific errors

### Railway Deploy Issues?
- Ensure Dockerfile builds locally
- Check Railway build logs
- Verify FFmpeg is working

### Vercel Build Problems?
- Check Node.js version compatibility
- Verify all npm dependencies install
- Look at Vercel function logs

### CORS Errors?
- Ensure ALLOWED_ORIGINS matches your Vercel URL exactly
- Include `https://` and no trailing slash
- Check Railway environment variables

## 🔄 Future Deploys

Every push to `main` will automatically:
1. Test the backend
2. Deploy to Railway
3. Build and deploy frontend to Vercel
4. Update CORS configuration

No manual deployment needed! 🎉

---

**Need help?** Open an issue with your deployment logs.