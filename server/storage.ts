// Reference: javascript_database blueprint
import { 
  users, 
  articles, 
  trends, 
  systemLogs,
  type User, 
  type InsertUser,
  type Article,
  type InsertArticle,
  type Trend,
  type InsertTrend,
  type SystemLog,
  type InsertSystemLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Articles
  getAllArticles(): Promise<Article[]>;
  getDraftArticles(): Promise<Article[]>;
  getPublishedArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  publishArticle(id: string): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<void>;
  
  // Trends
  getAllTrends(): Promise<Trend[]>;
  getTrend(id: string): Promise<Trend | undefined>;
  getTrendByKeyword(keyword: string): Promise<Trend | undefined>;
  createTrend(trend: InsertTrend): Promise<Trend>;
  updateTrend(id: string, trend: Partial<InsertTrend>): Promise<Trend | undefined>;
  markTrendAsProcessed(id: string): Promise<void>;
  
  // System Logs
  getAllLogs(): Promise<SystemLog[]>;
  createLog(log: InsertSystemLog): Promise<SystemLog>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Articles
  async getAllArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getDraftArticles(): Promise<Article[]> {
    return await db.select().from(articles)
      .where(eq(articles.status, 'draft'))
      .orderBy(desc(articles.createdAt));
  }

  async getPublishedArticles(): Promise<Article[]> {
    return await db.select().from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt));
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning();
    return article;
  }

  async updateArticle(id: string, updateData: Partial<InsertArticle>): Promise<Article | undefined> {
    const [article] = await db
      .update(articles)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return article || undefined;
  }

  async publishArticle(id: string): Promise<Article | undefined> {
    const [article] = await db
      .update(articles)
      .set({ 
        status: 'published', 
        publishedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(articles.id, id))
      .returning();
    return article || undefined;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  // Trends
  async getAllTrends(): Promise<Trend[]> {
    return await db.select().from(trends).orderBy(desc(trends.detectedAt));
  }

  async getTrend(id: string): Promise<Trend | undefined> {
    const [trend] = await db.select().from(trends).where(eq(trends.id, id));
    return trend || undefined;
  }

  async getTrendByKeyword(keyword: string): Promise<Trend | undefined> {
    const [trend] = await db.select().from(trends).where(eq(trends.keyword, keyword));
    return trend || undefined;
  }

  async createTrend(insertTrend: InsertTrend): Promise<Trend> {
    const [trend] = await db
      .insert(trends)
      .values(insertTrend)
      .returning();
    return trend;
  }

  async updateTrend(id: string, updateData: Partial<InsertTrend>): Promise<Trend | undefined> {
    const [trend] = await db
      .update(trends)
      .set(updateData)
      .where(eq(trends.id, id))
      .returning();
    return trend || undefined;
  }

  async markTrendAsProcessed(id: string): Promise<void> {
    await db
      .update(trends)
      .set({ isProcessed: true, processedAt: new Date() })
      .where(eq(trends.id, id));
  }

  // System Logs
  async getAllLogs(): Promise<SystemLog[]> {
    return await db.select().from(systemLogs).orderBy(desc(systemLogs.createdAt)).limit(100);
  }

  async createLog(insertLog: InsertSystemLog): Promise<SystemLog> {
    const [log] = await db
      .insert(systemLogs)
      .values(insertLog)
      .returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
