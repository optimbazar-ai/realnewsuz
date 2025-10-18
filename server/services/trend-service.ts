import { storage } from "../storage";
import { categorizeTrend } from "../gemini";

// Mock Google Trends data - in production, integrate with google-trends-api or similar
const MOCK_TRENDING_TOPICS = [
  { keyword: "O'zbekiston futbol jamoasi", score: 95 },
  { keyword: "Toshkentda yangi metro stansiyasi", score: 88 },
  { keyword: "Raqamli iqtisodiyot", score: 82 },
  { keyword: "Qishloq xo'jaligi yangiliklari", score: 78 },
  { keyword: "Ta'lim tizimida islohotlar", score: 75 },
  { keyword: "IT sohasida ish o'rinlari", score: 72 },
  { keyword: "Toshkent shahar reja", score: 68 },
  { keyword: "Startup ekotizimi", score: 65 },
];

export async function fetchTrendingTopics(): Promise<void> {
  try {
    // In production, fetch real trends from Google Trends API
    // For now, use mock data
    const trends = MOCK_TRENDING_TOPICS;

    for (const trend of trends) {
      // Check if trend already exists
      const existing = await storage.getTrendByKeyword(trend.keyword);
      
      if (!existing) {
        // Categorize the trend using AI
        const category = await categorizeTrend(trend.keyword);
        
        // Create new trend
        await storage.createTrend({
          keyword: trend.keyword,
          score: trend.score,
          category,
          region: "UZ",
          isProcessed: false,
        });

        await storage.createLog({
          action: "trend_detected",
          status: "success",
          message: `Yangi trend topildi: ${trend.keyword}`,
          metadata: JSON.stringify({ keyword: trend.keyword, score: trend.score }),
        });
      }
    }
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    await storage.createLog({
      action: "trend_detected",
      status: "error",
      message: `Trendlarni olishda xatolik: ${error}`,
    });
    throw error;
  }
}
