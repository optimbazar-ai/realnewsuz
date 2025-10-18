import Parser from "rss-parser";

export interface RSSArticle {
  title: string;
  link: string;
  pubDate?: Date;
  content?: string;
  contentSnippet?: string;
  imageUrl?: string;
  category?: string;
}

export interface RSSFeed {
  title: string;
  description?: string;
  link?: string;
  articles: RSSArticle[];
}

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'fullContent'],
      ['description', 'description'],
    ],
  },
});

export async function fetchRSSFeed(feedUrl: string): Promise<RSSFeed> {
  try {
    const feed = await parser.parseURL(feedUrl);
    
    const articles: RSSArticle[] = feed.items.map((item: any) => {
      const imageUrl = extractImageFromItem(item);
      
      const content = item.fullContent || item.content || item.description || item.contentSnippet || '';
      
      return {
        title: item.title || 'Untitled',
        link: item.link || '',
        pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
        content: cleanContent(content),
        contentSnippet: item.contentSnippet || '',
        imageUrl,
        category: Array.isArray(item.categories) ? item.categories[0] : undefined,
      };
    });

    return {
      title: feed.title || '',
      description: feed.description,
      link: feed.link,
      articles,
    };
  } catch (error) {
    console.error(`Error fetching RSS feed from ${feedUrl}:`, error);
    throw new Error(`Failed to fetch RSS feed: ${error}`);
  }
}

function extractImageFromItem(item: any): string | undefined {
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  if (item.media && item.media.$) {
    return item.media.$.url;
  }
  
  if (item.media && item.media.url) {
    return item.media.url;
  }
  
  const content = item.fullContent || item.content || item.description || '';
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  return undefined;
}

function cleanContent(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export const RSS_FEEDS = {
  LOCAL: {
    KUN_UZ: 'https://kun.uz/feed',
    DARYO_UZ: 'https://daryo.uz/feed/',
    GAZETA_UZ: 'https://www.gazeta.uz/ru/rss/',
  },
  FOREIGN: {
    BBC_SPORT: 'https://feeds.bbci.co.uk/sport/rss.xml',
    ESPN_FOOTBALL: 'https://www.espn.com/espn/rss/soccer/news',
    TECHCRUNCH: 'https://techcrunch.com/feed/',
    THE_VERGE_TECH: 'https://www.theverge.com/rss/index.xml',
  },
};
