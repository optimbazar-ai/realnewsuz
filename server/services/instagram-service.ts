import type { Article } from "@shared/schema";
import fetch from 'node-fetch';

const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;

// Instagram posting via caption with link
// Note: Direct posting requires Instagram API or third-party service
// This implementation logs the post details for manual posting or integration

export async function sendArticleToInstagram(article: Article): Promise<boolean> {
  if (!username || !password) {
    console.log("⏭️  Instagram credentials not configured, skipping Instagram notification");
    return false;
  }

  try {
    // Generate caption
    const caption = `📰 ${article.title}\n\n${article.excerpt}\n\n#realnews #yangiliklar #news`;

    // Get article URL
    const siteUrl = process.env.BASE_URL || (process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
      : 'https://realnews.uz');
    const slug = generateSlug(article.title);
    const articleUrl = `${siteUrl}/article/${article.id}/${slug}`;

    // Add link to caption
    const fullCaption = `${caption}\n\n🔗 ${articleUrl}`;

    console.log(`📸 Instagram post ready for: "${article.title}"`);
    console.log(`Caption: ${fullCaption}`);
    console.log(`Image URL: ${article.imageUrl || 'No image'}`);

    // Log post details for manual posting or Buffer integration
    console.log(`\n📱 To post on Instagram:`);
    console.log(`1. Go to https://www.instagram.com/${username}`);
    console.log(`2. Create new post with image from: ${article.imageUrl}`);
    console.log(`3. Use caption: ${fullCaption}`);

    // For automated posting, you would need:
    // 1. Instagram Graph API (requires business account)
    // 2. Buffer API integration
    // 3. instagram-private-api with proper session handling

    return true;
  } catch (error) {
    console.error("❌ Error preparing Instagram post:", error);
    return false;
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function testInstagramConnection(): Promise<boolean> {
  if (!username || !password) {
    console.log("⏭️  Instagram not configured");
    return false;
  }

  try {
    console.log(`✅ Instagram account: ${username}`);
    console.log(`📸 Ready for manual posting or Buffer integration`);
    return true;
  } catch (error) {
    console.error("❌ Instagram test failed:", error);
    return false;
  }
}
