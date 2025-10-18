import { storage } from "../storage";
import { generateArticleFromTrend } from "../gemini";
import { searchPhotoForArticle } from "../unsplash";

export async function generateArticleFromTrendId(trendId: string): Promise<void> {
  try {
    const trend = await storage.getTrend(trendId);
    
    if (!trend) {
      throw new Error("Trend topilmadi");
    }

    if (trend.isProcessed) {
      throw new Error("Bu trend allaqachon qayta ishlangan");
    }

    // Generate article using Gemini AI
    const articleData = await generateArticleFromTrend(trend.keyword, trend.category || undefined);

    // Get all existing articles to check which photos have been used
    const existingArticles = await storage.getAllArticles();
    const usedPhotoIds = existingArticles
      .map(a => a.photoId)
      .filter((id): id is string => id !== null);

    // Search for related image from Unsplash (avoiding already used photos)
    const photoData = await searchPhotoForArticle(trend.keyword, usedPhotoIds);

    // Create article
    const article = await storage.createArticle({
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      category: trend.category || "Boshqa",
      trendKeyword: trend.keyword,
      status: "published",
      publishedAt: new Date(),
      imageUrl: photoData?.imageUrl || null,
      photographerName: photoData?.photographerName || null,
      photographerUrl: photoData?.photographerUrl || null,
      photoId: photoData?.photoId || null,
    });

    // Mark trend as processed
    await storage.markTrendAsProcessed(trendId);

    // Log success
    await storage.createLog({
      action: "article_generated",
      status: "success",
      message: `Maqola yaratildi: ${articleData.title}`,
      metadata: JSON.stringify({ articleId: article.id, trendId }),
    });

  } catch (error) {
    console.error("Error generating article:", error);
    await storage.createLog({
      action: "article_generated",
      status: "error",
      message: `Maqola yaratishda xatolik: ${error}`,
      metadata: JSON.stringify({ trendId }),
    });
    throw error;
  }
}

export async function autoGenerateArticles(): Promise<void> {
  try {
    // Get unprocessed trends
    const allTrends = await storage.getAllTrends();
    const unprocessedTrends = allTrends.filter(t => !t.isProcessed);

    // Generate articles for top 3 unprocessed trends
    const trendsToProcess = unprocessedTrends.slice(0, 3);

    for (const trend of trendsToProcess) {
      await generateArticleFromTrendId(trend.id);
    }

    await storage.createLog({
      action: "auto_generation",
      status: "success",
      message: `Avtomatik ravishda ${trendsToProcess.length} ta maqola yaratildi`,
    });
  } catch (error) {
    console.error("Error in auto-generation:", error);
    await storage.createLog({
      action: "auto_generation",
      status: "error",
      message: `Avtomatik generatsiyada xatolik: ${error}`,
    });
  }
}
