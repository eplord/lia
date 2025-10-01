# 📦 GitHub Repository Setup Guide

This guide will help you create a GitHub repository and push your Lia project.

## 🚀 Quick Setup (Recommended)

### Option 1: Using GitHub CLI (gh)

If you have GitHub CLI installed:

```powershell
# Login to GitHub (if not already)
gh auth login

# Create repository and push
gh repo create lia --public --source=. --remote=origin --push

# Or for private repository
gh repo create lia --private --source=. --remote=origin --push
```

### Option 2: Using GitHub Web Interface

1. **Go to GitHub**: https://github.com/new
2. **Repository details**:
   - **Repository name**: `lia`
   - **Description**: `AI-powered knowledge management system for bookmarks, tabs, screenshots, and PDFs`
   - **Visibility**: Choose Public or Private
   - **DO NOT initialize with README, .gitignore, or license** (we already have these)
3. **Click "Create repository"**

4. **Push your code**:
   ```powershell
   # Add GitHub as remote (replace YOUR_USERNAME)
   git remote add origin https://github.com/YOUR_USERNAME/lia.git

   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

## 📋 Detailed Steps

### Step 1: Verify Your Commit

```powershell
# Check your commit
git log --oneline

# Should show: Initial commit: Complete Lia project structure...
```

### Step 2: Create GitHub Repository

**Via Web Interface**:
- Go to: https://github.com/new
- Repository name: `lia`
- Description: `AI-powered knowledge management system for bookmarks, tabs, screenshots, and PDFs`
- Choose visibility (Public recommended for open source)
- **Uncheck** all initialization options
- Click "Create repository"

**Via GitHub CLI**:
```powershell
# Install GitHub CLI if needed
# https://cli.github.com/

# Login
gh auth login

# Create public repo
gh repo create lia --public --description "AI-powered knowledge management system"

# Or create private repo
gh repo create lia --private --description "AI-powered knowledge management system"
```

### Step 3: Connect Local Repository to GitHub

```powershell
# Add GitHub as remote origin (replace YOUR_USERNAME with your actual username)
git remote add origin https://github.com/YOUR_USERNAME/lia.git

# Verify remote was added
git remote -v
```

### Step 4: Rename Branch to 'main' (if needed)

```powershell
# Check current branch name
git branch

# Rename to 'main' if it's 'master'
git branch -M main
```

### Step 5: Push to GitHub

```powershell
# Push your code
git push -u origin main
```

**If you get authentication errors**:
- Use a Personal Access Token (PAT) instead of password
- Or set up SSH keys

## 🔐 Authentication Setup

### Option A: Using Personal Access Token (PAT)

1. **Generate token**: https://github.com/settings/tokens/new
2. **Scopes needed**: `repo` (full control of private repositories)
3. **Use token as password** when pushing

```powershell
# When prompted for password, paste your PAT
git push -u origin main
```

### Option B: Using SSH Keys (Recommended)

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard

# Add to GitHub: https://github.com/settings/keys

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/lia.git

# Push
git push -u origin main
```

### Option C: Using GitHub CLI

```powershell
# Login (will handle authentication)
gh auth login

# Push
git push -u origin main
```

## ✅ Verify Upload

After pushing, verify your repository:

```powershell
# Open repository in browser
gh repo view --web

# Or visit manually
# https://github.com/YOUR_USERNAME/lia
```

You should see:
- ✅ All 42 files
- ✅ README.md displayed on homepage
- ✅ Complete project structure
- ✅ Documentation files

## 🎯 Post-Upload Tasks

### 1. Configure Repository Settings

Go to repository settings: `https://github.com/YOUR_USERNAME/lia/settings`

**General**:
- Add topics/tags: `bookmark-manager`, `ai`, `knowledge-management`, `react`, `typescript`
- Add website URL if deployed
- Enable/disable features (Wikis, Issues, Projects)

**Security**:
- Enable Dependabot alerts
- Enable secret scanning
- Review security policy

### 2. Set Up GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build
    - run: npm test
    - run: npm run lint
```

### 3. Add Repository Badges

Add to top of README.md:

```markdown
[![CI](https://github.com/YOUR_USERNAME/lia/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/lia/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
```

### 4. Enable GitHub Pages (for documentation)

If you want to host documentation:
- Go to Settings → Pages
- Source: Deploy from a branch
- Branch: `main` / `docs` folder
- Save

### 5. Configure Branch Protection

For production projects:
- Settings → Branches → Add rule
- Branch name pattern: `main`
- Enable: Require pull request reviews
- Enable: Require status checks to pass

## 🔄 Daily Workflow

After initial setup, your daily workflow:

```powershell
# Make changes to code
# ...

# Stage changes
git add .

# Commit with meaningful message
git commit -m "Add bookmark tagging feature"

# Push to GitHub
git push
```

## 🌿 Working with Branches

```powershell
# Create feature branch
git checkout -b feature/bookmark-search

# Make changes and commit
git add .
git commit -m "Implement bookmark search"

# Push branch
git push -u origin feature/bookmark-search

# Create pull request on GitHub
gh pr create --title "Add bookmark search" --body "Implements full-text search for bookmarks"
```

## 📊 Repository Statistics

Check your repo stats:

```powershell
# View repo info
gh repo view

# View recent activity
gh pr list
gh issue list

# View contributors
git shortlog -sn
```

## 🆘 Troubleshooting

### Error: "remote origin already exists"

```powershell
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/YOUR_USERNAME/lia.git
```

### Error: "failed to push some refs"

```powershell
# Pull first (if repo has changes)
git pull origin main --rebase

# Then push
git push -u origin main
```

### Error: "Authentication failed"

```powershell
# Use GitHub CLI
gh auth login

# Or use Personal Access Token
# Generate at: https://github.com/settings/tokens
```

### Large files warning

```powershell
# Remove node_modules from tracking (should already be in .gitignore)
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
git push
```

## 📚 Additional Resources

- [GitHub Documentation](https://docs.github.com/)
- [GitHub CLI Manual](https://cli.github.com/manual/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Semantic Commit Messages](https://www.conventionalcommits.org/)

## 🎉 You're Done!

Your Lia project is now on GitHub and ready for:
- ⭐ Stars from the community
- 🍴 Forks and contributions
- 🐛 Issue tracking
- 📖 Documentation hosting
- 🚀 CI/CD automation
- 👥 Collaboration

---

**Need help?** Open an issue or check GitHub's documentation.

**Ready to collaborate?** Share your repository URL with the team!
