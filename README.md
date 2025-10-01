# Lia - AI-Powered Knowledge Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/lia/liFor self-hosting Lia, follow the comprehensive [Installation Guide](docs/INSTALL.md).

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation, or feedback, your help makes Lia better.

### How to Contribute

1. **Fork the Repository**: Click the "Fork" button on GitHub
2. **Create a Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Implement your feature or fix
4. **Test**: Ensure all tests pass and add new tests if needed
5. **Commit**: Use clear, descriptive commit messages
6. **Push**: `git push origin feature/your-feature-name`
7. **Pull Request**: Open a PR with a detailed description

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for detailed guidelines.

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/lia.git
cd lia

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

See [Development Guide](docs/DEVELOPMENT.md) for more details.

## 🐛 Bug Reports & Feature Requests

- **Bug Reports**: [Create an issue](https://github.com/lia/lia/issues/new?template=bug_report.md)
- **Feature Requests**: [Create an issue](https://github.com/lia/lia/issues/new?template=feature_request.md)
- **Questions**: [Start a discussion](https://github.com/lia/lia/discussions)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🌟 Inspiration

Lia combines the best ideas from modern bookmark managers with cutting-edge AI capabilities. We're inspired by the need for a truly intelligent knowledge management system that respects user privacy through self-hosting while providing enterprise-grade features.](https://github.com/lia/lia/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> An intelligent bookmark manager, tab organizer, screenshot tool, reader, and PDF annotator — all powered by AI.

Lia is your comprehensive digital knowledge management system that helps you capture, organize, and retrieve information effortlessly. Whether you're a researcher, developer, content creator, or knowledge worker, Lia streamlines your workflow with AI-powered organization and smart search capabilities.

## 🌟 Why Lia?

- **AI-Powered Intelligence**: Automatic tagging, categorization, and summarization using ChatGPT or local models (Ollama)
- **Comprehensive Capture**: Bookmarks, screenshots, PDFs, notes, and full-page archives
- **Smart Organization**: Collections, nested tags, and AI-based categorization
- **Universal Access**: Web app, browser extensions, mobile apps (iOS & Android)
- **Privacy-First**: Self-hosted solution with full data control
- **Collaboration Ready**: Share collections and collaborate with teams

## ✨ Core Features

### � Content Management
- **Bookmarks**: Save and organize web links with automatic metadata extraction
- **Screenshots**: Capture, annotate, and organize high-resolution screenshots
- **PDFs**: Store, highlight, and annotate PDF documents
- **Notes**: Create quick notes and annotations linked to your content
- **Full-Page Archives**: Preserve complete webpages using [Monolith](https://github.com/Y2Z/monolith) to protect against link rot
- **Video Archiving**: Automatic video downloads via [yt-dlp](https://github.com/yt-dlp/yt-dlp)

### 🤖 AI-Powered Features
- **Smart Tagging**: Automatic tag suggestions using ChatGPT or local Ollama models
- **Summarization**: AI-generated summaries of saved content
- **Semantic Search**: Find content by meaning, not just keywords
- **OCR**: Extract text from images and screenshots
- **Intelligent Categorization**: Auto-organize content into relevant collections

### 🗂️ Organization
- **Collections & Sub-collections**: Hierarchical organization structure
- **Advanced Tagging**: Colored, nested tags with pinning support
- **Lists**: Create custom lists for different projects or topics
- **Bulk Actions**: Manage multiple items simultaneously
- **Custom Icons**: Personalize links and collections with custom icons

### 🔍 Search & Discovery
- **Full-Text Search**: Search across all content, including archived pages
- **Advanced Filters**: Filter by tags, collections, date, type, and more
- **Smart Suggestions**: AI-powered content recommendations
- **Pinned Items**: Quick access to frequently used bookmarks

### 🌐 Multi-Platform Access
- **Web Application**: Progressive Web App (PWA) with offline support
- **Browser Extensions**: Chrome and Firefox extensions for one-click saving
- **Mobile Apps**: Native iOS and Android applications
- **Desktop Client**: Offline-capable desktop application
- **Bookmarklet**: Quick save from any browser without extensions

### 👥 Collaboration & Sharing
- **Shared Collections**: Collaborate with team members
- **Permission Management**: Granular control over member access
- **Public Sharing**: Share collections with the world
- **Multi-User Support**: Role-based access control

### 🔄 Integration & Import
- **RSS Feeds**: Auto-import from RSS/Atom feeds
- **Import Tools**: Migrate from Chrome, Pocket, Linkwarden, Omnivore, Tab Session Manager
- **Browser Sync**: Two-way sync with browser bookmarks via [Floccus](https://floccus.org/)
- **API**: RESTful API for custom integrations
- **API Keys**: Secure programmatic access
- **Webhooks**: Real-time notifications for events
- **Third-party Services**: Connect with Pocket, Instapaper, Evernote, and more

### 🎨 User Experience
- **Clean Interface**: Distraction-free, modern UI
- **Dark/Light Mode**: Comfortable viewing in any environment
- **Responsive Design**: Optimized for all screen sizes
- **Keyboard Shortcuts**: Quick actions without leaving the keyboard
- **Customizable Layouts**: Personalize your workspace
- **Multi-language Support**: Available in multiple languages (i18n)

### 📖 Reading Experience
- **Reader View**: Clutter-free reading mode
- **Highlights & Annotations**: Mark and annotate important passages
- **Offline Reading**: Access content without internet
- **Text-to-Speech**: Listen to your saved articles

### 🔐 Security & Privacy
- **Self-Hosted**: Full control over your data
- **SSO Integration**: Enterprise-grade single sign-on
- **API Authentication**: Secure token-based access
- **Data Encryption**: Protected storage and transmission
- **Automatic Backups**: Never lose your data
- **Export Options**: Download your data anytime

### 📊 Advanced Features
- **Rule-Based Engine**: Automated workflows and organization
- **Analytics**: Track your bookmarking patterns
- **Notifications**: Stay updated on important changes
- **Wayback Machine**: Archive pages to Archive.org
- **Tab Management**: Save, organize, and restore browser tab sessions
- **Cloud Storage**: Integration with major cloud providers

## 🚀 Quick Start

### Prerequisites

- **Docker** (recommended) or:
  - Node.js 18+ and npm/yarn/pnpm
  - PostgreSQL 14+ or MongoDB 5+
  - Redis 7+ (optional, for caching)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/lia/lia.git
cd lia

# Start with Docker Compose
docker-compose up -d
```

Visit `http://localhost:3000` to access Lia.

### Option 2: Manual Installation

See the detailed [Installation Guide](docs/INSTALL.md) for manual setup instructions.

## 📖 Documentation

- **[Installation Guide](docs/INSTALL.md)** - Detailed setup instructions
- **[User Guide](docs/USAGE.md)** - How to use Lia effectively
- **[API Documentation](docs/API.md)** - REST API reference
- **[Configuration Guide](docs/CONFIGURATION.md)** - Environment variables and settings
- **[Development Guide](docs/DEVELOPMENT.md)** - Contributing and development setup
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment strategies

## 💡 Use Cases

### For Researchers
- Organize research papers and articles with AI-powered categorization
- Highlight and annotate PDFs directly in the browser
- Semantic search to find relevant content quickly
- Collaborate with team members on shared research collections

### For Developers
- Save code snippets and documentation with full-text search
- Archive technical articles and tutorials
- Organize resources by project or technology stack
- API integration for custom workflows

### For Content Creators
- Collect inspiration and references
- Save social media threads and conversations
- Organize assets by project or campaign
- Share curated collections with clients or team

### For Knowledge Workers
- Capture meeting notes and decisions
- Build a personal knowledge base
- Track project resources and references
- Cross-device access to important information

## 🎯 Best Practices

### Effective Organization
1. **Use Collections Strategically**: Create collections for different areas of your life/work
2. **Leverage AI Tagging**: Let AI suggest tags, then customize as needed
3. **Regular Maintenance**: Review and clean up outdated bookmarks monthly
4. **Descriptive Naming**: Use clear, searchable names for collections and tags

### Power User Tips
- **Keyboard Shortcuts**: Learn shortcuts for faster navigation
- **Bulk Actions**: Select multiple items for quick organization
- **Advanced Search**: Use filters and operators for precise results
- **API Integration**: Automate repetitive tasks via the REST API
- **RSS Feeds**: Auto-import content from trusted sources

### Collaboration Guidelines
- **Clear Permissions**: Define roles clearly for team members
- **Naming Conventions**: Establish consistent naming patterns
- **Regular Sync**: Keep shared collections updated
- **Communication**: Use annotations to communicate with team members

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express/Fastify
- **Database**: PostgreSQL (primary), MongoDB (optional)
- **Cache**: Redis
- **Search**: Meilisearch or Elasticsearch
- **AI**: OpenAI API, Ollama (local models)
- **Storage**: S3-compatible storage (MinIO, AWS S3, etc.)
- **Queue**: Bull/BullMQ for background jobs

## 🔧 Configuration

Lia can be configured through environment variables. Key settings include:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lia

# AI Configuration
OPENAI_API_KEY=your-api-key-here
ENABLE_LOCAL_AI=true
OLLAMA_URL=http://localhost:11434

# Storage
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=lia-storage

# Security
JWT_SECRET=your-secret-key
ENABLE_SSO=false
```

See [Configuration Guide](docs/CONFIGURATION.md) for all options.

## 📦 Installation
Lia can be self-hosted using Docker. Follow the instructions in the [installation guide](INSTALL.md) to set up your own instance.

## Usage
Once installed, you can access Lia via your web browser. Use the Chrome plugin, Firefox addon, or mobile apps to quickly bookmark links. Organize your bookmarks into lists, add tags, and use the search functionality to find what you need.
For detailed usage instructions, refer to the [user guide](USAGE.md).

## Contributing
Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details

## Inspiration
Lia is inspired by the need for a more intelligent and efficient way to manage bookmarks. It combines the simplicity of traditional bookmark managers with the power of AI to enhance user experience.

## 🔗 Related Projects

Lia draws inspiration from these excellent bookmark managers and knowledge management tools:

- **[Linkwarden](https://linkwarden.app/)** - Collaborative bookmark manager with full-page archival ([GitHub](https://github.com/linkwarden/linkwarden))
- **[Raindrop.io](https://raindrop.io/)** - Beautiful bookmark manager with collections ([GitHub](https://github.com/raindropio/raindrop))
- **[Pocket](https://getpocket.com/)** - Save articles for later reading ([GitHub](https://github.com/Pocket))
- **[Faved](https://faved.dev/)** - Lightweight bookmark manager ([GitHub](https://github.com/denho/faved))
- **[PlutoAI](https://www.plutoai.in/)** - AI-powered bookmark organizer ([GitHub](https://github.com/PlutoAI/PlutoAI))
- **[Vault](https://getvault.pages.dev/)** - Personal knowledge base ([GitHub](https://github.com/pekkiriscim/vault))
- **[Karakeep](https://karakeep.app/)** - Open-source bookmark manager ([GitHub](https://github.com/karakeep-app/karakeep))
- **[Pinry](https://pinry.github.io/pinry/)** - Pinterest-style bookmark manager ([GitHub](https://github.com/pinry/pinry))

## 🙏 Acknowledgements

- Thanks to all [contributors](https://github.com/lia/lia/graphs/contributors) who have helped improve Lia
- The open-source community for inspiration and tools
- All users who provide feedback and suggestions
- [Monolith](https://github.com/Y2Z/monolith) for full-page archival
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for video archiving
- [Floccus](https://floccus.org/) for browser sync capabilities

## 📞 Support & Community

- **Documentation**: [docs.lia.dev](https://docs.lia.dev) (coming soon)
- **Discord**: Join our [community server](https://discord.gg/lia) (coming soon)
- **Twitter**: Follow [@LiaBookmarks](https://twitter.com/LiaBookmarks) (coming soon)
- **Email**: support@lia.dev

---

<div align="center">

**[Website](https://lia.dev)** • **[Documentation](https://docs.lia.dev)** • **[Community](https://discord.gg/lia)** • **[Roadmap](https://github.com/lia/lia/projects)**

Made with ❤️ by the Lia Team and Contributors

</div>
