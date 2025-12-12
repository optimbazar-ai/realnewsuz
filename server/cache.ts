// Simple in-memory cache for performance optimization

interface CacheItem<T> {
    data: T;
    expiry: number;
}

class MemoryCache {
    private cache: Map<string, CacheItem<any>> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Clean up expired items every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * Set a value in cache with TTL (time-to-live in seconds)
     */
    set<T>(key: string, data: T, ttlSeconds: number = 300): void {
        const expiry = Date.now() + ttlSeconds * 1000;
        this.cache.set(key, { data, expiry });
    }

    /**
     * Get a value from cache
     */
    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        const item = this.cache.get(key);
        if (!item) return false;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete a key from cache
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all keys matching a pattern
     */
    clearPattern(pattern: string): void {
        const regex = new RegExp(pattern);
        const keys = Array.from(this.cache.keys());
        for (const key of keys) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear the entire cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    stats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }

    /**
     * Clean up expired items
     */
    private cleanup(): void {
        const now = Date.now();
        let cleaned = 0;

        const entries = Array.from(this.cache.entries());
        for (const [key, item] of entries) {
            if (now > item.expiry) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cache cleanup: ${cleaned} expired items removed`);
        }
    }

    /**
     * Destroy the cache and clear interval
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cache.clear();
    }
}

// Export singleton instance
export const cache = new MemoryCache();

// Cache keys constants
export const CACHE_KEYS = {
    ARTICLES: "articles",
    PUBLISHED_ARTICLES: "published_articles",
    DRAFT_ARTICLES: "draft_articles",
    TRENDS: "trends",
    ARTICLE: (id: string) => `article:${id}`,
    RSS_FEEDS: "rss_feeds",
};

// Default TTL values (in seconds)
export const CACHE_TTL = {
    ARTICLES: 60, // 1 minute
    TRENDS: 300, // 5 minutes
    RSS_FEEDS: 600, // 10 minutes
};
