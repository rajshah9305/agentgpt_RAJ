#!/usr/bin/env python3
"""
Local test script for AgentGPT backend
Run this to verify everything works before deployment
"""

import asyncio
import httpx
import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

async def test_backend():
    """Test the backend endpoints locally"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing AgentGPT Backend...")
    print("=" * 50)
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Test health endpoint
            print("1. Testing health endpoint...")
            response = await client.get(f"{base_url}/health")
            if response.status_code == 200:
                print("✅ Health check passed")
                print(f"   Response: {response.json()}")
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
            
            # Test root endpoint
            print("\n2. Testing root endpoint...")
            response = await client.get(f"{base_url}/")
            if response.status_code == 200:
                print("✅ Root endpoint working")
                print(f"   Response: {response.json()}")
            else:
                print(f"❌ Root endpoint failed: {response.status_code}")
                return False
            
            # Test providers endpoint
            print("\n3. Testing providers endpoint...")
            response = await client.get(f"{base_url}/providers")
            if response.status_code == 200:
                print("✅ Providers endpoint working")
                providers = response.json()
                print(f"   Available providers: {list(providers.keys())}")
            else:
                print(f"❌ Providers endpoint failed: {response.status_code}")
                return False
            
            print("\n🎉 All tests passed! Backend is ready for deployment.")
            return True
            
        except httpx.ConnectError:
            print("❌ Could not connect to backend. Make sure it's running on localhost:8000")
            print("   Start the backend with: uvicorn main:app --host 0.0.0.0 --port 8000")
            return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False

def test_imports():
    """Test that all required packages can be imported"""
    print("📦 Testing package imports...")
    
    try:
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import pydantic
        print(f"✅ Pydantic {pydantic.__version__}")
    except ImportError as e:
        print(f"❌ Pydantic import failed: {e}")
        return False
    
    try:
        import httpx
        print(f"✅ HTTPX {httpx.__version__}")
    except ImportError as e:
        print(f"❌ HTTPX import failed: {e}")
        return False
    
    try:
        import uvicorn
        print(f"✅ Uvicorn {uvicorn.__version__}")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False
    
    print("✅ All packages imported successfully")
    return True

def main():
    """Main test function"""
    print("🚀 AgentGPT Backend Local Test")
    print("=" * 50)
    
    # Test imports first
    if not test_imports():
        print("\n❌ Package import tests failed. Check your requirements.txt")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    
    # Test backend endpoints
    if asyncio.run(test_backend()):
        print("\n🎯 Backend is ready for deployment!")
        print("\nNext steps:")
        print("1. Commit and push your changes")
        print("2. Deploy to Render using the updated requirements")
        print("3. Set environment variables in Render dashboard")
        print("4. Monitor the deployment logs")
    else:
        print("\n❌ Backend tests failed. Fix issues before deployment.")
        sys.exit(1)

if __name__ == "__main__":
    main()
