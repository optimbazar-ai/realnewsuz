# Real News - AI-Powered News Platform

## Overview
Real News is an automated, AI-powered news platform for Uzbekistan, focused on detecting trending topics and generating high-quality news articles in Uzbek. It operates 24/7 to deliver timely and engaging content with minimal human intervention. The platform aims to be a leading professional media portal, ensuring reliable news through a hybrid content model that includes AI-generated content, rewritten local news, and translated international articles.

## User Preferences
- Uzbek language for all generated content
- Professional news platform aesthetic
- Clean, modern design with excellent readability
- Automated workflow with minimal manual intervention
- Publishing window: 7:00 AM - 9:00 PM daily

## System Architecture

### UI/UX Decisions
The platform features a professional news website aesthetic, inspired by `qalampir.uz`, with a compact grid system and red accents as the primary color. It supports dark/light themes and uses the Inter font family for typography. Frontend is built with React, TypeScript, Wouter, TanStack Query, Shadcn UI, and Tailwind CSS. The homepage includes a hero section, trending topics display, and a grid of the latest articles, all designed for responsiveness.

### Technical Implementations
The backend is built with Express.js and Node.js. PostgreSQL (Neon) with Drizzle ORM is used for the database. Google Gemini 2.0 Flash powers AI article generation, and `node-cron` handles automated tasks.

### Feature Specifications
1.  **Public Site**: Displays published articles, trending topics, and individual article detail pages with responsive design. Includes SEO meta tags, Open Graph tags, and social sharing features.
2.  **Admin Dashboard**: Secured with session-based authentication (bcrypt for password hashing). Provides system statistics, activity timelines, articles management (including drafts), and manual triggering of trend fetching and article generation. All AI/RSS generated articles are saved as drafts, requiring manual admin approval for publication.
3.  **Automation System**:
    *   Trend detection every 2 hours.
    *   Automated article generation every 3 hours (7:00 AM - 9:00 PM).
    *   AI-powered article generation from various sources (AI_TREND, LOCAL_RSS, FOREIGN_RSS).
    *   Automatic categorization of trends.
    *   System activity logging and daily log cleanup.

### System Design Choices
*   **Data Models**: Includes Users, Articles (with `sourceType` and `sourceUrl`), Trends, and System Logs.
*   **Content Model**: Implements a hybrid content generation system:
    *   **AI_TREND**: AI-generated articles from Google Trends.
    *   **LOCAL_RSS**: Rewritten articles from local Uzbek news sources (e.g., Kun.uz, Daryo.uz).
    *   **FOREIGN_RSS**: Translated and rewritten articles from international sources (e.g., BBC Sport, TechCrunch).
*   **Editorial Control System**: All automatically generated articles are initially saved as drafts, requiring admin review and explicit publication. This enhances content quality and trustworthiness.
*   **API Endpoints**: Categorized into Public, Authentication, and Protected (requiring authentication) for managing articles, trends, and system operations.
*   **SEO**: Comprehensive SEO meta tags, Open Graph tags, `robots.txt`, and a dynamic `sitemap.xml` are implemented. Google Analytics 4 is integrated for tracking.

## External Dependencies
*   **Database**: PostgreSQL (Neon)
*   **AI Service**: Google Gemini 2.0 Flash API
*   **Image Service**: Unsplash API
*   **Scheduling**: `node-cron`
*   **RSS Parsing**: `rss-parser` library
*   **Social Sharing**: `react-share` library for Telegram and Facebook share buttons
*   **Analytics**: Google Analytics 4