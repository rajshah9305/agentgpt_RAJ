# 📁 AgentGPT Project Structure

This document provides a complete overview of the AgentGPT project structure and organization.

## 🏗️ Root Directory Structure

```
agentgpt_RAJ-main/
├── 📁 .github/                    # GitHub Actions CI/CD
│   └── 📁 workflows/
│       └── 📄 ci-cd.yml          # CI/CD pipeline configuration
├── 📁 backend/                    # FastAPI Python backend
│   ├── 📄 main.py                # Main API server
│   ├── 📄 requirements.txt       # Python dependencies
│   ├── 📄 Dockerfile             # Backend container
│   ├── 📁 data/                  # Data storage (created at runtime)
│   └── 📁 logs/                  # Log files (created at runtime)
├── 📁 frontend/                   # Next.js React frontend
│   ├── 📁 app/                   # App Router pages
│   │   ├── 📄 globals.css        # Global styles
│   │   ├── 📄 layout.tsx         # Root layout
│   │   └── 📄 page.tsx           # Home page
│   ├── 📁 components/            # React components
│   │   ├── 📄 AgentConfiguration.tsx
│   │   ├── 📄 AgentDashboard.tsx
│   │   ├── 📄 DownloadPanel.tsx
│   │   └── 📄 Header.tsx
│   ├── 📁 lib/                   # Utilities and stores
│   │   └── 📁 stores/
│   │       └── 📄 agentStore.ts  # Zustand state management
│   ├── 📄 package.json           # Node.js dependencies
│   ├── 📄 next.config.js         # Next.js configuration
│   ├── 📄 tailwind.config.js     # Tailwind CSS configuration
│   ├── 📄 tsconfig.json          # TypeScript configuration
│   ├── 📄 vercel.json            # Vercel deployment config
│   └── 📄 env.example            # Frontend environment example
├── 📄 .gitignore                 # Git ignore patterns
├── 📄 docker-compose.yml         # Docker Compose configuration
├── 📄 deploy.sh                  # Deployment preparation script
├── 📄 env.example                # Backend environment example
├── 📄 LICENSE                    # MIT License
├── 📄 PROJECT_STRUCTURE.md       # This file
├── 📄 README.md                  # Main project documentation
└── 📄 DEPLOYMENT.md              # Detailed deployment guide
```

## 🔧 Configuration Files

### Environment Configuration
- **`env.example`** - Backend environment variables template
- **`frontend/env.example`** - Frontend environment variables template
- **`.env`** - Backend environment variables (created from template)
- **`.env.local`** - Frontend environment variables (created from template)

### Docker Configuration
- **`docker-compose.yml`** - Multi-service local development
- **`backend/Dockerfile`** - Backend container image
- **`frontend/Dockerfile`** - Frontend container image

### Deployment Configuration
- **`vercel.json`** - Vercel frontend deployment
- **`.github/workflows/ci-cd.yml`** - GitHub Actions CI/CD
- **`deploy.sh`** - Automated deployment preparation

## 🚀 Key Features by Directory

### Backend (`/backend`)
- **FastAPI server** with async support
- **AI provider integration** (Cerebras, Sambanova)
- **RESTful API endpoints** for agent management
- **Data export** in multiple formats (JSON, CSV, TXT)
- **Real-time task execution** and monitoring
- **Comprehensive logging** and error handling

### Frontend (`/frontend`)
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for modern styling
- **Zustand** for state management
- **Responsive design** for all devices
- **Real-time updates** via API integration

### DevOps (`/.github`, `/scripts`)
- **GitHub Actions** for automated testing
- **Docker Compose** for local development
- **Automated deployment** preparation
- **Multi-platform** deployment support

## 📱 Component Architecture

### Frontend Components
```
components/
├── Header.tsx              # Navigation and branding
├── AgentConfiguration.tsx  # Agent setup and configuration
├── AgentDashboard.tsx      # Real-time monitoring and control
└── DownloadPanel.tsx       # Data export and download
```

### State Management
```
lib/stores/
└── agentStore.ts          # Global application state
    ├── Agent configuration
    ├── Task execution status
    ├── Real-time updates
    └── Data persistence
```

## 🔌 API Endpoints

### Core API Structure
```
/api/
├── GET  /                 # Health check and info
├── GET  /health           # System status
├── GET  /providers        # Available AI providers
├── POST /agents           # Create new agent
├── GET  /agents           # List all agents
├── GET  /agents/{id}      # Get agent details
├── GET  /agents/{id}/tasks    # Get agent tasks
├── GET  /agents/{id}/logs     # Get agent logs
├── GET  /agents/{id}/summary  # Get execution summary
└── POST /agents/{id}/download # Download agent data
```

## 🐳 Container Architecture

### Docker Services
```yaml
services:
  backend:    # FastAPI server on port 8000
  frontend:   # Next.js app on port 3000
```

### Container Features
- **Health checks** for automatic restart
- **Volume mounting** for data persistence
- **Environment variable** injection
- **Network isolation** with custom bridge

## ☁️ Deployment Architecture

### Frontend Deployment (Vercel)
- **Automatic builds** from GitHub
- **Edge functions** for global performance
- **Environment variable** management
- **Automatic HTTPS** and CDN

### Backend Deployment (Railway/Render)
- **GitHub integration** for automatic deployment
- **Environment variable** configuration
- **Health monitoring** and auto-restart
- **Scalable infrastructure**

## 🔒 Security Features

### API Security
- **CORS configuration** for production domains
- **Input validation** with Pydantic models
- **Error handling** without information leakage
- **Rate limiting** support

### Environment Security
- **API key protection** in environment variables
- **Secret management** for production
- **Secure configuration** loading

## 📊 Monitoring & Logging

### Backend Monitoring
- **Health check endpoints** for load balancers
- **Structured logging** with configurable levels
- **Performance metrics** and response times
- **Error tracking** and reporting

### Frontend Monitoring
- **Build optimization** and bundle analysis
- **Type checking** and linting
- **Performance monitoring** and metrics
- **Error boundary** implementation

## 🧪 Testing Strategy

### Automated Testing
- **Backend dependency** validation
- **Frontend build** verification
- **API endpoint** testing
- **Docker image** validation

### Manual Testing
- **Local development** with hot reload
- **Docker Compose** integration testing
- **Production build** verification
- **Cross-platform** compatibility

## 📈 Performance Optimization

### Backend Optimization
- **Async FastAPI** for concurrent requests
- **Efficient data processing** and serialization
- **Memory management** for large datasets
- **Connection pooling** for external APIs

### Frontend Optimization
- **Next.js 14** with App Router
- **Code splitting** and lazy loading
- **Image optimization** and compression
- **Bundle size** optimization

## 🔄 Development Workflow

### Local Development
1. **Clone repository** and run `./deploy.sh`
2. **Start services** with `docker-compose up`
3. **Make changes** with hot reload
4. **Test locally** before committing

### CI/CD Pipeline
1. **Push to GitHub** triggers automated testing
2. **Backend tests** run on multiple Python versions
3. **Frontend tests** include type checking and builds
4. **Docker images** are built and tested
5. **Automatic deployment** to staging/production

### Production Deployment
1. **Environment variables** are configured
2. **Docker images** are built and deployed
3. **Health checks** verify successful deployment
4. **Monitoring** and logging are activated

## 🎯 Getting Started

### Quick Start
```bash
# Clone and setup
git clone https://github.com/yourusername/agentgpt.git
cd agentgpt
chmod +x deploy.sh
./deploy.sh

# Start services
docker-compose up
```

### Manual Setup
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 📚 Documentation

- **`README.md`** - Main project documentation
- **`DEPLOYMENT.md`** - Detailed deployment guide
- **`PROJECT_STRUCTURE.md`** - This file
- **API Documentation** - Available at `/docs` when backend is running

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly** with `./deploy.sh`
5. **Submit a pull request**

---

**This structure ensures a clean, maintainable, and production-ready codebase that can be easily deployed to any cloud platform.**
