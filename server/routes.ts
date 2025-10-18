import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { initializeScheduler } from "./scheduler";
import { fetchTrendingTopics } from "./services/trend-service";
import { generateArticleFromTrendId } from "./services/article-service";
import { 
  generateArticleFromLocalRSS,
  generateArticleFromForeignRSS,
  generateArticlesFromAllSources
} from "./article-generator";
import { RSS_FEEDS } from "./rss";
import { z } from "zod";
import passport, { requireAuth } from "./auth";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertArticleSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the scheduler
  initializeScheduler();

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

  app.post("/api/auth/login", (req, res, next) => {
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

  // Articles endpoints
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
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

      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ error: "Failed to update article" });
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
  app.post("/api/articles/generate/local-rss", requireAuth, async (req, res) => {
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

  app.post("/api/articles/generate/foreign-rss", requireAuth, async (req, res) => {
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

  app.post("/api/articles/generate/all", requireAuth, async (req, res) => {
    try {
      const results = await generateArticlesFromAllSources();
      const createdArticles = [];
      
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

  const httpServer = createServer(app);
  return httpServer;
}
