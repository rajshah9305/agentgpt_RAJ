# 🤖 AgentGPT - Autonomous AI Agent Platform

A production-ready, full-stack application for creating and managing autonomous AI agents powered by Cerebras and Sambanova AI models.

![AgentGPT](https://img.shields.io/badge/AgentGPT-AI%20Agents-blue?style=for-the-badge&logo=robot)
![Next.js](https://img.shields.io/badge/Next.js-14.2.31-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109.2-green?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-24.0-blue?style=for-the-badge&logo=docker)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 🚀 Features

- **🤖 Autonomous AI Agents**: Create intelligent agents that break down complex goals into executable tasks
- **🧠 Multiple AI Providers**: Support for Cerebras and Sambanova AI models
- **📊 Real-time Monitoring**: Live task execution tracking and progress visualization
- **📥 Data Export**: Download agent data in JSON, CSV, and TXT formats
- **💾 Configuration Management**: Save, load, and manage multiple agent configurations
- **🎨 Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **🔒 Secure API**: FastAPI backend with proper error handling and validation
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🐳 Docker Ready**: Full containerization support for easy deployment
- **☁️ Cloud Native**: Ready for Vercel, Railway, Render, and other cloud platforms

## 🏗️ Architecture

```
AgentGPT/
├── frontend/                 # Next.js 14 React application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utilities and stores
│   ├── public/              # Static assets
│   └── vercel.json          # Vercel deployment config
├── backend/                 # FastAPI Python backend
│   ├── main.py             # Main API server
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container
├── .github/                 # GitHub Actions CI/CD
├── docker-compose.yml       # Local development setup
├── deploy.sh               # Deployment preparation script
├── env.example             # Environment configuration
└── README.md               # This file
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Hooks** - Modern React patterns

### Backend
- **FastAPI 0.109.2** - Modern Python web framework
- **Pydantic 2.6.3** - Data validation and serialization
- **HTTPX 0.26.0** - Async HTTP client
- **Uvicorn 0.27.1** - ASGI server
- **Python 3.12** - Latest Python with pre-compiled wheels

### AI Providers
- **Cerebras Inference** - High-performance AI models
- **Sambanova Cloud** - Enterprise AI solutions

### DevOps & Deployment
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Frontend deployment
- **Railway/Render** - Backend deployment

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+ (3.12 recommended)
- **Docker** (optional, for containerized deployment)
- **API Keys** for Cerebras and/or Sambanova

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/agentgpt.git
cd agentgpt
```

### 2. Automated Setup (Recommended)
```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the automated setup
./deploy.sh
```

This script will:
- ✅ Check system requirements
- ✅ Set up Python virtual environment
- ✅ Install all dependencies
- ✅ Test the application
- ✅ Create production builds
- ✅ Generate configuration files

### 3. Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Configuration
Copy the example environment files and update them:

```bash
# Backend
cp env.example backend/.env
# Edit backend/.env with your API keys

# Frontend
cp frontend/env.example frontend/.env.local
# Edit frontend/.env.local with your backend URL
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🐳 Docker Deployment

### Local Development with Docker
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Builds
```bash
# Backend
cd backend
docker build -t agentgpt-backend .
docker run -p 8000:8000 agentgpt-backend

# Frontend
cd frontend
docker build -t agentgpt-frontend .
docker run -p 3000:3000 agentgpt-frontend
```

## ☁️ Cloud Deployment

### 🎯 Vercel (Frontend - Recommended)

1. **Import your GitHub repository** to Vercel
2. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_APP_NAME=AgentGPT
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```
3. **Deploy** - Vercel will automatically detect Next.js and deploy

### 🚂 Railway (Backend - Recommended)

1. **Deploy from GitHub** to Railway
2. **Set environment variables**:
   ```
   ENVIRONMENT=production
   DEBUG=false
   PORT=$PORT
   CORS_ORIGINS=https://your-frontend-domain.com
   CEREBRAS_API_KEY=your-key
   SAMBANOVA_API_KEY=your-key
   ```
3. **Use build command**: `pip install -r requirements.txt`

### 🌊 Render (Alternative Backend)

1. **Connect your GitHub repository**
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment variables** (same as Railway)

## 🔧 Configuration

### AI Provider Setup

#### Cerebras
1. Get your API key from [Cerebras Console](https://console.cerebras.ai)
2. Add it to your environment: `CEREBRAS_API_KEY=your-key`
3. Available models:
   - Llama 4 Scout (17B) - Ultra Fast
   - Llama 3.1 (8B) - Very Fast
   - Llama 3.3 (70B) - Fast
   - Qwen 3 (32B) - Fast
   - DeepSeek R1 Distill (70B) - Fast

#### Sambanova
1. Get your API key from [Sambanova Cloud](https://cloud.sambanova.ai)
2. Add it to your environment: `SAMBANOVA_API_KEY=your-key`
3. Available models:
   - Llama 4 Maverick (17B) - Ultra Fast
   - Llama 4 Scout (17B) - Ultra Fast
   - Meta Llama 3.1 (405B) - Fast
   - DeepSeek V3 - Fast

## 📱 Usage

### 1. Create an Agent
- Navigate to the configuration page
- Enter agent name and goal
- Select AI provider and model
- Configure advanced parameters (iterations, temperature)
- Save your configuration

### 2. Deploy and Monitor
- Click "Deploy Agent" to start execution
- Monitor real-time progress in the dashboard
- View task breakdown and results
- Track execution logs

### 3. Export Data
- Download agent data in multiple formats
- Choose what to include (config, tasks, logs)
- Generate comprehensive reports
- Export for analysis or sharing

## 🔒 Security

- **API Key Protection**: Never expose API keys in client-side code
- **CORS Configuration**: Properly configured for production
- **Input Validation**: Pydantic models ensure data integrity
- **Error Handling**: Graceful error responses without information leakage
- **Environment Variables**: Secure configuration management

## 📊 API Endpoints

### Core Endpoints
- `GET /` - Health check
- `GET /health` - System status
- `GET /providers` - Available AI providers

### Agent Management
- `POST /agents` - Create new agent
- `GET /agents` - List all agents
- `GET /agents/{id}` - Get agent details
- `GET /agents/{id}/tasks` - Get agent tasks
- `GET /agents/{id}/logs` - Get agent logs
- `GET /agents/{id}/summary` - Get execution summary

### Data Export
- `POST /agents/{id}/download` - Download with options
- `GET /agents/{id}/download/{format}` - Quick download

## 🧪 Testing

### Automated Testing
```bash
# Run the deployment script (includes testing)
./deploy.sh

# Or test manually
cd backend && python -c "import fastapi, uvicorn, httpx; print('✅ Backend OK')"
cd frontend && npm run type-check && npm run build
```

### Manual Testing
```bash
# Backend health check
curl http://localhost:8000/health

# API endpoints
curl http://localhost:8000/
curl http://localhost:8000/providers
```

## 📈 Performance

- **Frontend**: Optimized Next.js build with code splitting
- **Backend**: Async FastAPI with efficient data processing
- **Caching**: Intelligent caching for API responses
- **Bundle Size**: Optimized for production deployment
- **Docker**: Multi-stage builds for minimal image size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/agentgpt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/agentgpt/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/agentgpt/wiki)

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] ✅ Run `./deploy.sh` successfully
- [ ] ✅ Update environment variables with real API keys
- [ ] ✅ Test locally with Docker: `docker-compose up`
- [ ] ✅ Verify all API endpoints work
- [ ] ✅ Check frontend builds successfully
- [ ] ✅ Update CORS origins for production domains
- [ ] ✅ Set proper secret keys
- [ ] ✅ Configure monitoring and logging

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework
- **FastAPI Team** for the high-performance Python web framework
- **Tailwind CSS** for the utility-first CSS framework
- **Cerebras & Sambanova** for providing AI model access

---

**Made with ❤️ by the AgentGPT Team**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/agentgpt)

---

## 🎯 **One-Click Deployment**

### For Vercel Frontend:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/agentgpt)

### For Railway Backend:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new?template=https://github.com/yourusername/agentgpt)

### For Render:
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)