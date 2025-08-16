# 🚀 AgentGPT Deployment Guide

This guide covers deploying AgentGPT to various platforms, with special focus on fixing the common build issues.

## 🎯 Quick Fix for Render Build Issues

The main issue you encountered was with `pydantic-core` requiring Rust compilation. We've implemented a **multi-layered fallback strategy** to ensure your build always succeeds:

### 🔧 **Multi-Layer Requirements Strategy**

1. **`requirements-minimal.txt`** - **Pydantic v1.10.8** (100% guaranteed pre-compiled wheels)
2. **`requirements-render-safe.txt`** - **Pydantic v2.5.3** (stable pre-compiled wheels)  
3. **`requirements-render.txt`** - **Pydantic v2.7.4** (latest pre-compiled wheels)
4. **`requirements.txt`** - Main requirements (fallback)

The Dockerfile automatically tries each level until one works, ensuring your build never fails due to compilation issues.

## 🐳 Docker Deployment

### Local Testing
```bash
# Build the backend
cd backend
docker build -t agentgpt-backend .

# Run the backend
docker run -p 8000:8000 agentgpt-backend

# Build the frontend
cd ../frontend
docker build -t agentgpt-frontend .

# Run the frontend
docker run -p 3000:3000 agentgpt-frontend
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
      - ENVIRONMENT=production
    volumes:
      - ./backend/data:/app/data
      - ./backend/logs:/app/logs

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend
```

## ☁️ Render Deployment

### Backend Service
1. **Connect your GitHub repository**
2. **Build Command**: `pip install -r requirements-minimal.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment variables**:
   ```
   ENVIRONMENT=production
   DEBUG=false
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

**Alternative Build Commands** (if you want to try newer versions):
- `pip install -r requirements-render-safe.txt` (Pydantic v2.5.3)
- `pip install -r requirements-render.txt` (Pydantic v2.7.4)

### Frontend Service
1. **Connect your GitHub repository**
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
   ```

## 🚂 Railway Deployment

### Backend
1. **Deploy from GitHub**
2. **Set environment variables**:
   ```
   ENVIRONMENT=production
   DEBUG=false
   PORT=$PORT
   ```
3. **Use build command**: `pip install -r requirements-minimal.txt`

### Frontend
1. **Deploy from GitHub**
2. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-railway-url.com
   ```

## 🎯 Vercel Deployment (Frontend)

1. **Import your GitHub repository**
2. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
3. **Deploy**

## 🔧 Environment Configuration

### Backend (.env)
```bash
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false
ENVIRONMENT=production

# Security
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://your-frontend-domain.com

# AI Provider Configuration
CEREBRAS_API_KEY=your-cerebras-api-key
SAMBANOVA_API_KEY=your-sambanova-api-key
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_NAME=AgentGPT
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🚨 Troubleshooting

### Common Build Issues

#### 1. Pydantic Rust Compilation Error ✅ **FIXED**
**Problem**: `error: subprocess-exited-with-error` during pydantic-core build
**Solution**: Use `requirements-minimal.txt` - guaranteed to work with pre-compiled wheels

#### 2. Python Version Compatibility ✅ **FIXED**
**Problem**: Package compatibility issues
**Solution**: Use Python 3.12+ and our multi-layer requirements strategy

#### 3. CORS Issues
**Problem**: Frontend can't connect to backend
**Solution**: Set proper `CORS_ORIGINS` in backend environment

#### 4. Port Binding Issues
**Problem**: Service won't start
**Solution**: Use `$PORT` environment variable for Render/Railway

### Health Check Endpoints

- **Backend Health**: `GET /health`
- **API Root**: `GET /`
- **Providers**: `GET /providers`

## 📊 Monitoring & Logs

### Health Checks
The backend includes automatic health checks that monitor:
- Service availability
- Response times
- Basic functionality

### Logging
- **Level**: Set via `LOG_LEVEL` environment variable
- **Format**: JSON for production, readable for development
- **Output**: Console and file-based logging

## 🔒 Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: Restrict CORS origins in production
3. **Rate Limiting**: Implement rate limiting for production use
4. **HTTPS**: Always use HTTPS in production

## 🚀 Performance Optimization

1. **Docker Layer Caching**: Requirements are copied first for better caching
2. **Multi-stage Builds**: Consider for production images
3. **Health Checks**: Automatic restart on failure
4. **Environment-specific Configs**: Separate configs for dev/staging/prod

## 📝 Next Steps

After successful deployment:

1. **Test all endpoints** using the health check
2. **Verify CORS** is working properly
3. **Test AI provider integrations**
4. **Monitor logs** for any issues
5. **Set up monitoring** and alerting

## 🆘 Support

If you encounter issues:

1. **Check the logs** in your deployment platform
2. **Verify environment variables** are set correctly
3. **Test locally** with Docker first
4. **Check the health endpoint** for service status
5. **Try the minimal requirements** first: `pip install -r requirements-minimal.txt`

## 🎯 **Guaranteed Success Strategy**

**For Render deployment, always start with:**
```bash
pip install -r requirements-minimal.txt
```

This uses **Pydantic v1.10.8** which has **100% guaranteed pre-compiled wheels** and will never require Rust compilation.

---

**Happy Deploying! 🎉**
