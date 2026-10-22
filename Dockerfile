# -------------------------------------------------------------
# Multi-stage Dockerfile for Resume Battle 2.0
# Ready for AWS ECS / Fargate / EC2 / Beanstalk deployment
# -------------------------------------------------------------

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend & Static Serving
FROM python:3.11-slim AS production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000 \
    FLASK_ENV=production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY backend/ ./backend/
COPY docs/ ./docs/

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend_dist

# Create unprivileged user for security
RUN useradd -m -u 1001 appuser && \
    mkdir -p /app/backend/storage_uploads && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 5000

# Healthcheck for ALB / ECS container monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

WORKDIR /app/backend
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "run:app"]
