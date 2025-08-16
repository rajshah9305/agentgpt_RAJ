# 🚀 GitHub Actions Setup for Render Backend Keep-Alive

This guide will help you set up GitHub Actions to automatically ping your Render backend every 10 minutes, preventing it from going to sleep.

## 📋 Prerequisites

- ✅ GitHub repository with your AgentGPT project
- ✅ Render backend service deployed
- ✅ Backend has a `/health` endpoint (already implemented)

## 🔧 Step-by-Step Setup

### **Step 1: Push Your Code to GitHub**

```bash
# If you haven't already, commit and push your changes
git add .
git commit -m "Add GitHub Actions for backend keep-alive"
git push origin main
```

### **Step 2: Set Up GitHub Repository Secret**

1. **Go to your GitHub repository**
2. **Click Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Name**: `BACKEND_URL`
5. **Value**: Your Render backend URL (e.g., `https://your-app-name.onrender.com`)
6. **Click "Add secret"**

### **Step 3: Verify Workflow Files**

The deployment script has automatically created:
- `.github/workflows/keep-alive.yml` - Basic keep-alive
- `.github/workflows/keep-alive-advanced.yml` - Advanced monitoring

### **Step 4: Test the Workflow**

1. **Go to Actions tab** in your GitHub repository
2. **Click on "Keep Backend Alive"** workflow
3. **Click "Run workflow"** → **Run workflow**
4. **Monitor the execution** to ensure it works

## 🕐 How It Works

### **Basic Workflow** (`keep-alive.yml`)
- ⏰ **Runs every 10 minutes** automatically
- 🎯 **Pings your backend** at `/health` endpoint
- ✅ **Keeps Render service awake**
- 🔄 **Manual trigger** available via GitHub UI

### **Advanced Workflow** (`keep-alive-advanced.yml`)
- ⏰ **Runs every 8 minutes** (more aggressive)
- 🎯 **Pings multiple endpoints** (health, root, providers)
- 🔄 **Triggers on code pushes** to main branch
- 📊 **Better monitoring and logging**

## 🚨 Troubleshooting

### **Workflow Not Running**
- Check if Actions are enabled in repository settings
- Verify the workflow file is in `.github/workflows/`
- Ensure the cron syntax is correct

### **Backend Not Responding**
- Verify your `BACKEND_URL` secret is correct
- Check if your Render service is running
- Test the endpoints manually: `curl https://your-backend.onrender.com/health`

### **Too Many Pings**
- Render free tier allows reasonable ping frequency
- If you get rate limited, increase the interval to 15 minutes
- Consider upgrading to Render Pro for better reliability

## 🔄 Manual Testing

### **Test Locally**
```bash
# Test your backend health endpoint
curl https://your-backend.onrender.com/health

# Test root endpoint
curl https://your-backend.onrender.com/
```

### **Test GitHub Actions**
1. Go to Actions tab
2. Select "Keep Backend Alive"
3. Click "Run workflow"
4. Monitor the execution logs

## 📊 Monitoring

### **Check Workflow Status**
- **Green checkmark**: Backend is responding
- **Red X**: Backend is down or unreachable
- **Yellow dot**: Workflow is running

### **View Logs**
- Click on any workflow run
- Expand the "Ping Backend Health Endpoint" step
- Check the output for success/failure messages

## 🎯 Customization

### **Change Ping Frequency**
Edit the cron expression in your workflow:
```yaml
# Every 10 minutes (current)
cron: '*/10 * * * *'

# Every 15 minutes (less aggressive)
cron: '*/15 * * * *'

# Every 5 minutes (more aggressive)
cron: '*/5 * * * *'
```

### **Add More Endpoints**
Modify the matrix in the advanced workflow:
```yaml
strategy:
  matrix:
    endpoint: ['health', '', 'providers', 'your-custom-endpoint']
```

### **Add Notifications**
Consider adding Slack, Discord, or email notifications for failures.

## 🎉 Success Indicators

Your setup is working correctly when:
- ✅ GitHub Actions run every 10 minutes
- ✅ Backend responds to pings
- ✅ Render service stays awake
- ✅ No more 15+ second delays for users

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Syntax](https://crontab.guru/)
- [Render Documentation](https://render.com/docs)
- [Your Backend Health Endpoint](https://your-backend.onrender.com/health)

---

**💡 Pro Tip**: Once this is set up, your Render backend will stay awake 24/7, providing a much better user experience for your AgentGPT application!
