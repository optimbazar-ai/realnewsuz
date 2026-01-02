import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { initializeScheduler } from "./scheduler";
import { fetchTrendingTopics } from "./services/trend-service";
import { generateArticleFromTrendId, autoGenerateRSSArticles } from "./services/article-service";
import {
  generateArticleFromLocalRSS,
  generateArticleFromForeignRSS,
  generateArticlesFromAllSources
} from "./article-generator";
import { RSS_FEEDS } from "./rss";
import { sendArticleToChannel } from "./services/telegram-service";
import { sendArticleToInstagram } from "./services/instagram-service";
import { z } from "zod";
import passport, { requireAuth } from "./auth";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertArticleSchema } from "@shared/schema";
import { authLimiter, aiLimiter } from "./rate-limiter";
import { cache, CACHE_KEYS, CACHE_TTL } from "./cache";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the scheduler
  initializeScheduler();

  // Clean up and create default admin account
  try {
    const allUsers = await db.select().from(users);
    console.log(`📊 Found ${allUsers.length} existing users`);

    // Delete all existing users
    for (const user of allUsers) {
      await storage.deleteUser(user.id);
      console.log(`🗑️ Deleted user: ${user.username}`);
    }

    // Create fresh admin account
    const hashedPassword = await bcrypt.hash("Hisobot201415", 10);
    const newUser = await storage.createUser({
      username: "Akramjon",
      password: hashedPassword,
    });
    console.log(`✅ Fresh admin account created: Akramjon / Hisobot201415 (ID: ${newUser.id})`);
  } catch (error) {
    console.error("Error in user setup:", error);
  }

  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);

      const allUsers = await db.select().from(users);
      if (allUsers.length > 0) {
        return res.status(403).json({
          error: "Registration is disabled. Admin account already exists."
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      await storage.createLog({
        action: "user_registered",
        status: "success",
        message: `Birinchi admin foydalanuvchi yaratildi: ${username}`,
      });

      res.json({ success: true, userId: user.id });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", authLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Login failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          success: true,
          user: { id: user.id, username: user.username }
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        authenticated: true,
        user: { id: user.id, username: user.username }
      });
    }
    res.json({ authenticated: false });
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: "unknown",
        gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured",
        telegram: process.env.TELEGRAM_BOT_TOKEN ? "configured" : "not configured",
        instagram: process.env.INSTAGRAM_USERNAME ? "configured" : "not configured",
      },
      cache: cache.stats(),
    };

    try {
      // Test database connection
      await db.select().from(users).limit(1);
      healthCheck.services.database = "connected";
    } catch (error) {
      healthCheck.services.database = "disconnected";
      healthCheck.status = "degraded";
    }

    res.json(healthCheck);
  });

  // Cron endpoint for external cron services (cron-job.org, etc.)
  // Returns immediately, work continues in background (for 30s timeout limit)
  app.post("/api/cron/generate", async (req, res) => {
    try {
      // Verify cron secret
      const authHeader = req.headers.authorization;
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("🔄 Cron job triggered: Starting RSS article generation in background...");

      // Return immediately - work continues in background
      res.json({
        success: true,
        message: "Cron job started in background",
        timestamp: new Date().toISOString()
      });

      // Background work (continues after response)
      setImmediate(async () => {
        try {
          // Generate articles from RSS feeds
          await autoGenerateRSSArticles();

          // Get recently created articles and publish them
          const drafts = await storage.getDraftArticles();
          let publishedCount = 0;

          for (const draft of drafts.slice(0, 3)) { // Publish up to 3 articles
            const published = await storage.updateArticle(draft.id, {
              status: "published",
              publishedAt: new Date(),
            });

            if (published) {
              publishedCount++;
              // Send to Telegram channel
              await sendArticleToChannel(published);
            }
          }

          // Clear cache
          cache.delete(CACHE_KEYS.PUBLISHED_ARTICLES);

          console.log(`✅ Cron job completed: ${publishedCount} articles published`);
        } catch (error) {
          console.error("❌ Cron background job error:", error);
        }
      });
    } catch (error) {
      console.error("❌ Cron job error:", error);
      res.status(500).json({ error: "Cron job failed", details: String(error) });
    }
  });

  // Admin endpoint to refresh all article images with Unsplash
  app.post("/api/admin/refresh-images", requireAuth, async (req, res) => {
    try {
      console.log("🔄 Starting image refresh for all articles...");

      const articles = await storage.getPublishedArticles();
      const usedPhotoIds: string[] = [];
      let updatedCount = 0;
      let errorCount = 0;

      for (const article of articles) {
        try {
          // Skip if already has Unsplash image (has photoId)
          if (article.photoId) {
            console.log(`⏭️ Skipping "${article.title.substring(0, 30)}..." - already has Unsplash image`);
            continue;
          }

          // Get new Unsplash image
          const { searchPhotoForArticle } = await import("./unsplash");
          const photo = await searchPhotoForArticle(article.title, usedPhotoIds);

          if (photo) {
            await storage.updateArticle(article.id, {
              imageUrl: photo.imageUrl,
              photographerName: photo.photographerName,
              photographerUrl: photo.photographerUrl,
              photoId: photo.photoId,
            });
            usedPhotoIds.push(photo.photoId);
            updatedCount++;
            console.log(`✅ Updated image for "${article.title.substring(0, 30)}..."`);
          }

          // Small delay to avoid API rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          errorCount++;
          console.error(`❌ Error updating "${article.title.substring(0, 30)}...":`, err);
        }
      }

      // Clear cache
      cache.delete(CACHE_KEYS.PUBLISHED_ARTICLES);

      console.log(`✅ Image refresh complete: ${updatedCount} updated, ${errorCount} errors`);

      res.json({
        success: true,
        updated: updatedCount,
        errors: errorCount,
        total: articles.length,
      });
    } catch (error) {
      console.error("❌ Image refresh error:", error);
      res.status(500).json({ error: "Image refresh failed", details: String(error) });
    }
  });

  // Search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string || "").toLowerCase().trim();
      const category = req.query.category as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query && !category) {
        return res.json({ articles: [], total: 0, page, limit });
      }

      let articles = await storage.getPublishedArticles();

      // Filter by search query
      if (query) {
        articles = articles.filter(article =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt?.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query)
        );
      }

      // Filter by category
      if (category) {
        articles = articles.filter(article => article.category === category);
      }

      const total = articles.length;
      const startIndex = (page - 1) * limit;
      const paginatedArticles = articles.slice(startIndex, startIndex + limit);

      res.json({
        articles: paginatedArticles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error("Error searching articles:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Sitemap.xml endpoint
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL || (process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : "https://realnews.uz");
      const articles = await storage.getPublishedArticles();

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`;

      for (const article of articles) {
        const slug = article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 50);

        sitemap += `
  <url>
    <loc>${baseUrl}/article/${article.id}/${slug}</loc>
    <lastmod>${new Date(article.updatedAt || article.createdAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      }

      sitemap += `
</urlset>`;

      res.set("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt endpoint
  app.get("/robots.txt", (req, res) => {
    const baseUrl = process.env.BASE_URL || "https://realnews.uz";
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.set("Content-Type", "text/plain");
    res.send(robotsTxt);
  });

  // Articles endpoints with caching and pagination
  app.get("/api/articles", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string;
      const search = (req.query.search as string || "").toLowerCase().trim();

      // Check cache first (only for default requests without filters)
      const cacheKey = category ? `articles_${category}` : CACHE_KEYS.PUBLISHED_ARTICLES;
      if (!category && !search && page === 1 && limit === 50) {
        const cached = cache.get<any[]>(cacheKey);
        if (cached) {
          return res.json(cached);
        }
      }

      let articles = await storage.getPublishedArticles();

      // Filter by category
      if (category) {
        articles = articles.filter(a => a.category === category);
      }

      // Filter by search query
      if (search) {
        articles = articles.filter(article =>
          article.title.toLowerCase().includes(search) ||
          article.excerpt?.toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search)
        );
      }

      // Paginate
      const total = articles.length;
      const startIndex = (page - 1) * limit;
      const paginatedArticles = articles.slice(startIndex, startIndex + limit);

      const response = {
        articles: paginatedArticles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };

      // Cache for 1 minute (only full list without filters)
      if (!category && !search && page === 1 && limit === 50) {
        cache.set(cacheKey, paginatedArticles, CACHE_TTL.ARTICLES);
      }

      res.json(response);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/drafts", requireAuth, async (req, res) => {
    try {
      const drafts = await storage.getDraftArticles();
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching draft articles:", error);
      res.status(500).json({ error: "Failed to fetch draft articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      if (article.status !== "published" && !req.isAuthenticated()) {
        return res.status(404).json({ error: "Article not found" });
      }

      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  // Dynamic OG Image endpoint
  app.get("/api/og/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);

      if (!article) {
        return res.status(404).send("Not found");
      }

      // Cache for 1 hour (images are heavy)
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Content-Type", "image/png");

      const { generateOgImage } = await import("./services/og-service");
      const imageBuffer = await generateOgImage(article);

      res.send(imageBuffer);
    } catch (error) {
      console.error("Error generating OG image:", error);
      res.status(500).send("Error generating image");
    }
  });

  app.patch("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(req.params.id, updateData);

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      await storage.createLog({
        action: "article_updated",
        status: "success",
        message: `Maqola yangilandi: ${article.title}`,
      });

      // Invalidate cache
      cache.delete(CACHE_KEYS.PUBLISHED_ARTICLES);
      cache.delete(CACHE_KEYS.ARTICLE(req.params.id));

      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ error: "Failed to update article" });
    }
  });

  app.patch("/api/articles/:id/publish", requireAuth, async (req, res) => {
    try {
      const article = await storage.publishArticle(req.params.id);

      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      await storage.createLog({
        action: "article_published",
        status: "success",
        message: `Maqola nashr etildi: ${article.title}`,
        metadata: JSON.stringify({ articleId: article.id, publishedAt: article.publishedAt }),
      });

      // Send article to Telegram channel
      const telegramSent = await sendArticleToChannel(article);
      if (telegramSent) {
        await storage.createLog({
          action: "telegram_notification_sent",
          status: "success",
          message: `Telegram kanaliga yuborildi: ${article.title}`,
          metadata: JSON.stringify({ articleId: article.id }),
        });
      }

      // Send article to Instagram
      const instagramSent = await sendArticleToInstagram(article);
      if (instagramSent) {
        await storage.createLog({
          action: "instagram_notification_sent",
          status: "success",
          message: `Instagram'ga yuborildi: ${article.title}`,
          metadata: JSON.stringify({ articleId: article.id }),
        });
      }

      // Invalidate cache
      cache.delete(CACHE_KEYS.PUBLISHED_ARTICLES);
      cache.delete(CACHE_KEYS.ARTICLE(req.params.id));

      res.json(article);
    } catch (error) {
      console.error("Error publishing article:", error);
      res.status(500).json({ error: "Failed to publish article" });
    }
  });

  app.delete("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteArticle(req.params.id);
      await storage.createLog({
        action: "article_deleted",
        status: "success",
        message: `Maqola o'chirildi: ${req.params.id}`,
      });

      // Invalidate cache
      cache.delete(CACHE_KEYS.PUBLISHED_ARTICLES);
      cache.delete(CACHE_KEYS.ARTICLE(req.params.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  // Trends endpoints
  app.get("/api/trends", async (req, res) => {
    try {
      const trends = await storage.getAllTrends();
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  app.post("/api/trends/fetch", requireAuth, async (req, res) => {
    try {
      await fetchTrendingTopics();
      await storage.createLog({
        action: "trend_fetch_manual",
        status: "success",
        message: "Trendlar qo'lda yangilandi",
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  app.post("/api/trends/generate", requireAuth, async (req, res) => {
    try {
      const schema = z.object({ trendId: z.string() });
      const { trendId } = schema.parse(req.body);

      await generateArticleFromTrendId(trendId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error generating article from trend:", error);
      res.status(500).json({ error: "Failed to generate article" });
    }
  });

  // System logs endpoint
  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getAllLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // RSS article generation endpoints
  app.post("/api/articles/generate/local-rss", requireAuth, aiLimiter, async (req, res) => {
    try {
      const schema = z.object({ feedUrl: z.string().url().optional() });
      const { feedUrl } = schema.parse(req.body);

      const selectedFeed = feedUrl || RSS_FEEDS.LOCAL.KUN_UZ;
      const articleData = await generateArticleFromLocalRSS(selectedFeed);

      if (!articleData) {
        return res.status(400).json({ error: "Failed to generate article from RSS feed" });
      }

      const article = await storage.createArticle(articleData);

      await storage.createLog({
        action: "article_generated_local_rss",
        status: "success",
        message: `Mahalliy RSS'dan maqola yaratildi: ${article.title}`,
        metadata: JSON.stringify({ feedUrl: selectedFeed, articleId: article.id }),
      });

      res.json(article);
    } catch (error) {
      console.error("Error generating article from local RSS:", error);
      await storage.createLog({
        action: "article_generated_local_rss",
        status: "error",
        message: `Mahalliy RSS'dan maqola yaratishda xatolik: ${error}`,
      });
      res.status(500).json({ error: "Failed to generate article from local RSS" });
    }
  });

  app.post("/api/articles/generate/foreign-rss", requireAuth, aiLimiter, async (req, res) => {
    try {
      const schema = z.object({ feedUrl: z.string().url().optional() });
      const { feedUrl } = schema.parse(req.body);

      const selectedFeed = feedUrl || RSS_FEEDS.FOREIGN.BBC_SPORT;
      const articleData = await generateArticleFromForeignRSS(selectedFeed);

      if (!articleData) {
        return res.status(400).json({ error: "Failed to generate article from RSS feed" });
      }

      const article = await storage.createArticle(articleData);

      await storage.createLog({
        action: "article_generated_foreign_rss",
        status: "success",
        message: `Xorijiy RSS'dan maqola yaratildi va tarjima qilindi: ${article.title}`,
        metadata: JSON.stringify({ feedUrl: selectedFeed, articleId: article.id }),
      });

      res.json(article);
    } catch (error) {
      console.error("Error generating article from foreign RSS:", error);
      await storage.createLog({
        action: "article_generated_foreign_rss",
        status: "error",
        message: `Xorijiy RSS'dan maqola yaratishda xatolik: ${error}`,
      });
      res.status(500).json({ error: "Failed to generate article from foreign RSS" });
    }
  });

  app.post("/api/articles/generate/all", requireAuth, aiLimiter, async (req, res) => {
    try {
      const results = await generateArticlesFromAllSources();
      const createdArticles = [];

      if (results.aiTrend) {
        const article = await storage.createArticle(results.aiTrend);
        createdArticles.push(article);
        await storage.createLog({
          action: "article_generated_ai_trend",
          status: "success",
          message: `AI trend'dan maqola yaratildi: ${article.title}`,
        });
      }

      if (results.localRSS) {
        const article = await storage.createArticle(results.localRSS);
        createdArticles.push(article);
        await storage.createLog({
          action: "article_generated_local_rss",
          status: "success",
          message: `Mahalliy RSS'dan maqola yaratildi: ${article.title}`,
        });
      }

      if (results.foreignRSS) {
        const article = await storage.createArticle(results.foreignRSS);
        createdArticles.push(article);
        await storage.createLog({
          action: "article_generated_foreign_rss",
          status: "success",
          message: `Xorijiy RSS'dan maqola yaratildi: ${article.title}`,
        });
      }

      res.json({
        success: true,
        articlesCreated: createdArticles.length,
        articles: createdArticles
      });
    } catch (error) {
      console.error("Error generating articles from all sources:", error);
      res.status(500).json({ error: "Failed to generate articles" });
    }
  });

  app.get("/api/rss/feeds", (req, res) => {
    res.json({
      local: Object.entries(RSS_FEEDS.LOCAL).map(([key, url]) => ({
        key,
        url,
        name: key.replace(/_/g, ' ')
      })),
      foreign: Object.entries(RSS_FEEDS.FOREIGN).map(([key, url]) => ({
        key,
        url,
        name: key.replace(/_/g, ' ')
      })),
    });
  });

  app.post("/api/rss/auto-generate", requireAuth, async (req, res) => {
    try {
      console.log("🧪 Manual RSS auto-generation triggered");
      await autoGenerateRSSArticles();
      res.json({ success: true, message: "RSS article generation completed" });
    } catch (error) {
      console.error("Error in manual RSS generation:", error);
      res.status(500).json({ error: "Failed to generate RSS articles" });
    }
  });

  // Test endpoint for RSS generation (no auth required for debugging)
  app.get("/api/rss/test", async (req, res) => {
    try {
      console.log("🧪 TEST: Manual RSS auto-generation triggered");
      await autoGenerateRSSArticles();
      res.json({ success: true, message: "RSS article generation completed" });
    } catch (error) {
      console.error("Error in test RSS generation:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  // Clean up old admin accounts - keep only Akramjon
  app.get("/api/admin/cleanup", async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      const akramjon = allUsers.find(u => u.username === "Akramjon");
      const admin = allUsers.find(u => u.username === "admin");

      if (admin && akramjon && admin.id !== akramjon.id) {
        await storage.deleteUser(admin.id);
        console.log("✅ Old admin account deleted");
        res.json({ success: true, message: "Old admin account deleted. Use Akramjon / Gisobot201415" });
      } else {
        res.json({ success: true, message: "No cleanup needed" });
      }
    } catch (error) {
      console.error("Error in cleanup:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/telegram/test", requireAuth, async (req, res) => {
    try {
      const { testTelegramConnection } = await import("./services/telegram-service");
      const success = await testTelegramConnection();
      if (success) {
        res.json({ success: true, message: "Telegram test message sent successfully" });
      } else {
        res.status(503).json({
          success: false,
          error: "Telegram not configured or test failed. Check TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID."
        });
      }
    } catch (error) {
      console.error("Error testing Telegram:", error);
      res.status(500).json({ error: "Failed to test Telegram connection" });
    }
  });

  // Sitemap - Root URL
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      const baseUrl = "https://realnews.uz";

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;

      for (const article of articles) {
        // Same slug logic as client
        const slug = article.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 100);

        const articleUrl = `${baseUrl}/article/${article.id}/${slug}`;
        const lastmod = article.updatedAt
          ? new Date(article.updatedAt).toISOString().split('T')[0]
          : article.publishedAt
            ? new Date(article.publishedAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        xml += `  <url>\n`;
        xml += `    <loc>${articleUrl}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }

      xml += '</urlset>';

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });

  // SEO Injection for Article Pages (Server-Side Rendering for Meta Tags)
  // This intercepts request for article pages and injects real meta tags into index.html
  // Use explicit params so req.params.id is typed correctly
  app.get("/article/:id/:slug?", async (req, res, next) => {
    // Only handle direct document requests, not API or assets
    if (req.headers.accept && !req.headers.accept.includes("text/html")) {
      return next();
    }

    try {
      const articleId = req.params.id;
      // Fetch article
      const article = await storage.getArticle(articleId);

      // If no article (or DB error), explicitly let client handle 404 (by sending standard index.html)
      // We do NOT send 404 here because client app might have its own 404 page logic
      if (!article) {
        return next();
      }

      // Determine path to index.html
      // In production, it is in public folder. In dev, we might need a different approach.
      // But assuming 'npm run build' was run, 'dist/public/index.html' or 'client/index.html'?

      // We will read the TEMPLATE.
      // In production: dist/public/index.html
      // In dev: client/index.html

      let templatePath;
      if (process.env.NODE_ENV === "production" || fs.existsSync(path.resolve("dist/public/index.html"))) {
        templatePath = path.resolve("dist/public/index.html");
      } else {
        // In dev, usually we use client/index.html
        // But note: In dev, Vite transforms it. If we read raw file, it won't work (main.tsx wont load).
        // So for DEV environment, we often SKIP this injection or use Vite's transform.
        // Since user cares about SEO (Production), we prioritize Prod flow.
        templatePath = path.resolve("client/index.html");
      }

      if (!fs.existsSync(templatePath)) {
        console.warn("Could not find index.html for SEO injection");
        return next();
      }

      let html = await fs.promises.readFile(templatePath, "utf-8");

      // Replace Meta Tags
      const baseUrl = "https://realnews.uz"; // Ideally env
      const pageTitle = `${article.title.replace(/"/g, '&quot;')} - Real News`;
      const pageDescription = (article.excerpt || article.content.substring(0, 150)).replace(/"/g, '&quot;');
      // Use dynamic OG image
      const pageImage = `${baseUrl}/api/og/${article.id}?v=${new Date(article.updatedAt || new Date()).getTime()}`;

      // We look for standard meta tags and replace them
      // Or we can simple replace the PLACEHOLDERS if we have them, 
      // but index.html has defaults.

      // Strategy: Replace specific lines or use regex.
      // index.html has: <meta property="og:title" content="..." />

      html = html
        .replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`)
        .replace(/property="og:title" content=".*?"/, `property="og:title" content="${pageTitle}"`)
        .replace(/property="og:description" content=".*?"/, `property="og:description" content="${pageDescription}"`)
        .replace(/property="og:image" content=".*?"/, `property="og:image" content="${pageImage}"`)
        .replace(/name="twitter:title" content=".*?"/, `name="twitter:title" content="${pageTitle}"`)
        .replace(/name="twitter:description" content=".*?"/, `name="twitter:description" content="${pageDescription}"`)
        .replace(/name="twitter:image" content=".*?"/, `name="twitter:image" content="${pageImage}"`);

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      console.error("Error verifying article for SEO:", error);
      next(); // Fallback to standard flow
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
