# Resume Battle 2.0 — AWS Service Roadmap & Cloud Integration Guide

This document defines the precise integration strategy for Amazon Web Services (AWS). It categorizes every relevant service, documents existing code adapters, details configuration prerequisites, and outlines cost considerations.

---

## 1. Service Status Matrix

| AWS Service | Category | Current Status | Integration Role in Resume Battle 2.0 |
| :--- | :--- | :--- | :--- |
| **Amazon S3** | Storage | **Adapter implemented but not connected to AWS** | Stores uploaded resumes and project documents with SSE-S3/KMS encryption and presigned URLs. (`S3StorageService` in `app.services.storage`) |
| **Amazon Bedrock** | AI & ML | **Adapter implemented but not connected to AWS** | Generates foundation-model-assisted evaluations and mock questions via Anthropic Claude 3 / Titan. (`BedrockAIProvider` in `app.services.ai`) |
| **Amazon RDS (PostgreSQL)** | Database | **Adapter implemented but not connected to AWS** | Production relational database via SQLAlchemy connection string (`DATABASE_URL=postgresql://...`). |
| **Amazon EC2** | Compute | **Planned integration** | Primary virtual machine hosting running Gunicorn + Nginx behind Application Load Balancer. |
| **Amazon ECS / AWS Fargate**| Compute | **Planned integration** | Containerized microservice hosting using the provided multi-stage `Dockerfile`. |
| **AWS Lambda** | Compute | **Planned integration** | Event-driven document parsing and text extraction triggered by S3 `ObjectCreated` events. |
| **AWS SQS** | Messaging | **Adapter implemented but not connected to AWS** | Background analysis queue backing `app.services.jobs.AWSJobService`. |
| **Amazon CloudWatch** | Monitoring | **Adapter implemented but not connected to AWS** | Application telemetry logs, alarm thresholds, and API latency metrics. |
| **AWS Application Load Balancer (ALB)**| Networking | **Planned integration** | High-availability traffic distribution with SSL termination and `/api/health` health checks. |
| **Amazon CloudFront** | CDN | **Planned integration** | Global edge caching of static React frontend assets (`/dist`) with custom domain via Route 53. |
| **Amazon Route 53** | DNS | **Planned integration** | Domain routing, latency-based routing, and SSL certificate validation. |
| **AWS IAM** | Security | **Planned integration** | Least-privilege IAM instance roles for EC2/ECS without hardcoded credentials. |
| **AWS WAF** | Security | **Planned integration** | Web Application Firewall protecting API endpoints against DDoS, SQL injection, and rate abuse. |
| **AWS Secrets Manager** | Security | **Planned integration** | Dynamic secret injection for `SECRET_KEY`, `JWT_SECRET_KEY`, and database passwords. |
| **Amazon Aurora PostgreSQL** | Database | **Optional experiment** | Managed high-performance multi-AZ relational database alternative to RDS. |
| **Amazon DynamoDB** | Database | **Optional experiment** | Low-latency key-value session cache and WebSocket connection state tracking. |
| **Amazon S3 Glacier** | Archival | **Optional experiment** | Automatic lifecycle retention policy for archiving resumes older than 365 days. |
| **Amazon SageMaker** | AI & ML | **Optional experiment** | Custom fine-tuned resume scoring model experiment for domain-specific technical taxonomies. |
| **Amazon EKS (Kubernetes)** | Compute | **Optional experiment** | Advanced container orchestration if horizontal autoscaling across multi-region clusters is required. |
| **AWS Elastic Beanstalk** | Compute | **Optional experiment** | Managed PaaS deployment alternative for rapid prototype environments. |
| **Amazon EFS / FSx** | Storage | **Not applicable to current workload** | Dedicated network shared filesystems are redundant since S3 handles object storage. |
| **Amazon Inspector** | Security | **Optional experiment** | Automated vulnerability scanning for EC2 instances and ECR container images. |

---

## 2. Activating Configured AWS Adapters

Once AWS credentials and resources are provisioned, switch from local implementations to AWS services using environment variables without modifying application code:

### S3 Storage Activation
Set in `.env`:
```bash
STORAGE_BACKEND=s3
AWS_REGION=us-east-1
S3_BUCKET_NAME=my-production-resume-battle-bucket
```
The application will automatically initialize `S3StorageService` using Boto3, stream uploads to S3 with `AES256` server-side encryption, and generate secure temporary presigned download URLs.

### Amazon Bedrock AI Activation
Set in `.env`:
```bash
AI_PROVIDER=bedrock
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```
If AWS Bedrock credentials are unavailable, `BedrockAIProvider` automatically falls back to `LocalDeterministicAIProvider` to prevent user-facing errors.

### Production PostgreSQL (RDS or Aurora)
Set in `.env`:
```bash
DATABASE_URL=postgresql://resume_user:SuperSecretPassword123!@resume-db.c123456789.us-east-1.rds.amazonaws.com:5432/resume_battle_prod
```

---

## 3. Estimated AWS Cost Considerations

| Service | Estimated Monthly Cost (Early SaaS / MVP) | Cost Optimization Strategy |
| :--- | :--- | :--- |
| **S3 Standard** | $0.50 – $3.00 / month | Lifecycle policy transitioning documents >90 days to S3 Infrequent Access or Glacier. |
| **RDS PostgreSQL (db.t4g.micro)** | ~$13.00 / month (or Free Tier) | Single-AZ deployment for dev/staging; automated nightly snapshots. |
| **Amazon Bedrock (Claude 3)** | Pay-per-token (~$0.003 / 1k input tokens) | Cache common evaluations; use deterministic local fallback for routine scoring. |
| **ECS on AWS Fargate** | ~$15.00 – $30.00 / month | Scale to 1 task during low traffic; autoscale based on CPU/Memory targets. |
| **Application Load Balancer** | ~$16.00 / month | Shared ALB across multiple environment paths or single CloudFront + ECS direct. |
