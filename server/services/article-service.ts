import { storage } from "../storage";
import { generateArticleFromTrend } from "../gemini";
import { searchPhotoForArticle } from "../unsplash";
import { 
  generateArticleFromLocalRSS, 
  generateArticleFromForeignRSS 
} from "../article-generator";
import { getAllLocalFeeds, getAllForeignFeeds } from "../rss";

// Kutilmagan xatoliklar uchun pauza yaratuvchi yordamchi funksiya
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function generateArticleFromTrendId(trendId: string): Promise<void> {
  try {
    const trend = await storage.getTrend(trendId);
    
    if (!trend) {
      throw new Error("Trend topilmadi");
    }

    if (trend.isProcessed) {
      throw new Error("Bu trend allaqachon qayta ishlangan");
    }

    // Generate article using Gemini AI with retry mechanism
    let articleData: { title: string; content: string; excerpt: string } | null = null;
    const maxRetries = 3; // Jami 3 marta urinib ko'ramiz
    const retryDelay = 40000; // 40 soniya

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📝 Attempt ${attempt}/${maxRetries} to generate article for trend: "${trend.keyword}"`);
        
        // Gemini funksiyasini chaqirish
        articleData = await generateArticleFromTrend(trend.keyword, trend.category || undefined);
        
        // Agar muvaffaqiyatli bo'lsa, tsikldan chiqamiz
        console.log(`✅ Successfully generated article on attempt ${attempt}`);
        break;

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          // Bu oxirgi urinish edi, xatolikni yuqoriga uzatamiz
          throw new Error(`Failed to generate article after ${maxRetries} attempts: ${error}`);
        }
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await delay(retryDelay); // Keyingi urinishdan oldin kutish
      }
    }

    if (!articleData) {
      throw new Error("Article content is null after generation attempts");
    }

    // Get all existing articles to check which photos have been used
    const existingArticles = await storage.getAllArticles();
    const usedPhotoIds = existingArticles
      .map(a => a.photoId)
      .filter((id): id is string => id !== null);

    // Search for related image from Unsplash with retry mechanism
    let photoData = null;
    const unsplashMaxRetries = 2;
    const unsplashRetryDelay = 15000; // 15 soniya

    for (let attempt = 1; attempt <= unsplashMaxRetries; attempt++) {
      try {
        console.log(`🖼️ Attempt ${attempt}/${unsplashMaxRetries} to find image for: "${trend.keyword}"`);
        photoData = await searchPhotoForArticle(trend.keyword, usedPhotoIds);
        
        if (photoData) {
          console.log(`✅ Successfully found image on attempt ${attempt}`);
          break;
        } else {
          // No image found - treat as failed attempt
          console.warn(`❌ No image found on attempt ${attempt}`);
          if (attempt < unsplashMaxRetries) {
            console.log(`⏳ Retrying image search in ${unsplashRetryDelay / 1000} seconds...`);
            await delay(unsplashRetryDelay);
          } else {
            console.warn(`⚠️ Could not fetch image for "${trend.keyword}" after ${unsplashMaxRetries} attempts. Proceeding without image.`);
          }
        }
      } catch (error) {
        console.error(`❌ Unsplash API error on attempt ${attempt}:`, error);
        if (attempt < unsplashMaxRetries) {
          console.log(`⏳ Retrying image search in ${unsplashRetryDelay / 1000} seconds...`);
          await delay(unsplashRetryDelay);
        } else {
          console.warn(`⚠️ Could not fetch image for "${trend.keyword}" after ${unsplashMaxRetries} attempts. Proceeding without image.`);
        }
      }
    }

    // Determine article status based on whether image was found
    const articleStatus = photoData ? "published" : "draft";

    // Create article
    const article = await storage.createArticle({
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      category: trend.category || "Boshqa",
      trendKeyword: trend.keyword,
      status: articleStatus,
      publishedAt: photoData ? new Date() : null,
      imageUrl: photoData?.imageUrl || null,
      photographerName: photoData?.photographerName || null,
      photographerUrl: photoData?.photographerUrl || null,
      photoId: photoData?.photoId || null,
    });

    // Mark trend as processed
    await storage.markTrendAsProcessed(trendId);

    // Log success
    const logMessage = photoData 
      ? `Maqola yaratildi: ${articleData.title}`
      : `Maqola yaratildi (draft, rasmSIZ): ${articleData.title}`;
    
    await storage.createLog({
      action: "article_generated",
      status: "success",
      message: logMessage,
      metadata: JSON.stringify({ 
        articleId: article.id, 
        trendId, 
        hasImage: !!photoData,
        status: articleStatus 
      }),
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

export async function autoGenerateRSSArticles(): Promise<void> {
  try {
    console.log("📰 Starting automated RSS article generation...");
    console.log("ℹ️  SOURCE-BASED CONTENT MODEL: Processing all trusted RSS feeds");
    
    // Get all existing articles to track used photos
    const existingArticles = await storage.getAllArticles();
    const usedPhotoIds = existingArticles
      .map(a => a.photoId)
      .filter((id): id is string => id !== null);

    // Get existing article source URLs to avoid duplicates (CRITICAL!)
    const existingSourceUrls = new Set(
      existingArticles
        .map(a => a.sourceUrl)
        .filter((url): url is string => url !== null)
    );

    let articlesCreated = 0;
    const errors: string[] = [];

    // Process LOCAL RSS feeds (Uzbek news)
    const localFeeds = getAllLocalFeeds();
    console.log(`📊 Found ${localFeeds.length} local RSS feeds to process`);
    
    for (const feed of localFeeds) {
      try {
        console.log(`📰 Processing local RSS: ${feed.name} (${feed.language})`);
        const articleData = await generateArticleFromLocalRSS(feed.url, usedPhotoIds);
        
        if (articleData && articleData.sourceUrl && !existingSourceUrls.has(articleData.sourceUrl)) {
          await storage.createArticle(articleData);
          existingSourceUrls.add(articleData.sourceUrl);
          articlesCreated++;
          console.log(`✅ Created draft article from ${feed.name}: "${articleData.title}"`);
          
          await storage.createLog({
            action: "rss_article_generated",
            status: "success",
            message: `RSS maqola yaratildi (${feed.name}): ${articleData.title}`,
            metadata: JSON.stringify({ 
              source: feed.name, 
              sourceType: "LOCAL_RSS",
              language: feed.language 
            }),
          });
        } else if (articleData && existingSourceUrls.has(articleData.sourceUrl!)) {
          console.log(`⏭️ Skipping duplicate article from ${feed.name}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${feed.name}:`, error);
        errors.push(`${feed.name}: ${error}`);
      }
    }

    // Process FOREIGN RSS feeds (International news - translate to Uzbek)
    const foreignFeeds = getAllForeignFeeds();
    console.log(`🌍 Found ${foreignFeeds.length} foreign RSS feeds to process`);
    
    for (const feed of foreignFeeds) {
      try {
        console.log(`🌍 Processing foreign RSS: ${feed.name} (${feed.category})`);
        const articleData = await generateArticleFromForeignRSS(feed.url, usedPhotoIds);
        
        if (articleData && articleData.sourceUrl && !existingSourceUrls.has(articleData.sourceUrl)) {
          await storage.createArticle(articleData);
          existingSourceUrls.add(articleData.sourceUrl);
          articlesCreated++;
          console.log(`✅ Created draft article from ${feed.name}: "${articleData.title}"`);
          
          await storage.createLog({
            action: "rss_article_generated",
            status: "success",
            message: `Xorijiy RSS maqola tarjima qilindi (${feed.name}): ${articleData.title}`,
            metadata: JSON.stringify({ 
              source: feed.name, 
              sourceType: "FOREIGN_RSS",
              category: feed.category 
            }),
          });
        } else if (articleData && existingSourceUrls.has(articleData.sourceUrl!)) {
          console.log(`⏭️ Skipping duplicate article from ${feed.name}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${feed.name}:`, error);
        errors.push(`${feed.name}: ${error}`);
      }
    }

    const finalMessage = errors.length > 0
      ? `RSS maqolalar yaratildi: ${articlesCreated} ta. Xatoliklar: ${errors.length} ta`
      : `RSS maqolalar yaratildi: ${articlesCreated} ta (qoralamalar bo'limida)`;

    await storage.createLog({
      action: "auto_rss_generation",
      status: errors.length > 0 ? "partial_success" : "success",
      message: finalMessage,
      metadata: JSON.stringify({ 
        articlesCreated, 
        errors,
        totalFeedsProcessed: localFeeds.length + foreignFeeds.length,
        localFeeds: localFeeds.length,
        foreignFeeds: foreignFeeds.length
      }),
    });

    console.log(`✅ RSS automation complete: ${articlesCreated} articles created from ${localFeeds.length + foreignFeeds.length} feeds`);
  } catch (error) {
    console.error("❌ Error in RSS auto-generation:", error);
    await storage.createLog({
      action: "auto_rss_generation",
      status: "error",
      message: `RSS avtomatizatsiyasida xatolik: ${error}`,
    });
  }
}
