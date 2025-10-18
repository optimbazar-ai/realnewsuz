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
1. **Articles** - Generated news content with title, content, excerpt, category, status
2. **Trends** - Detected trending topics with keyword, score, category, processed status
3. **System Logs** - Activity tracking for automation monitoring

### Key Features
1. **Public Site**
   - Homepage with hero section featuring latest article
   - Trending topics display
   - Latest articles grid with card layout
   - Individual article detail pages
   - Responsive design with dark/light mode

2. **Admin Dashboard**
   - System statistics (published, drafts, scheduled, active trends)
   - Recent activity timeline
   - Active trends monitoring
   - Articles management with delete functionality
   - Manual trend fetching and article generation

3. **Automation System**
   - Trend detection every 2 hours
   - Auto-generate articles every 3 hours (7:00-21:00)
   - AI-powered article generation using Gemini
   - Automatic categorization of trends
   - System activity logging

### API Endpoints
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get single article
- `DELETE /api/articles/:id` - Delete article
- `GET /api/trends` - Get all trends
- `POST /api/trends/fetch` - Manually fetch trends
- `POST /api/trends/generate` - Generate article from trend
- `GET /api/logs` - Get system logs

### Scheduled Tasks
1. **Trend Fetching** - Every 2 hours
2. **Article Generation** - Every 3 hours during 7:00-21:00
3. **Log Cleanup** - Daily at 2:00 AM

## Design System
- **Primary Color**: Blue (210 100% 50%) - trustworthy news authority
- **Success**: Green for published status
- **Warning**: Yellow for scheduled/pending
- **Error**: Red for failed operations
- **Typography**: Inter font family for headlines and body
- **Layout**: Responsive grid system, max-w-7xl containers
- **Components**: Shadcn UI with custom theming

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
- Initial project setup with full-stack architecture
- Implemented complete data schema with articles, trends, and logs
- Built beautiful public-facing website with hero section and article cards
- Created comprehensive admin dashboard with sidebar navigation
- Integrated Gemini AI for automated article generation in Uzbek
- Set up scheduled tasks for trend detection and article publishing
- Configured PostgreSQL database with Drizzle ORM
- Implemented dark/light theme support throughout application

## User Preferences
- Uzbek language for all generated content
- Professional news platform aesthetic
- Clean, modern design with excellent readability
- Automated workflow with minimal manual intervention
- Publishing window: 7:00 AM - 9:00 PM daily
