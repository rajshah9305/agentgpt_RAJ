#!/bin/bash

# 🚀 AgentGPT Deployment Script
# This script prepares and tests your application for deployment

set -e  # Exit on any error

echo "🚀 Starting AgentGPT Deployment Preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11+"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm 9+"
        exit 1
    fi
    
    # Check Docker (optional)
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Docker deployment will be skipped."
        DOCKER_AVAILABLE=false
    else
        DOCKER_AVAILABLE=true
        print_success "Docker is available"
    fi
    
    print_success "System requirements check completed"
}

# Setup Python environment
setup_backend() {
    print_status "Setting up backend environment..."
    
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install requirements
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Test backend
    print_status "Testing backend..."
    python -c "
import fastapi
import uvicorn
import httpx
print('✅ Backend dependencies installed successfully')
"
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend environment
setup_frontend() {
    print_status "Setting up frontend environment..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Type check
    print_status "Running TypeScript type check..."
    npm run type-check
    
    # Build test
    print_status "Testing build process..."
    npm run build
    
    cd ..
    print_success "Frontend setup completed"
}

# Test the application
test_application() {
    print_status "Testing the application..."
    
    # Start backend in background
    cd backend
    source venv/bin/activate
    print_status "Starting backend server..."
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    sleep 10
    
    # Test backend health
    print_status "Testing backend health endpoint..."
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    if curl -f http://localhost:8000/ > /dev/null 2>&1; then
        print_success "API root endpoint working"
    else
        print_error "API root endpoint failed"
    fi
    
    if curl -f http://localhost:8000/providers > /dev/null 2>&1; then
        print_success "Providers endpoint working"
    else
        print_error "Providers endpoint failed"
    fi
    
    # Stop backend
    print_status "Stopping backend server..."
    kill $BACKEND_PID 2>/dev/null || true
    
    print_success "Application testing completed"
}

# Docker testing
test_docker() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Testing Docker deployment..."
        
        # Build and test backend
        cd backend
        print_status "Building backend Docker image..."
        docker build -t agentgpt-backend-test .
        
        # Test backend container
        print_status "Testing backend container..."
        docker run -d --name agentgpt-backend-test -p 8001:8000 agentgpt-backend-test
        sleep 10
        
        if curl -f http://localhost:8001/health > /dev/null 2>&1; then
            print_success "Backend Docker container working"
        else
            print_error "Backend Docker container failed"
        fi
        
        # Cleanup
        docker stop agentgpt-backend-test
        docker rm agentgpt-backend-test
        cd ..
        
        # Build and test frontend
        cd frontend
        print_status "Building frontend Docker image..."
        docker build -t agentgpt-frontend-test .
        cd ..
        
        print_success "Docker testing completed"
    else
        print_warning "Skipping Docker tests (Docker not available)"
    fi
}

# Create production build
create_production_build() {
    print_status "Creating production build..."
    
    # Frontend production build
    cd frontend
    print_status "Building frontend for production..."
    npm run build
    
    # Check if build was successful
    if [ -d ".next" ]; then
        print_success "Frontend production build created"
    else
        print_error "Frontend production build failed"
        exit 1
    fi
    cd ..
    
    print_success "Production build completed"
}

# Generate deployment files
generate_deployment_files() {
    print_status "Generating deployment files..."
    
    # Create .env files from examples
    if [ ! -f "backend/.env" ]; then
        print_status "Creating backend .env file..."
        cp env.example backend/.env
        print_warning "Please update backend/.env with your actual API keys and configuration"
    fi
    
    if [ ! -f "frontend/.env.local" ]; then
        print_status "Creating frontend .env.local file..."
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AgentGPT
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
        print_warning "Please update frontend/.env.local with your production API URL"
    fi
    
    print_success "Deployment files generated"
}

# Setup GitHub Actions for deployment and keep-alive
setup_github_actions() {
    print_status "Setting up GitHub Actions for backend keep-alive and frontend deployment..."
    
    # Create .github directory if it doesn't exist
    if [ ! -d ".github" ]; then
        mkdir -p .github/workflows
        print_success "Created .github/workflows directory"
    fi
    
    # Check if combined deployment workflow exists
    if [ -f ".github/workflows/deploy-all.yml" ]; then
        print_success "GitHub Actions deployment workflow already exists"
    else
        print_status "Creating GitHub Actions deployment workflow..."
        cat > .github/workflows/deploy-all.yml << 'EOF'
name: Deploy AgentGPT (Backend + Frontend)

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  schedule:
    - cron: '*/10 * * * *'  # Keep backend awake every 10 minutes
  workflow_dispatch:  # Manual trigger

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Keep Backend Awake (Runs on schedule)
  keep-backend-alive:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    name: Keep Render Backend Awake
    steps:
      - name: Ping Backend Health Endpoint
        run: |
          echo "🔄 Pinging backend to keep it awake..."
          BACKEND_URL="${BACKEND_URL:-https://your-backend-name.onrender.com}"
          echo "📍 Pinging: $BACKEND_URL/health"
          if curl -f -s --max-time 30 "$BACKEND_URL/health" > /dev/null; then
            echo "✅ Backend is awake and responding"
          else
            echo "⚠️  Backend ping failed - might be sleeping"
            if curl -f -s --max-time 30 "$BACKEND_URL/" > /dev/null; then
              echo "✅ Backend root endpoint is responding"
            else
              echo "❌ Backend appears to be down"
              exit 1
            fi
          fi
          echo "🕐 Ping completed at $(date)"
        env:
          BACKEND_URL: ${{ secrets.BACKEND_URL }}
      
      - name: Log Success
        if: success()
        run: |
          echo "🎉 Backend keep-alive ping successful"
          echo "⏰ Next ping in ~10 minutes"
      
      - name: Log Failure
        if: failure()
        run: |
          echo "💥 Backend keep-alive ping failed"
          echo "🔍 Check your backend service on Render"

  # Deploy Frontend to GitHub Pages (Runs on push/PR)
  deploy-frontend:
    if: github.event_name != 'schedule'
    runs-on: ubuntu-latest
    name: Deploy Frontend to GitHub Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build with Next.js
        run: |
          cd frontend
          npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.BACKEND_URL }}
          NEXT_PUBLIC_APP_NAME: AgentGPT
          NEXT_PUBLIC_APP_VERSION: 1.0.0
          NODE_ENV: production
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/out

  # Deploy to GitHub Pages
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: deploy-frontend
    if: github.event_name != 'schedule'
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF
        print_success "Created GitHub Actions deployment workflow"
    fi
    
    print_status "GitHub Actions setup completed"
    print_warning "Remember to:"
    print_warning "1. Add BACKEND_URL secret in your GitHub repository settings"
    print_warning "2. Update the default URL in the workflow file"
    print_warning "3. Enable GitHub Pages in your repository settings"
    print_warning "4. Set GitHub Pages source to 'GitHub Actions'"
}

# Main execution
main() {
    echo "🎯 AgentGPT Deployment Preparation"
    echo "=================================="
    
    check_requirements
    setup_backend
    setup_frontend
    test_application
    test_docker
    create_production_build
    generate_deployment_files
    setup_github_actions
    
    echo ""
    echo "🎉 Deployment preparation completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update backend/.env with your API keys"
    echo "2. Update frontend/.env.local with your production backend URL"
    echo "3. Test locally: docker-compose up"
    echo "4. Deploy to your chosen platform"
    echo "5. Set up GitHub Actions secrets for backend keep-alive"
    echo "6. Enable GitHub Pages in repository settings"
    echo ""
    echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"
    echo "🐳 For local testing: docker-compose up"
    echo "🔄 GitHub Actions will keep your Render backend awake every 10 minutes"
    echo "🌐 Frontend will be deployed to GitHub Pages automatically"
}

# Run main function
main "$@"
