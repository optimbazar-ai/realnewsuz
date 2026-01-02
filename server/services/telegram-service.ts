import TelegramBot from "node-telegram-bot-api";
import type { Article } from "@shared/schema";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.warn("⚠️  TELEGRAM_BOT_TOKEN not set. Telegram integration disabled.");
}

if (!process.env.TELEGRAM_CHANNEL_ID) {
  console.warn("⚠️  TELEGRAM_CHANNEL_ID not set. Telegram integration disabled.");
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token);
  console.log("✅ Telegram bot initialized successfully");
}

// Generate slug from title for SEO-friendly URLs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function sendArticleToChannel(article: Article): Promise<boolean> {
  if (!bot || !channelId) {
    console.log("⏭️  Telegram integration not configured, skipping channel notification");
    return false;
  }

  try {
    const siteUrl = process.env.BASE_URL || (process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : 'https://realnews.uz');
    
    const slug = generateSlug(article.title);
    const articleUrl = `${siteUrl}/article/${article.id}/${slug}`;

    const caption = `<b>${article.title}</b>\n\n${article.excerpt}`;

    if (article.imageUrl) {
      await bot.sendPhoto(channelId, article.imageUrl, {
        caption: caption,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📖 To'liq o'qish", url: articleUrl }]
          ]
        }
      });
    } else {
      await bot.sendMessage(channelId, caption, {
        parse_mode: "HTML",
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: [
            [{ text: "📖 To'liq o'qish", url: articleUrl }]
          ]
        }
      });
    }

    console.log(`✅ Article "${article.title}" sent to Telegram channel`);
    return true;
  } catch (error) {
    console.error("❌ Error sending article to Telegram:", error);
    return false;
  }
}

export async function testTelegramConnection(): Promise<boolean> {
  if (!bot || !channelId) {
    console.log("⏭️  Telegram not configured");
    return false;
  }

  try {
    await bot.sendMessage(
      channelId,
      "✅ <b>Real News Bot Test</b>\n\nTelegram integratsiyasi muvaffaqiyatli ishlayapti!",
      { parse_mode: "HTML" }
    );
    console.log("✅ Telegram test message sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Telegram test failed:", error);
    return false;
  }
}
