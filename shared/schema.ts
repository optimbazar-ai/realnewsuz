import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Articles table - stores all generated news articles
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  trendKeyword: text("trend_keyword"),
  status: text("status").notNull().default("draft"), // draft, scheduled, published, failed
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Trends table - stores detected trending topics
export const trends = pgTable("trends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull().unique(),
  score: integer("score").notNull().default(0),
  category: text("category"),
  region: text("region").default("UZ"),
  isProcessed: boolean("is_processed").notNull().default(false),
  detectedAt: timestamp("detected_at").notNull().default(sql`now()`),
  processedAt: timestamp("processed_at"),
});

// System logs table - tracks automation activity
export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(), // trend_detected, article_generated, article_published, error
  status: text("status").notNull(), // success, error, warning
  message: text("message").notNull(),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrendSchema = createInsertSchema(trends).omit({
  id: true,
  detectedAt: true,
  processedAt: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Trend = typeof trends.$inferSelect;
export type InsertTrend = z.infer<typeof insertTrendSchema>;

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;

// Update user schema to keep existing functionality
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
