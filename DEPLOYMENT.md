# 🚀 Deployment Guide

This guide covers deploying Framegeist to production using Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

- GitHub account
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)

## 🛤️ Backend Deployment (Railway)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login and Initialize
```bash
railway login
cd /path/to/Framegeist
railway init
```

### 3. Deploy Backend
```bash
railway up
```

### 4. Set Environment Variables (Optional)
```bash
# In Railway dashboard, set environment variables:
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

### 5. Note Your Backend URL
Railway will provide a URL like: `https://framegeist-backend-production.railway.app`

## 🔺 Frontend Deployment (Vercel)

### 1. Update API URL
In `frontend/vercel.json`, update the backend URL:
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://your-railway-backend-url.railway.app"
  }
}
```

### 2. Deploy to Vercel
Option A - GitHub Integration (Recommended):
1. Push changes to GitHub
2. Go to Vercel dashboard
3. Import your GitHub repository
4. Select the `frontend` folder as root directory
5. Deploy

Option B - Vercel CLI:
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### 3. Set Environment Variables in Vercel
In Vercel dashboard → Settings → Environment Variables:
```
VITE_API_BASE_URL = https://your-railway-backend-url.railway.app
```

## 🔧 Post-Deployment Configuration

### 1. Update CORS on Backend
In Railway dashboard, set environment variable:
```
ALLOWED_ORIGINS=https://your-vercel-frontend-url.vercel.app
```

### 2. Test the Deployment
1. Visit your Vercel frontend URL
2. Upload a test image or video
3. Verify ASCII conversion works
4. Check that configuration persists

## 📊 Monitoring

### Railway Backend
- View logs: `railway logs`
- Monitor health: `https://your-backend-url.railway.app/health`

### Vercel Frontend
- View deployments in Vercel dashboard
- Check function logs for any errors

## 🛠️ Environment Variables Reference

### Backend (Railway)
| Variable | Description | Example |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | Frontend URLs for CORS | `https://framegeist.vercel.app` |
| `PORT` | Server port (auto-set by Railway) | `8000` |

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://framegeist-production.railway.app` |

## 🏗️ Alternative Deployment Options

### Full-Stack Platforms
- **Render**: Deploy both frontend and backend
- **DigitalOcean App Platform**: Complete solution
- **Heroku**: Traditional option (requires Docker)

### Self-Hosted
- **Docker Compose**: Use provided Dockerfile
- **VPS**: Ubuntu/CentOS with nginx reverse proxy

## 🐛 Troubleshooting

### CORS Errors
```bash
# Check ALLOWED_ORIGINS matches your frontend domain exactly
# Include protocol (https://) and no trailing slash
```

### FFmpeg Issues
```bash
# Railway includes FFmpeg by default via Dockerfile
# For other platforms, ensure FFmpeg is installed
```

### Large File Uploads
```bash
# Railway has generous limits
# For other platforms, check file size limits
```

### Build Errors
```bash
# Check all dependencies are in requirements.txt
# Verify Dockerfile runs locally with: docker build -t framegeist .
```

---

**Need help?** Open an issue on GitHub with deployment logs and error messages.