# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Cannot resolve Tailwind config" / "Cannot find module 'vite'"

**Cause**: Dependencies haven't been installed yet.

**Solution**:
```powershell
npm install
```

This installs all required packages including:
- tailwindcss
- vite
- react
- All other dependencies

**After installation**, the errors should disappear.

---

### ❌ TypeScript Errors: "Cannot find module 'X'"

**Cause**: Same as above - dependencies not installed.

**Solution**:
```powershell
npm install
```

Then restart VS Code or reload the TypeScript server:
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Press Enter

---

### ❌ "Cannot find name '__dirname'"

**Cause**: Using ES modules without defining `__dirname`.

**Solution**: Already fixed in `vite.config.ts`:
```typescript
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

---

### ❌ Database Connection Error

**Cause**: PostgreSQL not running or wrong credentials.

**Solution**:
```powershell
# Start Docker services
npm run docker:dev

# OR manually start PostgreSQL on Windows
# Then update DATABASE_URL in .env
```

---

### ❌ Port Already in Use

**Cause**: Another process is using port 3000 or 5173.

**Solution**:
```powershell
# Find process using port 3000 (backend)
netstat -ano | findstr :3000

# Find process using port 5173 (frontend)
netstat -ano | findstr :5173

# Kill process by PID
taskkill /PID <PID> /F
```

---

### ❌ Prisma Client Not Generated

**Cause**: Haven't run Prisma generation yet.

**Solution**:
```powershell
npm run prisma:generate
```

---

### ❌ ESLint/Prettier Errors

**Cause**: Configuration not loaded or dependencies missing.

**Solution**:
```powershell
# Install dependencies
npm install

# Manually fix formatting
npm run format

# Fix linting issues
npm run lint:fix
```

---

### ❌ Vite Build Fails

**Cause**: Missing environment variables or dependencies.

**Solution**:
```powershell
# Ensure .env exists
cp .env.example .env

# Clean and rebuild
npm run clean
npm install
npm run build
```

---

### ❌ Hot Reload Not Working

**Cause**: File watcher limit on Linux/WSL.

**Solution** (WSL/Linux):
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Solution** (Windows):
- Restart VS Code
- Restart Vite dev server

---

## 🚀 Quick Reset

If things are really broken, try this:

```powershell
# Clean everything
npm run clean

# Remove node_modules and lock file
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install

# Regenerate Prisma
npm run prisma:generate

# Restart dev server
npm run dev
```

---

## 📝 Still Having Issues?

1. **Check Node version**: `node --version` (should be 18+)
2. **Check npm version**: `npm --version` (should be 9+)
3. **Check logs**: Look at terminal output for specific errors
4. **Search issues**: Check GitHub issues for similar problems
5. **Ask for help**: Create a new issue with error details

---

## 🎯 Expected First-Time Setup Steps

If this is your first time setting up the project:

```powershell
# 1. Install dependencies (MOST IMPORTANT - DO THIS FIRST!)
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start Docker services (PostgreSQL, Redis, etc.)
npm run docker:dev

# 4. In a NEW terminal, set up database
npm run db:setup

# 5. Start development server
npm run dev
```

**Note**: Steps 1-4 only need to be done once. After that, just use `npm run dev`.

---

## 🔍 Verifying Installation

After `npm install`, verify everything is installed:

```powershell
# Check if tailwindcss is installed
npm list tailwindcss

# Check if vite is installed
npm list vite

# Check if all dependencies are installed
npm list --depth=0
```

You should see versions for all packages without errors.

---

## 💡 Pro Tips

- **Always run `npm install` first** when cloning or starting a new project
- Use `npm run` to see all available commands
- Check `package.json` for script definitions
- Restart VS Code if TypeScript errors persist after installing dependencies
- Use `npm run prisma:studio` to visually inspect your database

---

**Last Updated**: October 1, 2025
