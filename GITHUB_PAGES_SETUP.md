# 🚀 Complete AgentGPT Deployment Guide

## **Backend on Render + Frontend on GitHub Pages**

This guide will help you deploy your AgentGPT application with:
- **Backend**: FastAPI on Render (kept awake with GitHub Actions)
- **Frontend**: Next.js on GitHub Pages (deployed automatically)

## 📋 Prerequisites

- ✅ GitHub repository with your AgentGPT project
- ✅ Render account (free tier available)
- ✅ Backend deployed on Render
- ✅ Backend has a `/health` endpoint

## 🔧 Step-by-Step Setup

### **Step 1: Deploy Backend to Render**

1. **Go to [render.com](https://render.com) and sign up/login**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `agentgpt-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements-minimal.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     ```
     ENVIRONMENT=production
     DEBUG=false
     CORS_ORIGINS=https://your-username.github.io
     ```

5. **Click "Create Web Service"**
6. **Wait for deployment and copy the URL** (e.g., `https://agentgpt-backend.onrender.com`)

### **Step 2: Set Up GitHub Repository Secrets**

1. **Go to your GitHub repository**
2. **Click Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Add these secrets:**
   - **Name**: `BACKEND_URL`
   - **Value**: Your Render backend URL (e.g., `https://agentgpt-backend.onrender.com`)

### **Step 3: Enable GitHub Pages**

1. **Go to your repository Settings**
2. **Click "Pages" in the left sidebar**
3. **Under "Source", select "GitHub Actions"**
4. **Click "Save"**

### **Step 4: Run the Deployment Script**

```bash
# Make the script executable
chmod +x deploy.sh

# Run the automated setup
./deploy.sh
```

This will:
- ✅ Set up Python and Node.js environments
- ✅ Test your application
- ✅ Create GitHub Actions workflows
- ✅ Configure Next.js for GitHub Pages

### **Step 5: Push to GitHub**

```bash
git add .
git commit -m "Setup GitHub Pages deployment and backend keep-alive"
git push origin main
```

## 🕐 How It Works

### **Automatic Backend Keep-Alive**
- ⏰ **Runs every 10 minutes** via GitHub Actions cron
- 🎯 **Pings your Render backend** at `/health` endpoint
- ✅ **Keeps service awake** 24/7
- 🔄 **No more sleep delays**

### **Automatic Frontend Deployment**
- 🚀 **Deploys on every push** to main branch
- 🌐 **Builds and exports** Next.js to static files
- 📱 **Deploys to GitHub Pages** automatically
- 🔧 **Updates environment variables** from secrets

## 📊 Monitoring Your Deployment

### **Check Backend Status**
```bash
# Test your backend health
curl https://your-backend.onrender.com/health

# Test root endpoint
curl https://your-backend.onrender.com/
```

### **Check Frontend Status**
- **GitHub Pages URL**: `https://your-username.github.io/agentgpt_RAJ-main`
- **Actions Tab**: Monitor deployment progress
- **Pages Tab**: Check deployment status

### **Check GitHub Actions**
1. **Go to Actions tab** in your repository
2. **Monitor "Deploy AgentGPT"** workflow
3. **Check for green checkmarks** indicating success

## 🚨 Troubleshooting

### **Backend Not Responding**
- Verify `BACKEND_URL` secret is correct
- Check Render service status
- Ensure `/health` endpoint exists
- Check CORS configuration

### **Frontend Not Deploying**
- Verify GitHub Pages is enabled
- Check Actions tab for errors
- Ensure Next.js build succeeds
- Verify `basePath` in `next.config.js`

### **Workflow Not Running**
- Check if Actions are enabled
- Verify workflow files are in `.github/workflows/`
- Check cron syntax in workflow
- Ensure repository has proper permissions

## 🎯 Customization

### **Change Backend Ping Frequency**
Edit the cron in `.github/workflows/deploy-all.yml`:
```yaml
# Every 10 minutes (current)
cron: '*/10 * * * *'

# Every 15 minutes (less aggressive)
cron: '*/15 * * * *'
```

### **Update Frontend Base Path**
Edit `frontend/next.config.js`:
```javascript
// Update this to match your repository name
basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
```

### **Add Custom Environment Variables**
Add to the workflow:
```yaml
env:
  NEXT_PUBLIC_API_URL: ${{ secrets.BACKEND_URL }}
  NEXT_PUBLIC_CUSTOM_VAR: ${{ secrets.CUSTOM_VAR }}
```

## 🎉 Success Indicators

Your setup is working correctly when:
- ✅ Backend responds to health checks
- ✅ Frontend deploys to GitHub Pages
- ✅ GitHub Actions run automatically
- ✅ No more Render sleep delays
- ✅ Frontend loads from GitHub Pages

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

**💡 Pro Tip**: This setup gives you a completely free, automated deployment pipeline that keeps your backend awake and frontend updated with every code push!
