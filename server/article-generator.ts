import {
  generateArticleFromTrend,
  categorizeTrend,
  rewriteLocalArticle,
  translateAndRewriteForeignArticle
} from "./gemini";
import { searchPhotoForArticle } from "./unsplash";
import { fetchRSSFeed, RSSArticle, RSS_FEEDS } from "./rss";
import { storage } from "./storage";
import type { InsertArticle } from "@shared/schema";

export async function generateArticleFromAITrend(
  keyword: string,
  usedPhotoIds: string[] = []
): Promise<InsertArticle> {
  const category = await categorizeTrend(keyword);
  const article = await generateArticleFromTrend(keyword, category);

  const photo = await searchPhotoForArticle(keyword, usedPhotoIds);

  return {
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    category,
    trendKeyword: keyword,
    sourceType: "AI_TREND",
    sourceUrl: null,
    imageUrl: photo?.imageUrl || null,
    photographerName: photo?.photographerName || null,
    photographerUrl: photo?.photographerUrl || null,
    photoId: photo?.photoId || null,
    status: "draft",
    publishedAt: null,
  };
}

export async function generateArticleFromLocalRSS(
  feedUrl: string,
  usedPhotoIds: string[] = []
): Promise<InsertArticle | null> {
  try {
    const feed = await fetchRSSFeed(feedUrl);

    if (feed.articles.length === 0) {
      console.log("No articles found in RSS feed");
      return null;
    }

    const rssArticle = feed.articles[0];

    if (!rssArticle.content || rssArticle.content.length < 100) {
      console.log("Article content too short, skipping");
      return null;
    }

    const rewrittenArticle = await rewriteLocalArticle(
      rssArticle.title,
      rssArticle.content,
      rssArticle.link
    );

    const category = await categorizeTrend(rssArticle.title);

    const photo = await searchPhotoForArticle(rssArticle.title, usedPhotoIds);

    return {
      title: rewrittenArticle.title,
      content: rewrittenArticle.content,
      excerpt: rewrittenArticle.excerpt,
      category,
      trendKeyword: null,
      sourceType: "LOCAL_RSS",
      sourceUrl: rssArticle.link,
      imageUrl: photo?.imageUrl || null,
      photographerName: photo?.photographerName || null,
      photographerUrl: photo?.photographerUrl || null,
      photoId: photo?.photoId || null,
      status: "draft",
      publishedAt: null,
    };
  } catch (error) {
    console.error("Error generating article from local RSS:", error);
    return null;
  }
}

export async function generateArticleFromForeignRSS(
  feedUrl: string,
  usedPhotoIds: string[] = []
): Promise<InsertArticle | null> {
  try {
    const feed = await fetchRSSFeed(feedUrl);

    if (feed.articles.length === 0) {
      console.log("No articles found in RSS feed");
      return null;
    }

    const rssArticle = feed.articles[0];

    if (!rssArticle.content || rssArticle.content.length < 100) {
      console.log("Article content too short, skipping");
      return null;
    }

    const translatedArticle = await translateAndRewriteForeignArticle(
      rssArticle.title,
      rssArticle.content,
      rssArticle.link
    );

    const category = await categorizeTrend(translatedArticle.title);

    // Always use Unsplash - external images are blocked by hotlink protection
    const photo = await searchPhotoForArticle(translatedArticle.title, usedPhotoIds);
    const imageUrl = photo?.imageUrl || null;
    const photographerName = photo?.photographerName || null;
    const photographerUrl = photo?.photographerUrl || null;
    const photoId = photo?.photoId || null;

    return {
      title: translatedArticle.title,
      content: translatedArticle.content,
      excerpt: translatedArticle.excerpt,
      category,
      trendKeyword: null,
      sourceType: "FOREIGN_RSS",
      sourceUrl: rssArticle.link,
      imageUrl,
      photographerName,
      photographerUrl,
      photoId,
      status: "draft",
      publishedAt: null,
    };
  } catch (error) {
    console.error("Error generating article from foreign RSS:", error);
    return null;
  }
}

export async function generateArticlesFromAllSources(): Promise<{
  aiTrend: InsertArticle | null;
  localRSS: InsertArticle | null;
  foreignRSS: InsertArticle | null;
}> {
  const usedPhotoIds: string[] = [];

  const articles = await storage.getAllArticles();
  articles.forEach(article => {
    if (article.photoId) {
      usedPhotoIds.push(article.photoId);
    }
  });

  let aiTrend: InsertArticle | null = null;
  let localRSS: InsertArticle | null = null;
  let foreignRSS: InsertArticle | null = null;

  try {
    const trends = await storage.getAllTrends();
    const unprocessedTrend = trends.find(t => !t.isProcessed);

    if (unprocessedTrend) {
      aiTrend = await generateArticleFromAITrend(unprocessedTrend.keyword, usedPhotoIds);
      await storage.markTrendAsProcessed(unprocessedTrend.id);
    } else {
      console.log("No unprocessed trends available for AI article generation");
    }
  } catch (error) {
    console.error("Error generating AI trend article:", error);
  }

  try {
    localRSS = await generateArticleFromLocalRSS(RSS_FEEDS.LOCAL.KUN_UZ, usedPhotoIds);
  } catch (error) {
    console.error("Error generating local RSS article:", error);
  }

  try {
    foreignRSS = await generateArticleFromForeignRSS(RSS_FEEDS.FOREIGN.BBC_SPORT, usedPhotoIds);
  } catch (error) {
    console.error("Error generating foreign RSS article:", error);
  }

  return { aiTrend, localRSS, foreignRSS };
}
