# Real News - AI-Powered News Platform

## Project Overview
Real News is an automated news content platform for Uzbekistan that uses AI to detect trending topics and generate high-quality news articles in Uzbek. The platform operates 24/7 with minimal human intervention, delivering timely and engaging content to users.

## Technology Stack
- **Frontend**: React + TypeScript, Wouter, TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **AI**: Google Gemini 2.0 Flash for article generation
- **Scheduling**: node-cron for automated tasks
- **Styling**: Dark/Light theme support

## Architecture

### Data Models
1. **Users** - Admin authentication with username and hashed password
2. **Articles** - Generated news content with title, content, excerpt, category, status, sourceType, sourceUrl
   - **sourceType**: AI_TREND (Google Trends), LOCAL_RSS (Uzbek news), FOREIGN_RSS (international news)
   - **sourceUrl**: Original article URL for RSS-based content
3. **Trends** - Detected trending topics with keyword, score, category, processed status
4. **System Logs** - Activity tracking for automation monitoring

### Key Features
1. **Public Site**
   - Homepage with hero section featuring latest article
   - Trending topics display
   - Latest articles grid with card layout
   - Individual article detail pages
   - Responsive design with dark/light mode

2. **Admin Dashboard** (Secured with Authentication)
   - Session-based authentication with bcrypt password hashing
   - Protected routes requiring login
   - System statistics (published, drafts, scheduled, active trends)
   - Recent activity timeline
   - Active trends monitoring
   - Articles management with delete functionality
   - **Drafts Management** - Edit and publish draft articles
   - Manual trend fetching and article generation
   - User display and logout functionality

3. **Automation System**
   - Trend detection every 2 hours
   - Auto-generate articles every 3 hours (7:00-21:00)
   - AI-powered article generation using Gemini
   - Automatic categorization of trends
   - System activity logging

### API Endpoints

**Public Endpoints:**
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get single article
- `GET /api/trends` - Get all trends
- `GET /api/logs` - Get system logs

**Authentication Endpoints:**
- `POST /api/auth/register` - Register first admin (only works when no users exist)
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info

**Protected Endpoints (Require Authentication):**
- `PATCH /api/articles/:id` - Update article (edit & publish drafts)
- `DELETE /api/articles/:id` - Delete article
- `POST /api/trends/fetch` - Manually fetch trends
- `POST /api/trends/generate` - Generate article from trend
- `POST /api/articles/generate/local-rss` - Generate article from local Uzbek RSS feed
- `POST /api/articles/generate/foreign-rss` - Generate and translate article from foreign RSS feed
- `POST /api/articles/generate/all` - Generate articles from all sources (AI + RSS)
- `GET /api/rss/feeds` - Get list of available RSS feeds

### Scheduled Tasks
1. **Trend Fetching** - Every 2 hours
2. **Article Generation** - Every 3 hours during 7:00-21:00
3. **Log Cleanup** - Daily at 2:00 AM

## Design System
- **Primary Color**: Red (0 84% 50%) - professional news authority (inspired by qalampir.uz)
- **Success**: Green for published status
- **Warning**: Yellow for scheduled/pending
- **Error**: Red for failed operations
- **Typography**: Inter font family for headlines and body
- **Layout**: Compact grid system, professional news portal design
- **Components**: Shadcn UI with custom news-style theming
- **Style**: Professional news website aesthetic with red accents

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key for article generation
- `SESSION_SECRET` - Session encryption key
- `PORT` - Server port (default: 5000)

## Development Workflow
1. Frontend components built with React and TypeScript
2. Backend API routes with Express
3. Database managed with Drizzle ORM
4. Scheduled tasks using node-cron
5. AI integration with Gemini for content generation

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities
├── server/
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── gemini.ts           # AI integration
│   ├── scheduler.ts        # Cron jobs
│   └── services/           # Business logic
└── shared/
    └── schema.ts           # Shared data models
```

## Recent Changes (October 18, 2025)

### Initial Setup
- Initial project setup with full-stack architecture
- Implemented complete data schema with articles, trends, and logs
- Created comprehensive admin dashboard with sidebar navigation
- Integrated Gemini AI for automated article generation in Uzbek
- Set up scheduled tasks for trend detection and article publishing
- Configured PostgreSQL database with Drizzle ORM
- Implemented dark/light theme support throughout application

### Professional News Website Redesign
- **Complete visual overhaul** to match professional news websites (inspired by qalampir.uz)
- Changed color scheme from blue to **red accents** for news authority aesthetic
- Redesigned homepage with compact, professional news portal layout:
  - Large hero article with side articles grid
  - Latest news section with 2-column card layout
  - Trending topics sidebar with numbered items
  - Category badges and quick links
  - Sticky header with improved navigation
  - Professional footer
- Enhanced article detail page:
  - Structured metadata and timestamps
  - Share buttons (Facebook, Twitter, copy link)
  - Related articles with horizontal card layout
  - Sidebar with latest news and categories
  - Improved typography and readability
- All pages now feature professional news website aesthetic with consistent red theming

### Hybrid Content Model Implementation
- **Implemented three-tier content generation system** to diversify content sources and improve platform value
- **Type A (AI_TREND)**: Original AI-generated articles from Google Trends (existing functionality)
  - Detects trending topics in Uzbekistan
  - Generates unique, high-quality content in Uzbek
  - Uses Unsplash for relevant imagery
- **Type B (LOCAL_RSS)**: Rewritten articles from local Uzbek news sources
  - Fetches content from Kun.uz, Daryo.uz, and other Uzbek RSS feeds
  - AI rewrites content in unique style while preserving facts
  - Maintains original source attribution via sourceUrl
  - Uses Unsplash for imagery
- **Type C (FOREIGN_RSS)**: Translated and rewritten articles from international sources
  - Fetches content from BBC Sport, TechCrunch, ESPN, The Verge
  - AI translates from English to Uzbek professionally
  - Adapts content for Uzbek audience while preserving context
  - Uses original article images when available, falls back to Unsplash
  - Maintains source attribution for transparency
- **Database Schema Enhancement**:
  - Added `sourceType` column (AI_TREND, LOCAL_RSS, FOREIGN_RSS)
  - Added `sourceUrl` column for original article attribution
  - Enables content source tracking and analytics
- **New RSS Service** (`server/rss.ts`):
  - Parses RSS feeds using rss-parser library
  - Extracts titles, content, images, and metadata
  - Cleans HTML content for AI processing
  - Supports custom fields for media and enclosures
- **Enhanced Gemini AI Service** (`server/gemini.ts`):
  - `rewriteLocalArticle()` - Rewrites Uzbek articles with unique phrasing
  - `translateAndRewriteForeignArticle()` - Translates and adapts foreign content
  - Maintains original meaning while ensuring content uniqueness
- **Article Generator Orchestration** (`server/article-generator.ts`):
  - `generateArticleFromLocalRSS()` - Processes local RSS feeds
  - `generateArticleFromForeignRSS()` - Processes foreign RSS feeds
  - `generateArticlesFromAllSources()` - Generates all three types in one call
  - Intelligent photo ID tracking to avoid duplicate images
  - Marks trends as processed to prevent reuse
- **New Admin API Endpoints**:
  - `POST /api/articles/generate/local-rss` - Generate from local RSS
  - `POST /api/articles/generate/foreign-rss` - Generate from foreign RSS
  - `POST /api/articles/generate/all` - Generate all types at once
  - `GET /api/rss/feeds` - List available RSS feeds
- **RSS Feed Sources**:
  - Local: Kun.uz, Daryo.uz, Gazeta.uz
  - Foreign: BBC Sport, ESPN Football, TechCrunch, The Verge
- **Benefits**:
  - Diversified content sources reduce dependency on single method
  - Maintains content freshness with real-time news from RSS feeds
  - Provides both local and international perspective
  - Ensures all content is unique and optimized for Uzbek audience
  - Transparent source attribution builds trust

## User Preferences
- Uzbek language for all generated content
- Professional news platform aesthetic
- Clean, modern design with excellent readability
- Automated workflow with minimal manual intervention
- Publishing window: 7:00 AM - 9:00 PM daily
