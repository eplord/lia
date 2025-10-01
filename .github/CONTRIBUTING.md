# Contributing to Lia

Thank you for your interest in contributing to Lia! We welcome contributions from everyone. This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Community](#community)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be collaborative**: Work together and share knowledge
- **Be professional**: Keep discussions focused and constructive

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL 14+ or MongoDB 5+
- Git
- Docker (optional, for containerized development)

### Setting Up Your Development Environment

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/lia.git
   cd lia
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/lia/lia.git
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Set Up the Database**
   ```bash
   npm run db:migrate
   npm run db:seed  # Optional: load sample data
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application should now be running at `http://localhost:3000`

## 🔄 Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name

# Or for a bug fix
git checkout -b fix/bug-description
```

### Branch Naming Conventions

- `feature/` - New features (e.g., `feature/ai-tagging`)
- `fix/` - Bug fixes (e.g., `fix/search-crash`)
- `docs/` - Documentation changes (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/database-layer`)
- `test/` - Adding or updating tests (e.g., `test/bookmark-api`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Making Changes

1. **Write clean, readable code** following our [coding standards](#coding-standards)
2. **Add tests** for new features or bug fixes
3. **Update documentation** if you change functionality
4. **Keep commits focused** - one logical change per commit

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(bookmarks): add AI-powered tagging feature

Implement automatic tag suggestion using OpenAI API.
Users can now enable AI tagging in settings.

Closes #123
```

```bash
fix(search): resolve crash when searching empty query

Add validation to prevent null query strings from
causing application crash.

Fixes #456
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.spec.ts
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## 💻 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types and interfaces
- Avoid `any` types when possible

### Code Style

- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add comments for complex logic
- Follow the existing code style in the project

### File Organization

```
src/
├── api/           # API routes
├── components/    # React components
├── lib/           # Utility functions
├── models/        # Database models
├── services/      # Business logic
├── types/         # TypeScript type definitions
└── utils/         # Helper functions
```

### Component Structure (React)

```tsx
// Imports
import React from 'react';
import { useState } from 'react';

// Types
interface MyComponentProps {
  title: string;
  onSave: () => void;
}

// Component
export const MyComponent: React.FC<MyComponentProps> = ({ title, onSave }) => {
  // State
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### API Design

- Follow RESTful conventions
- Use proper HTTP status codes
- Validate input data
- Handle errors gracefully
- Add API documentation

### Database

- Use migrations for schema changes
- Add indexes for frequently queried fields
- Write efficient queries
- Use transactions for related operations

## 🔍 Pull Request Process

### Before Submitting

1. ✅ Ensure all tests pass
2. ✅ Update documentation if needed
3. ✅ Add tests for new features
4. ✅ Run linter and formatter
5. ✅ Rebase on latest main branch
6. ✅ Write a clear PR description

### PR Checklist

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Submitting Your PR

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Fill out the PR template
   - Link related issues (e.g., "Closes #123")

3. **Address Review Comments**
   - Be responsive to feedback
   - Make requested changes
   - Push updates to your branch
   - Request re-review when ready

### Review Process

- Maintainers will review your PR within 3-5 business days
- You may receive feedback requesting changes
- Once approved, a maintainer will merge your PR
- Your contribution will be acknowledged in release notes

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Try the latest version** to see if the bug is already fixed
3. **Gather information** about your environment

### Bug Report Template

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) which includes:

- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, version)
- Screenshots or error logs
- Possible fix (if you have ideas)

## 💡 Suggesting Features

### Feature Request Process

1. **Check existing issues** for similar requests
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with as much detail as possible
4. **Consider alternatives** and their trade-offs

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)

### What Makes a Good Feature Request?

- **Clear use case**: Explain who benefits and how
- **Detailed description**: Provide mockups, examples, or user stories
- **Scope consideration**: Is it aligned with Lia's goals?
- **Implementation ideas**: Technical approach (optional)

## 🌟 Recognition

Contributors are recognized in several ways:

- Listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Mentioned in release notes
- Featured in the project's README
- Invited to join our community channels

## 📚 Additional Resources

- [Development Guide](../docs/DEVELOPMENT.md)
- [Architecture Overview](../docs/ARCHITECTURE.md)
- [API Documentation](../docs/API.md)
- [Testing Guide](../docs/TESTING.md)

## 🤝 Community

- **Discord**: Join our [community server](https://discord.gg/lia)
- **Discussions**: [GitHub Discussions](https://github.com/lia/lia/discussions)
- **Twitter**: Follow [@LiaBookmarks](https://twitter.com/LiaBookmarks)

## ❓ Questions?

If you have questions about contributing:

1. Check our [FAQ](../docs/FAQ.md)
2. Search [GitHub Discussions](https://github.com/lia/lia/discussions)
3. Ask in our [Discord community](https://discord.gg/lia)
4. Open a [discussion thread](https://github.com/lia/lia/discussions/new)

---

Thank you for contributing to Lia! Every contribution, no matter how small, helps make Lia better for everyone. 🎉
