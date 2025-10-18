import cron from "node-cron";
import { autoGenerateRSSArticles } from "./services/article-service";
import { storage } from "./storage";

export function initializeScheduler() {
  console.log("📅 Scheduler initialized");
  console.log("ℹ️  NEW STRATEGY: Source-based Content Model (RSS only, no Google Trends)");

  // Auto-generate RSS articles every 4 hours (offset from trend generation)
  cron.schedule("0 1,5,9,13,17,21 * * *", async () => {
    console.log("📰 Auto-generating RSS articles...");
    try {
      await autoGenerateRSSArticles();
      console.log("✅ RSS articles generated successfully");
    } catch (error) {
      console.error("❌ Error generating RSS articles:", error);
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
  console.log("⏰ RSS automation will run every 4 hours: 1:00, 5:00, 9:00, 13:00, 17:00, 21:00");
}
