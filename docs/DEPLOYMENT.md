# Resume Battle 2.0 — Production & AWS Deployment Guide

This document outlines deployment architectures supported by the application.

---

## 1. Containerized Deployment (AWS ECS / Fargate)

The repository provides a multi-stage `Dockerfile` that compiles frontend production assets and bundles them alongside the Python Gunicorn application server.

### Build and Run with Docker
```bash
# Build production image
docker build -t resume-battle-2:latest .

# Run container locally on port 5000
docker run -p 5000:5000 \
  -e SECRET_KEY="your-production-secret-key" \
  -e STORAGE_BACKEND="local" \
  resume-battle-2:latest
```

### AWS ECS / Fargate Deployment Steps:
1. Push image to Amazon Elastic Container Registry (ECR).
2. Create an ECS Cluster and Fargate Task Definition referencing the ECR image.
3. Configure Task Execution IAM Role with permissions for S3 (`s3:PutObject`, `s3:GetObject`) and Bedrock (`bedrock:InvokeModel`).
4. Provision an Application Load Balancer (ALB) pointing to target port 5000 with health check path `/api/health`.

---

## 2. Amazon EC2 Deployment (Gunicorn + Nginx)

1. **Launch EC2 Instance**: Amazon Linux 2023 or Ubuntu 22.04 LTS (t3.small or t3.medium).
2. **Assign IAM Role**: Attach instance profile with S3 and CloudWatch permissions.
3. **Setup Nginx Reverse Proxy**:
   ```nginx
   server {
       listen 80;
       server_name arena.resumebattle.io;

       location / {
           root /var/www/resume-battle/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. **Run Gunicorn as a systemd service**:
   ```ini
   [Unit]
   Description=Resume Battle 2.0 Gunicorn Service
   After=network.target

   [Service]
   User=appuser
   WorkingDirectory=/var/www/resume-battle/backend
   ExecStart=/var/www/resume-battle/backend/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:5000 run:app
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

---

## 3. ALB Health & Readiness Probes

The application provides two dedicated monitoring endpoints:
- `GET /api/health`: Validates worker status, returns HTTP 200 with active service version.
- `GET /api/ready`: Tests database connectivity with `SELECT 1`. Returns 200 if connected; 503 if database is unreachable.
