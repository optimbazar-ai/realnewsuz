import Parser from "rss-parser";
import { readFileSync } from 'fs';
import { join } from 'path';

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

export interface RSSFeedConfig {
  name: string;
  url: string;
  description: string;
  language: string;
  category?: string;
}

export interface RSSFeedsConfig {
  local: {
    uzbekistan: RSSFeedConfig[];
  };
  foreign: {
    sports: RSSFeedConfig[];
    technology: RSSFeedConfig[];
    world_news: RSSFeedConfig[];
    business: RSSFeedConfig[];
    science: RSSFeedConfig[];
  };
}

let rssConfig: RSSFeedsConfig | null = null;

export function loadRSSConfig(): RSSFeedsConfig {
  if (rssConfig) {
    return rssConfig;
  }

  try {
    const configPath = join(process.cwd(), 'config', 'rss-feeds.json');
    const configData = readFileSync(configPath, 'utf-8');
    rssConfig = JSON.parse(configData);
    console.log('✅ RSS feeds configuration loaded successfully');
    return rssConfig!;
  } catch (error) {
    console.error('❌ Error loading RSS feeds config:', error);
    throw new Error(`Failed to load RSS feeds configuration: ${error}`);
  }
}

export function getAllLocalFeeds(): RSSFeedConfig[] {
  const config = loadRSSConfig();
  return config.local.uzbekistan;
}

export function getAllForeignFeeds(): RSSFeedConfig[] {
  const config = loadRSSConfig();
  return [
    ...config.foreign.sports,
    ...config.foreign.technology,
    ...config.foreign.world_news,
    ...config.foreign.business,
    ...config.foreign.science,
  ];
}

export function getFeedsByCategory(category: string): RSSFeedConfig[] {
  const config = loadRSSConfig();
  const allFeeds = getAllForeignFeeds();
  return allFeeds.filter(feed => feed.category === category);
}

// Legacy compatibility - keep old structure for backward compatibility
export const RSS_FEEDS = {
  LOCAL: {
    get KUN_UZ() { return getAllLocalFeeds()[0]?.url || 'https://kun.uz/feed'; },
    get DARYO_UZ() { return getAllLocalFeeds()[1]?.url || 'https://daryo.uz/feed/'; },
    get GAZETA_UZ() { return getAllLocalFeeds()[2]?.url || 'https://www.gazeta.uz/ru/rss/'; },
  },
  FOREIGN: {
    get BBC_SPORT() { return getAllForeignFeeds().find(f => f.name === 'BBC Sport')?.url || 'https://feeds.bbci.co.uk/sport/rss.xml'; },
    get ESPN_FOOTBALL() { return getAllForeignFeeds().find(f => f.name === 'ESPN Football')?.url || 'https://www.espn.com/espn/rss/soccer/news'; },
    get TECHCRUNCH() { return getAllForeignFeeds().find(f => f.name === 'TechCrunch')?.url || 'https://techcrunch.com/feed/'; },
    get THE_VERGE_TECH() { return getAllForeignFeeds().find(f => f.name === 'The Verge Tech')?.url || 'https://www.theverge.com/rss/index.xml'; },
  },
};
