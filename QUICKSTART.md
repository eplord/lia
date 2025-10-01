# 🚀 Quick Start Guide

Welcome to Lia development! This guide will get you up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 14+** or **Docker** (recommended)
- **Git**

## 🏁 Quick Start (Recommended)

### Option 1: Docker (Easiest)

```bash
# 1. Clone the repository
git clone https://github.com/lia/lia.git
cd lia

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start all services with Docker
npm run docker:dev

# This starts:
# - PostgreSQL on port 5432
# - Redis on port 6379
# - Meilisearch on port 7700
# - MinIO on ports 9000 & 9001
# - Mailhog on ports 1025 & 8025

# 5. In a new terminal, set up the database
npm run db:setup

# 6. Start the development server
npm run dev
```

Visit:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Meilisearch**: http://localhost:7700
- **Mailhog**: http://localhost:8025

### Option 2: Manual Setup

```bash
# 1. Clone and install
git clone https://github.com/lia/lia.git
cd lia
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Start PostgreSQL (if not running)
# Windows: Start from Services
# Mac: brew services start postgresql@14
# Linux: sudo systemctl start postgresql

# 4. Set up database
npm run db:setup

# 5. Start development
npm run dev
```

## 📝 Default Login Credentials

After seeding, you can log in with:

- **Admin**: `admin@lia.dev` / `admin123`
- **Demo**: `demo@lia.dev` / `demo123`

## 🛠️ Available Commands

### Development

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only (port 5173)
npm run dev:backend      # Start backend only (port 3000)
```

### Database

```bash
npm run db:setup         # Generate Prisma client, migrate, and seed
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database (⚠️ deletes all data)
npm run prisma:studio    # Open Prisma Studio (database GUI)
```

### Building

```bash
npm run build            # Build frontend and backend
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only
npm start                # Run production build
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking
```

### Testing

```bash
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Open Vitest UI
```

### Docker

```bash
npm run docker:dev       # Start development environment
npm run docker:prod      # Start production environment
npm run docker:build     # Build Docker image
```

## 📂 Project Structure

```
lia/
├── src/
│   ├── client/          # Frontend React app
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utility functions
│   │   ├── App.tsx      # Main App component
│   │   ├── main.tsx     # Entry point
│   │   └── index.css    # Global styles
│   ├── server/          # Backend Express app
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   ├── services/    # Business logic
│   │   ├── lib/         # Server utilities
│   │   └── index.ts     # Server entry point
│   └── types/           # Shared TypeScript types
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
├── docs/                # Documentation
├── .github/             # GitHub templates
├── .claude/             # Claude AI instructions
└── ... config files
```

## 🔧 Configuration

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://lia:password@localhost:5432/lia

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here

# AI Features (optional)
OPENAI_API_KEY=sk-...
ENABLE_LOCAL_AI=true
OLLAMA_URL=http://localhost:11434
```

See `.env.example` for all available options.

## 🐛 Troubleshooting

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>
```

### Database connection error

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# If using Docker
docker ps | grep postgres
docker logs lia-dev-postgres
```

### Cannot find module errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma errors

```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset and rebuild
npm run db:reset
npm run db:setup
```

## 📚 Next Steps

1. **Read the documentation**: Check out the [docs](./docs) folder
2. **Explore the code**: Start with `src/client/App.tsx` and `src/server/index.ts`
3. **Make your first change**: Edit a component and see it hot reload
4. **Add a feature**: Check [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines
5. **Join the community**: Discord, GitHub Discussions

## 💡 Tips

- **Hot Reload**: Changes to frontend code reload automatically
- **API Testing**: Use http://localhost:3000/health to check backend
- **Database GUI**: Run `npm run prisma:studio` for visual database access
- **Logs**: Backend logs appear in the terminal where you ran `npm run dev`
- **Extensions**: Install recommended VS Code extensions for better DX

## 🆘 Need Help?

- **Documentation**: Check the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/lia/lia/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lia/lia/discussions)
- **Discord**: [Join our community](https://discord.gg/lia)

## ✅ Verify Setup

After setup, verify everything works:

1. **Backend**: Visit http://localhost:3000/health - should return `{"status":"ok"}`
2. **Frontend**: Visit http://localhost:5173 - should see "Welcome to Lia"
3. **Database**: Run `npm run prisma:studio` - should open database GUI
4. **Tests**: Run `npm test` - should pass (or show no tests yet)

---

**Happy coding! 🎉**

Need help? Check the [Installation Guide](docs/INSTALL.md) for detailed instructions.
