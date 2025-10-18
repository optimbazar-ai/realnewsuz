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

### Content Strategy (October 18, 2025 Update)
**SOURCE-BASED CONTENT MODEL** - Real News uses only verified RSS feeds from trusted news organizations. Google Trends functionality has been disabled in favor of this more reliable approach.

**RSS Sources (20 Total):**
- **5 Local Uzbek Sources:** Kun.uz, Daryo.uz, Gazeta.uz, Spot.uz, UzA.uz
- **15 International Sources:** BBC Sport, ESPN, Sky Sports, TechCrunch, The Verge, Ars Technica, Wired, BBC News, Al Jazeera, Reuters, Bloomberg, Financial Times, Science Daily, National Geographic, New Scientist

**Configuration:** All RSS feeds are centralized in `config/rss-feeds.json` for easy maintenance and scaling.

### Feature Specifications
1.  **Public Site**: Displays published articles, trending topics, and individual article detail pages with responsive design. Includes SEO meta tags, Open Graph tags, and social sharing features. Every article displays its source URL for transparency.
2.  **Admin Dashboard**: Secured with session-based authentication (bcrypt for password hashing). Provides system statistics, activity timelines, articles management (including drafts), and manual triggering of RSS automation. All RSS-generated articles are saved as drafts, requiring manual admin approval for publication.
3.  **Automation System**:
    *   RSS automation every 4 hours (01:00, 05:00, 09:00, 13:00, 17:00, 21:00)
    *   AI-powered article generation from RSS sources (LOCAL_RSS, FOREIGN_RSS)
    *   Enhanced Gemini prompts for creative, unique content
    *   Automatic categorization based on source
    *   Duplicate prevention via sourceUrl tracking
    *   System activity logging and daily log cleanup at 02:00

### System Design Choices
*   **Data Models**: Includes Users, Articles (with `sourceType` and `sourceUrl`), Trends (for categories), and System Logs.
*   **Content Model**: Implements a **source-based content generation system**:
    *   **LOCAL_RSS**: Rewritten articles from local Uzbek news sources (5 feeds: Kun.uz, Daryo.uz, Gazeta.uz, Spot.uz, UzA.uz).
    *   **FOREIGN_RSS**: Translated and rewritten articles from international sources (15 feeds across sports, tech, world news, business, science).
    *   **AI_TREND**: DEPRECATED - Google Trends functionality disabled in favor of verified RSS sources.
*   **RSS Configuration**: Centralized in `config/rss-feeds.json` with structured metadata (name, URL, description, language/category).
*   **Content Quality**:
    *   Enhanced Gemini prompts with creativity and structural guidelines
    *   Duplicate prevention via sourceUrl tracking
    *   All articles include source URL for transparency
    *   Up to 20 unique articles per automation run
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