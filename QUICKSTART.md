# 🚀 AgentGPT Quick Start Guide

Get your autonomous AI agent platform running in under 5 minutes!

## ⚡ Super Quick Start

### 1. Clone & Setup (1 minute)
```bash
git clone https://github.com/yourusername/agentgpt.git
cd agentgpt
chmod +x deploy.sh
./deploy.sh
```

### 2. Start Services (1 minute)
```bash
docker-compose up -d
```

### 3. Access Your App (30 seconds)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎯 What You Get

✅ **Fully functional AI agent platform**  
✅ **Beautiful modern UI** with Tailwind CSS  
✅ **FastAPI backend** with comprehensive API  
✅ **Next.js 14 frontend** with TypeScript  
✅ **Docker containerization** for easy deployment  
✅ **Production-ready** configuration  

## 🔑 Configure AI Providers

### Cerebras AI
1. Get API key from [Cerebras Console](https://console.cerebras.ai)
2. Add to `backend/.env`:
   ```bash
   CEREBRAS_API_KEY=your-key-here
   ```

### Sambanova AI
1. Get API key from [Sambanova Cloud](https://cloud.sambanova.ai)
2. Add to `backend/.env`:
   ```bash
   SAMBANOVA_API_KEY=your-key-here
   ```

## 🚀 Deploy to Production

### Frontend (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Set `NEXT_PUBLIC_API_URL` to your backend URL
4. Deploy! 🎉

### Backend (Railway/Render)
1. Push to GitHub
2. Deploy to Railway or Render
3. Set environment variables
4. Your API is live! 🚀

## 🎮 Try It Out

1. **Create an Agent**: Configure name, goal, and AI provider
2. **Deploy Agent**: Watch real-time execution
3. **Monitor Progress**: Track tasks and results
4. **Export Data**: Download in JSON, CSV, or TXT formats

## 🆘 Need Help?

- **Documentation**: [README.md](README.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Structure**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Issues**: GitHub repository

---

## 🎯 **You're All Set!**

Your AgentGPT platform is now running locally and ready for production deployment. Enjoy creating autonomous AI agents! 🤖✨
