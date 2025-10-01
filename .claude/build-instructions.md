# Claude Build Instructions for Lia

This document provides comprehensive build and development instructions for the Lia project, specifically designed for Claude AI assistance.

## Project Context

**Lia** is an AI-powered knowledge management system that serves as a bookmark manager, tab organizer, screenshot tool, reader, and PDF annotator. It's designed to be self-hosted with a focus on privacy and intelligent content organization.

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Web App │  │ Browser  │  │  Mobile  │             │
│  │  (React) │  │Extension │  │   Apps   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                          │
                          │ REST API / WebSocket
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Node.js)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Authentication  │  Authorization  │  Validation │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Bookmarks    │   Collections   │    Search   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  Bookmark  │  │   AI/ML    │  │   Archival      │  │
│  │  Service   │  │  Service   │  │   Service       │  │
│  └────────────┘  └────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │ PostgreSQL │  │   Redis    │  │  Meilisearch    │  │
│  │  (Primary) │  │  (Cache)   │  │    (Search)     │  │
│  └────────────┘  └────────────┘  └─────────────────┘  │
│  ┌────────────┐  ┌────────────┐                       │
│  │    S3      │  │   Queue    │                       │
│  │ (Storage)  │  │ (BullMQ)   │                       │
│  └────────────┘  └────────────┘                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 External Services                        │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  OpenAI    │  │   Ollama   │  │  Wayback        │  │
│  │    API     │  │  (Local)   │  │   Machine       │  │
│  └────────────┘  └────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand/Redux Toolkit (state management)
- React Query (data fetching)
- React Router (routing)
- Radix UI (component primitives)

**Backend:**
- Node.js 18+ with TypeScript
- Express or Fastify (API framework)
- Prisma (ORM)
- Passport.js (authentication)
- Zod (validation)
- Bull/BullMQ (job queue)

**Database & Storage:**
- PostgreSQL 14+ (primary database)
- Redis 7+ (caching & sessions)
- Meilisearch (full-text search)
- S3-compatible storage (MinIO/AWS S3)

**AI/ML:**
- OpenAI GPT-4 API
- Ollama (local models)
- Tesseract.js (OCR)

## Development Setup

### Prerequisites Installation

```bash
# Node.js (via nvm - recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# PostgreSQL
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql@14
# Linux: sudo apt install postgresql-14

# Redis
# Windows: Use WSL or Docker
# Mac: brew install redis
# Linux: sudo apt install redis-server

# Docker & Docker Compose (optional but recommended)
# Download from https://docs.docker.com/get-docker/
```

### Project Setup

```bash
# 1. Clone the repository
git clone https://github.com/lia/lia.git
cd lia

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL
# - JWT_SECRET
# - OPENAI_API_KEY (if using AI features)

# 4. Initialize database
npm run db:setup          # Creates database and runs migrations
npm run db:seed           # (Optional) Seeds with sample data

# 5. Start development servers
npm run dev               # Starts both frontend and backend

# OR start separately:
npm run dev:frontend      # Frontend on http://localhost:5173
npm run dev:backend       # Backend on http://localhost:3000
```

### Docker Setup (Recommended for Development)

```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Services will be available at:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Meilisearch: http://localhost:7700
# - MinIO: http://localhost:9000

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Build Process

### Development Build

```bash
# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend

# Build everything
npm run build

# Output:
# - Frontend: dist/frontend/
# - Backend: dist/backend/
```

### Production Build

```bash
# Set NODE_ENV
export NODE_ENV=production

# Build optimized bundle
npm run build:prod

# Run production server
npm run start:prod
```

### Docker Production Build

```bash
# Build Docker image
docker build -t lia:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  --name lia \
  lia:latest

# Or use Docker Compose
docker-compose up -d
```

## Database Management

### Migrations

```bash
# Create a new migration
npm run db:migrate:create -- --name add_bookmarks_table

# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:rollback

# Reset database (⚠️ Deletes all data)
npm run db:reset
```

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio (visual database browser)
npm run prisma:studio

# Format schema file
npm run prisma:format

# Validate schema
npm run prisma:validate

# Seed database
npm run db:seed
```

### Backup & Restore

```bash
# Backup database
npm run db:backup

# Restore from backup
npm run db:restore -- backup-2024-01-01.sql

# Export user data
npm run db:export -- --user-id=USER_ID --output=export.json
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- src/services/bookmark.test.ts

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

### Test Structure

```
tests/
├── unit/              # Unit tests
│   ├── services/
│   ├── utils/
│   └── models/
├── integration/       # Integration tests
│   └── api/
├── e2e/              # End-to-end tests
│   └── flows/
└── fixtures/         # Test data
```

### Writing Tests

```typescript
// Unit test example
import { describe, it, expect, beforeEach } from 'vitest';
import { BookmarkService } from '@/services/bookmark.service';

describe('BookmarkService', () => {
  let service: BookmarkService;

  beforeEach(() => {
    service = new BookmarkService();
  });

  it('should create bookmark with metadata', async () => {
    const bookmark = await service.create({
      url: 'https://example.com',
      title: 'Test'
    });

    expect(bookmark).toMatchObject({
      url: 'https://example.com',
      title: 'Test'
    });
  });
});
```

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific files
npm run lint -- src/services/**/*.ts
```

### Formatting

```bash
# Check formatting
npm run format:check

# Format all files
npm run format

# Format specific directory
npm run format -- src/components/
```

### Type Checking

```bash
# Check types
npm run type-check

# Watch mode
npm run type-check:watch
```

## API Development

### Creating New Endpoints

```typescript
// 1. Define route in src/api/routes/
import { Router } from 'express';
import { authenticate, validate } from '@/middleware';
import { bookmarkController } from '@/controllers';
import { createBookmarkSchema } from '@/schemas';

const router = Router();

router.post(
  '/bookmarks',
  authenticate,
  validate(createBookmarkSchema),
  bookmarkController.create
);

export default router;

// 2. Implement controller in src/controllers/
export const bookmarkController = {
  async create(req, res, next) {
    try {
      const bookmark = await bookmarkService.create(req.body, req.user.id);
      res.status(201).json({ data: bookmark });
    } catch (error) {
      next(error);
    }
  }
};

// 3. Add service logic in src/services/
export class BookmarkService {
  async create(data: CreateBookmarkDto, userId: string) {
    // Fetch metadata
    const metadata = await this.fetchMetadata(data.url);

    // AI tagging (if enabled)
    const tags = await this.generateTags(metadata);

    // Save to database
    return await db.bookmark.create({
      data: { ...data, ...metadata, tags, userId }
    });
  }
}
```

### API Documentation

```bash
# Generate OpenAPI/Swagger docs
npm run docs:generate

# Serve documentation locally
npm run docs:serve
# Visit http://localhost:8080
```

## AI Integration

### OpenAI Setup

```typescript
// Configure in src/lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use in services
async function generateTags(content: string): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Generate tags for content' },
      { role: 'user', content }
    ],
  });

  return parseTags(completion.choices[0].message.content);
}
```

### Ollama Setup

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2

# Start Ollama server
ollama serve
```

```typescript
// Configure in src/lib/ollama.ts
export async function generateTagsLocal(content: string) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama2',
      prompt: content
    })
  });

  return await response.json();
}
```

## Deployment

### Environment Variables

```bash
# Production .env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/lia
REDIS_URL=redis://host:6379

# Security
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=another-secure-secret

# AI
OPENAI_API_KEY=sk-...
ENABLE_LOCAL_AI=false

# Storage
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=lia-production

# Search
MEILISEARCH_URL=http://meilisearch:7700
MEILISEARCH_API_KEY=...

# Features
ENABLE_AI_TAGGING=true
ENABLE_OCR=true
ENABLE_VIDEO_ARCHIVAL=true
```

### Deploy to VPS

```bash
# 1. Build locally
npm run build:prod

# 2. Copy to server
rsync -avz dist/ user@server:/var/www/lia/

# 3. SSH into server
ssh user@server

# 4. Set up service
sudo cp lia.service /etc/systemd/system/
sudo systemctl enable lia
sudo systemctl start lia

# 5. Set up Nginx reverse proxy
sudo cp nginx.conf /etc/nginx/sites-available/lia
sudo ln -s /etc/nginx/sites-available/lia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Deploy with Docker

```bash
# 1. Build image
docker build -t lia:latest .

# 2. Push to registry
docker tag lia:latest registry.example.com/lia:latest
docker push registry.example.com/lia:latest

# 3. Deploy
docker pull registry.example.com/lia:latest
docker-compose up -d
```

## Troubleshooting

### Common Issues

**Database connection fails:**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql $DATABASE_URL
```

**Redis connection fails:**
```bash
# Check Redis is running
redis-cli ping
# Should respond: PONG
```

**Build errors:**
```bash
# Clear caches and reinstall
rm -rf node_modules dist .vite
npm install
npm run build
```

**Port already in use:**
```bash
# Find process using port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

## Performance Optimization

### Database Optimization

```typescript
// Use database indexes
@@index([userId, createdAt])
@@index([url])

// Optimize queries
const bookmarks = await db.bookmark.findMany({
  where: { userId },
  select: { id: true, title: true, url: true }, // Only select needed fields
  take: 20, // Limit results
});

// Use query batching
const [bookmarks, count] = await Promise.all([
  db.bookmark.findMany({ where }),
  db.bookmark.count({ where })
]);
```

### Caching Strategy

```typescript
// Cache frequently accessed data
import { redis } from '@/lib/redis';

async function getCachedBookmarks(userId: string) {
  const cacheKey = `user:${userId}:bookmarks`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from DB
  const bookmarks = await db.bookmark.findMany({ where: { userId } });

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(bookmarks));

  return bookmarks;
}
```

### Frontend Optimization

```typescript
// Code splitting
const BookmarkModal = lazy(() => import('./BookmarkModal'));

// Memoization
const MemoizedBookmarkCard = memo(BookmarkCard);

// Virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual';
```

## Monitoring & Logging

### Logging Setup

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Use in code
logger.info('Bookmark created', { bookmarkId, userId });
logger.error('Failed to fetch metadata', { url, error });
```

### Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: await checkDatabase(),
    redis: await checkRedis(),
    storage: await checkStorage(),
  };

  res.json(health);
});
```

## Resources

- **Main Documentation**: `/docs` directory
- **API Reference**: Generated at `/docs/api`
- **Component Storybook**: `npm run storybook`
- **Database Schema**: `prisma/schema.prisma`
- **Environment Config**: `.env.example`

---

This build instruction guide should provide Claude with comprehensive context for assisting with the Lia project. Update as the project evolves.
