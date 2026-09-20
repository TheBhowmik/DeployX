<div align="center">
  <div style="display: inline-block; padding: 20px; background: linear-gradient(135deg, rgba(18,18,18,0.95), rgba(5,5,5,0.98)); border-radius: 36px; border: 1px solid rgba(251, 191, 36, 0.35); box-shadow: 0 0 50px rgba(251, 191, 36, 0.18), inset 0 0 25px rgba(251, 191, 36, 0.06);">
    <img src="https://github.com/user-attachments/assets/fa674678-b5db-460b-85fc-3f553d1ea59f" width="160" style="border-radius: 22px; box-shadow: 0 15px 35px rgba(0,0,0,0.9), 0 0 25px rgba(251, 191, 36, 0.35);" alt="DeployX Logo">
  </div>

  <h1 style="font-size: 42px; font-weight: 800; margin-top: 20px;">DeployX</h1>

  <p style="font-size: 18px; color: #a3a3a3; max-width: 650px; margin: 0 auto 20px auto;">
    A serverless, event-driven container deployment platform inspired by Vercel.<br>
    Ship your GitHub repositories to global edge storage instantly.
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/AWS_ECS_Fargate-ARM64-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS ECS">
    <img src="https://img.shields.io/badge/AWS_S3-Storage-569A31?style=for-the-badge&logo=amazons3&logoColor=white" alt="AWS S3">
    <img src="https://img.shields.io/badge/Aiven_Valkey-TLS-CC0000?style=for-the-badge&logo=redis&logoColor=white" alt="Valkey">
    <img src="https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License">
  </p>
</div>

---

## What is DeployX?

**DeployX** is a complete, production-grade serverless deployment platform built entirely from first principles. It is not a wrapper around existing CI/CD tools—every layer, from the event-driven API orchestration to the cloud builder workers and edge proxy routing, was designed and built for this system.

The core insight behind DeployX is the **"DeployX Pipeline"**: source code flows seamlessly from GitHub through an isolated AWS ECS Fargate worker, compiles into immutable assets, saves directly to global object storage, and serves dynamically via an edge reverse proxy.

---

## Architecture

DeployX uses a decoupled, event-driven microservices pattern communicating over high-performance TLS channels and WebSockets:

<img width="1266" height="558" alt="image" src="https://github.com/user-attachments/assets/6cff8fda-6c66-4773-97f0-0696503e35ec" />

---

## How it works

1. **Ingestion & Queueing:** The user submits a GitHub repository URL to the Express **API Server** (Port `9000`), which initializes a unique project session.
2. **Compute & Build:** The API server triggers an isolated, on-demand container task on **AWS ECS Fargate** (`build-server`), which clones the repository, builds the code, and compiles static assets (`dist/`, `index.html`, `style.css`, `script.js`).
3. **Telemetry & Streaming:** Real-time build logs stream from the container back through **Aiven Valkey (Redis Pub/Sub)** to the **Socket Server**, updating the React dashboard terminal instantly.
4. **Object Storage:** Compiled assets are uploaded directly to an **AWS S3 bucket** under `__outputs/{project_id}/`.
5. **Edge Routing:** Incoming subdomain requests (e.g., `p1.localhost:8000`) hit the **S3 Reverse Proxy** (Port `8000`), which dynamically intercepts and serves the project files from S3 with ultra-low latency.

---

## Environment Variables

Create a `.env` file inside your `api-server` and `build-server` directory with the following configuration:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
REDIS_URL=rediss://default:your_password@your-valkey-url.aivencloud.com:port?family=0
```

## Getting Started



### Prerequisites

* Node.js & npm installed locally

* Docker Desktop running (`--platform linux/arm64` compatible)

* AWS CLI configured with valid credentials (`aws configure`)

---

### Deploying the Build Worker to AWS ECR

Since the `build-server` runs on AWS ECS Fargate (ARM64), you need to build and push its Docker image to the AWS Elastic Container Registry (ECR).

#### 1. Build, Tag, and Push the Image
```bash
# 1. Authenticate Docker to your AWS ECR registry
aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com

# 2. Build the ARM64 Docker Image
cd build-server
docker build --platform linux/arm64 -t <image-name> .

# 3. Tag the Image for your ECR Repository
docker tag <image-name> <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/<image-name>

# 4. Push the Image to AWS ECR
docker push <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/<image-name>

```



### Quick Start (Local Development)



#### 1. Start the S3 Server Proxy

```bash 

cd s3-server-proxy

npm install

node index.js

```



#### 2. Start the API & Socket Server

```bash

cd api-server

npm install

node index.js

```

#### 3. Start the React Frontend Dashboard

```bash

cd deployx-frontend

npm install

npm run dev

```
