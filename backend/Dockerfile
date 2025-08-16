FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files for better caching
# Try minimal requirements first, then ultra-safe, then render-specific, then main
COPY requirements-minimal.txt requirements.txt
COPY requirements-render-safe.txt requirements-render-safe.txt
COPY requirements-render.txt requirements-render.txt
COPY requirements.txt requirements-main.txt

# Install Python dependencies with multiple fallbacks
RUN if [ -f requirements.txt ]; then \
        echo "Installing minimal requirements..." && \
        pip install --no-cache-dir -r requirements.txt; \
    elif [ -f requirements-render-safe.txt ]; then \
        echo "Installing ultra-safe requirements..." && \
        pip install --no-cache-dir -r requirements-render-safe.txt; \
    elif [ -f requirements-render.txt ]; then \
        echo "Installing render-specific requirements..." && \
        pip install --no-cache-dir -r requirements-render.txt; \
    else \
        echo "Installing main requirements..." && \
        pip install --no-cache-dir -r requirements-main.txt; \
    fi

# Copy application code
COPY . .

# Create data and logs directories
RUN mkdir -p data logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
