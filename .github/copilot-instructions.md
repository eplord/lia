# GitHub Copilot Instructions for Lia

This document provides context and instructions for GitHub Copilot when working on the Lia project.

## Project Overview

**Lia** is an AI-powered knowledge management system that combines bookmark management, tab organization, screenshot tools, reader functionality, and PDF annotation. It's built as a self-hosted solution with privacy and intelligence at its core.

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand or Redux Toolkit
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express or Fastify
- **Language**: TypeScript
- **ORM**: Prisma or TypeORM
- **Validation**: Zod or Joi
- **Authentication**: Passport.js or custom JWT

### Database
- **Primary**: PostgreSQL 14+
- **Alternative**: MongoDB 5+
- **Cache**: Redis 7+
- **Search**: Meilisearch or Elasticsearch

### AI Integration
- **OpenAI**: GPT-4 for tagging and summarization
- **Local Models**: Ollama for privacy-conscious users
- **OCR**: Tesseract.js or similar

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest, Vitest, React Testing Library
- **Linting**: ESLint, Prettier

## Code Style Guidelines

### TypeScript

```typescript
// Use explicit types, avoid 'any'
interface BookmarkData {
  id: string;
  title: string;
  url: string;
  tags: string[];
  createdAt: Date;
}

// Use arrow functions for components
export const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark }) => {
  // Component logic
};

// Use async/await, not .then()
async function fetchBookmarks(): Promise<Bookmark[]> {
  try {
    const response = await api.get('/bookmarks');
    return response.data;
  } catch (error) {
    handleError(error);
    return [];
  }
}
```

### React Components

```typescript
// Component structure
import React from 'react';
import { useState, useEffect } from 'react';

interface ComponentProps {
  // Props with JSDoc comments
  /** The bookmark to display */
  bookmark: Bookmark;
  /** Callback when bookmark is clicked */
  onClick?: (id: string) => void;
}

export const Component: React.FC<ComponentProps> = ({
  bookmark,
  onClick
}) => {
  // 1. Hooks
  const [isLoading, setIsLoading] = useState(false);

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 3. Handlers
  const handleClick = () => {
    onClick?.(bookmark.id);
  };

  // 4. Render
  return (
    <div className="p-4 rounded-lg border">
      {/* JSX */}
    </div>
  );
};
```

### API Routes

```typescript
// Express-style route handler
import { Router } from 'express';
import { authenticate, validate } from '@/middleware';
import { createBookmarkSchema } from '@/schemas';

const router = Router();

router.post(
  '/bookmarks',
  authenticate,
  validate(createBookmarkSchema),
  async (req, res, next) => {
    try {
      const bookmark = await bookmarkService.create(req.body);
      res.status(201).json({ data: bookmark });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

### Database Models (Prisma)

```prisma
model Bookmark {
  id          String   @id @default(cuid())
  title       String
  url         String
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  tags        Tag[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([createdAt])
}
```

## Architecture Patterns

### Folder Structure

```
src/
├── api/              # API routes
│   ├── bookmarks/
│   ├── collections/
│   └── users/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── features/    # Feature-specific components
│   └── layouts/     # Layout components
├── hooks/           # Custom React hooks
├── lib/             # Third-party library configurations
├── services/        # Business logic layer
├── stores/          # State management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── config/          # Configuration files
```

### Service Layer Pattern

```typescript
// services/bookmark.service.ts
export class BookmarkService {
  async create(data: CreateBookmarkDto): Promise<Bookmark> {
    // 1. Validate data
    const validated = createBookmarkSchema.parse(data);

    // 2. Fetch metadata
    const metadata = await this.fetchMetadata(validated.url);

    // 3. AI tagging (if enabled)
    const tags = await this.generateTags(metadata);

    // 4. Save to database
    const bookmark = await db.bookmark.create({
      data: { ...validated, ...metadata, tags }
    });

    // 5. Background tasks
    await queue.add('archive-page', { bookmarkId: bookmark.id });

    return bookmark;
  }

  private async fetchMetadata(url: string) {
    // Implementation
  }

  private async generateTags(metadata: any) {
    // AI tagging logic
  }
}
```

### Error Handling

```typescript
// Use custom error classes
export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Global error handler middleware
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(err);

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

## AI Integration Guidelines

### OpenAI Integration

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateTags(content: string): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates relevant tags for bookmarks.'
      },
      {
        role: 'user',
        content: `Generate 3-5 relevant tags for this content:\n\n${content}`
      }
    ],
    temperature: 0.7,
  });

  // Parse and return tags
  return parseTags(completion.choices[0].message.content);
}
```

### Ollama Integration (Local Models)

```typescript
async function generateTagsLocally(content: string): Promise<string[]> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt: `Generate relevant tags for: ${content}`,
      stream: false
    })
  });

  const data = await response.json();
  return parseTags(data.response);
}
```

## Testing Guidelines

### Unit Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { BookmarkService } from './bookmark.service';

describe('BookmarkService', () => {
  let service: BookmarkService;

  beforeEach(() => {
    service = new BookmarkService();
  });

  it('should create a bookmark with metadata', async () => {
    const data = { url: 'https://example.com', title: 'Test' };
    const bookmark = await service.create(data);

    expect(bookmark).toHaveProperty('id');
    expect(bookmark.title).toBe('Test');
  });
});
```

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BookmarkCard } from './BookmarkCard';

describe('BookmarkCard', () => {
  it('should render bookmark data', () => {
    const bookmark = { id: '1', title: 'Test', url: 'https://test.com' };
    render(<BookmarkCard bookmark={bookmark} />);

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    const bookmark = { id: '1', title: 'Test', url: 'https://test.com' };

    render(<BookmarkCard bookmark={bookmark} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledWith('1');
  });
});
```

## Security Best Practices

### Authentication

```typescript
// Always verify JWT tokens
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Input Validation

```typescript
import { z } from 'zod';

// Define schemas for all inputs
export const createBookmarkSchema = z.object({
  title: z.string().min(1).max(500),
  url: z.string().url(),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string()).max(20).optional(),
  collectionId: z.string().cuid().optional(),
});

// Use middleware to validate
export const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: error.errors });
    }
  };
};
```

### Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href']
  });
}
```

## Performance Optimization

### Database Queries

```typescript
// Use indexes for frequently queried fields
// Limit results and paginate
// Use select to fetch only needed fields

async function getBookmarks(userId: string, page = 1, limit = 20) {
  return await db.bookmark.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      url: true,
      createdAt: true,
      tags: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

### Caching

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Check cache
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Fetch and cache
  const data = await fetcher();
  await redis.setex(key, 3600, JSON.stringify(data));

  return data;
}
```

## Common Patterns for Copilot

When suggesting code:
1. **Use TypeScript** with proper types
2. **Follow error handling** patterns with try-catch
3. **Add JSDoc comments** for functions and complex logic
4. **Use async/await** instead of promises
5. **Validate inputs** before processing
6. **Log important events** for debugging
7. **Handle edge cases** gracefully
8. **Write testable code** with dependency injection
9. **Use environment variables** for configuration
10. **Follow REST API conventions** for endpoints

## Feature-Specific Guidelines

### Bookmark Creation Flow
1. Validate URL format
2. Fetch page metadata (title, description, favicon)
3. Extract keywords for AI tagging (if enabled)
4. Save to database with transaction
5. Queue background jobs (archival, screenshot)
6. Return success response

### Collection Management
- Collections can have sub-collections (nested)
- Users can have private and shared collections
- Permissions: owner, editor, viewer
- Soft delete for safety

### Search Implementation
- Full-text search across title, description, content
- Filter by tags, collections, date range
- Support for semantic search with embeddings
- Cache frequent searches

### AI Tagging
- Check if AI is enabled in user settings
- Use cached results when possible
- Fallback to keyword extraction if AI fails
- Allow manual tag override

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lia
REDIS_URL=redis://localhost:6379

# AI
OPENAI_API_KEY=sk-...
ENABLE_LOCAL_AI=true
OLLAMA_URL=http://localhost:11434

# Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=lia

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=another-secret

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/)

---

**Note**: This guide helps GitHub Copilot understand the Lia project structure and conventions. Update this file as the project evolves.
