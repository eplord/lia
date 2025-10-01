# Installation Guide

This guide will help you install and set up Lia on your system.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Installation](#manual-installation)
- [Configuration](#configuration)
- [First Run](#first-run)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Minimum:**
- 2 CPU cores
- 2GB RAM
- 10GB storage
- Linux/Windows/macOS

**Recommended:**
- 4+ CPU cores
- 4GB+ RAM
- 20GB+ storage (more if archiving videos)

### Software Requirements

**Option 1: Docker (Recommended)**
- Docker 20.10+
- Docker Compose 2.0+

**Option 2: Manual Installation**
- Node.js 18+
- PostgreSQL 14+ or MongoDB 5+
- Redis 7+ (optional but recommended)
- Git

## Quick Start with Docker

The fastest way to get Lia running is with Docker Compose.

### 1. Clone the Repository

```bash
git clone https://github.com/lia/lia.git
cd lia
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set required values (see [Configuration](#configuration))

### 3. Start Services

```bash
docker-compose up -d
```

This will start:
- Lia web application
- PostgreSQL database
- Redis cache
- Meilisearch (search engine)
- MinIO (object storage)

### 4. Access Lia

Open your browser and navigate to:
- **Web App**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (admin/adminpassword)
- **Meilisearch**: http://localhost:7700

### 5. Create Admin Account

On first visit, you'll be prompted to create an admin account.

## Manual Installation

For more control or development purposes, you can install Lia manually.

### 1. Install Node.js

**Using nvm (recommended):**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 18
nvm install 18
nvm use 18
```

**Or download from:** https://nodejs.org/

### 2. Install PostgreSQL

**Windows:**
Download from https://www.postgresql.org/download/windows/

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-14 postgresql-contrib
sudo systemctl start postgresql
```

**Create Database:**
```bash
sudo -u postgres psql
CREATE DATABASE lia;
CREATE USER lia_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lia TO lia_user;
\q
```

### 3. Install Redis (Optional)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
Use WSL or download from https://redis.io/

### 4. Install Meilisearch (Optional)

**Using curl:**
```bash
curl -L https://install.meilisearch.com | sh
```

**Or download from:** https://www.meilisearch.com/docs/learn/getting_started/quick_start

### 5. Clone and Install Lia

```bash
# Clone repository
git clone https://github.com/lia/lia.git
cd lia

# Install dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

### 6. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Application
NODE_ENV=production
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://lia_user:your_password@localhost:5432/lia

# Redis (optional)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=another-very-long-random-secret-key

# Storage (local or S3)
STORAGE_DRIVER=local
STORAGE_PATH=./storage

# Or for S3:
# STORAGE_DRIVER=s3
# S3_ENDPOINT=https://s3.amazonaws.com
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key
# S3_BUCKET=lia-storage
# S3_REGION=us-east-1

# Search (optional)
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=your-master-key

# AI Features (optional)
ENABLE_AI_FEATURES=true
OPENAI_API_KEY=sk-your-openai-api-key

# Or use local models
ENABLE_LOCAL_AI=true
OLLAMA_URL=http://localhost:11434

# Features
ENABLE_OCR=true
ENABLE_VIDEO_ARCHIVAL=true
ENABLE_WAYBACK_MACHINE=false
```

### 7. Set Up Database

```bash
# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 8. Build Application

```bash
npm run build
```

### 9. Start Application

```bash
# Production mode
npm start

# Or with PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js
```

### 10. Set Up Reverse Proxy (Recommended)

**Using Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 100M;
}
```

**Enable SSL with Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Configuration

### Essential Settings

**Database URL Format:**
```
postgresql://username:password@host:port/database
# Example: postgresql://lia:pass123@localhost:5432/lia
```

**Generate Secure Secrets:**
```bash
# Generate random secrets
openssl rand -base64 32
```

### Storage Options

**Local Storage:**
```env
STORAGE_DRIVER=local
STORAGE_PATH=./storage
```

**AWS S3:**
```env
STORAGE_DRIVER=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET=my-lia-bucket
S3_REGION=us-east-1
```

**MinIO (Self-hosted):**
```env
STORAGE_DRIVER=s3
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=lia
S3_REGION=us-east-1
```

### AI Configuration

**OpenAI:**
```env
ENABLE_AI_FEATURES=true
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

**Ollama (Local):**
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2

# Configure in .env
ENABLE_LOCAL_AI=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## First Run

### Create Admin Account

1. Navigate to http://localhost:3000
2. Click "Get Started"
3. Fill in admin details:
   - Username
   - Email
   - Password
4. Click "Create Account"

### Configure Settings

1. Go to **Settings** → **General**
2. Configure:
   - Site name
   - Site URL
   - Timezone
   - Language

### Install Browser Extension

1. **Chrome/Edge**: [Download from Chrome Web Store](#)
2. **Firefox**: [Download from Firefox Add-ons](#)
3. Configure extension with your instance URL and API key

### Mobile Apps

1. **iOS**: [Download from App Store](#)
2. **Android**: [Download from Play Store](#)
3. Configure with your instance URL

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection
psql -h localhost -U lia_user -d lia
```

**Error: "Authentication failed"**

Check your `.env` DATABASE_URL matches your PostgreSQL credentials.

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
sudo systemctl start redis
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Permission Errors

```bash
# Fix storage permissions
chmod -R 755 storage/
chown -R $USER:$USER storage/
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Database Migration Failures

```bash
# Reset database (⚠️ Warning: This deletes all data!)
npm run db:reset

# Or manually fix:
npm run db:migrate:rollback
npm run db:migrate
```

## Updating Lia

### Docker Installation

```bash
cd lia
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Manual Installation

```bash
cd lia
git pull
npm install
npm run db:migrate  # Run new migrations
npm run build
pm2 restart lia  # Or restart your process
```

## Backup and Restore

### Backup Database

```bash
# PostgreSQL
pg_dump -U lia_user -d lia > backup-$(date +%Y%m%d).sql

# Or use npm script
npm run db:backup
```

### Restore Database

```bash
# PostgreSQL
psql -U lia_user -d lia < backup-20240101.sql

# Or use npm script
npm run db:restore -- backup-20240101.sql
```

### Backup Files

```bash
# Backup storage directory
tar -czf storage-backup-$(date +%Y%m%d).tar.gz storage/

# Or use npm script
npm run backup:files
```

## Getting Help

- **Documentation**: https://docs.lia.dev
- **Discord**: https://discord.gg/lia
- **GitHub Issues**: https://github.com/lia/lia/issues
- **Discussions**: https://github.com/lia/lia/discussions

---

**Next Steps:**
- Read the [User Guide](USAGE.md)
- Check out [API Documentation](API.md)
- Join our [Community](https://discord.gg/lia)
