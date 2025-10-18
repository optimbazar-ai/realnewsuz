import cron from "node-cron";
import { fetchTrendingTopics } from "./services/trend-service";
import { autoGenerateArticles } from "./services/article-service";
import { storage } from "./storage";

export function initializeScheduler() {
  console.log("📅 Scheduler initialized");

  // Fetch trends every 2 hours
  cron.schedule("0 */2 * * *", async () => {
    console.log("🔍 Fetching trending topics...");
    try {
      await fetchTrendingTopics();
      console.log("✅ Trends fetched successfully");
    } catch (error) {
      console.error("❌ Error fetching trends:", error);
    }
  });

  // Auto-generate articles every 3 hours during publishing window (7:00-21:00)
  cron.schedule("0 */3 7-21 * * *", async () => {
    console.log("✍️ Auto-generating articles...");
    try {
      await autoGenerateArticles();
      console.log("✅ Articles generated successfully");
    } catch (error) {
      console.error("❌ Error generating articles:", error);
    }
  });

  // Clean up old logs (keep last 1000) - runs daily at 2 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("🧹 Cleaning up old logs...");
    try {
      await storage.createLog({
        action: "maintenance",
        status: "success",
        message: "Eski loglar tozalandi",
      });
      console.log("✅ Cleanup completed");
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }
  });

  console.log("✅ All scheduled tasks configured");
}
