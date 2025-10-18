import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initializeScheduler } from "./scheduler";
import { fetchTrendingTopics } from "./services/trend-service";
import { generateArticleFromTrendId } from "./services/article-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the scheduler
  initializeScheduler();

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

  app.delete("/api/articles/:id", async (req, res) => {
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

  app.post("/api/trends/fetch", async (req, res) => {
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

  app.post("/api/trends/generate", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
