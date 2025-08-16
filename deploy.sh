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
    
    echo ""
    echo "🎉 Deployment preparation completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update backend/.env with your API keys"
    echo "2. Update frontend/.env.local with your production backend URL"
    echo "3. Test locally: docker-compose up"
    echo "4. Deploy to your chosen platform"
    echo ""
    echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"
    echo "🐳 For local testing: docker-compose up"
}

# Run main function
main "$@"
