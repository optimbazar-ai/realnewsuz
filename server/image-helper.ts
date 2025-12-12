import nodeFetch from "node-fetch";

/**
 * Check if an image URL is accessible and not blocked by hotlink protection
 * @param url Image URL to check
 * @returns true if image is accessible, false otherwise
 */
export async function isImageAccessible(url: string): Promise<boolean> {
    if (!url) return false;

    try {
        const response = await nodeFetch(url, {
            method: 'HEAD',
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RealNewsBot/1.0)',
                'Accept': 'image/*',
            },
        });

        // Check if response is OK and content type is image
        if (!response.ok) return false;

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) return false;

        // Check content length - very small images might be placeholder/error images
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) < 1000) return false;

        return true;
    } catch (error) {
        console.log(`Image not accessible: ${url}`, error);
        return false;
    }
}

/**
 * Get a working image URL - tries original first, falls back to Unsplash
 * @param originalUrl Original image URL from RSS
 * @param searchQuery Search query for Unsplash fallback
 * @param usedPhotoIds Already used photo IDs to avoid duplicates
 * @returns Image data with URL and photographer info
 */
export async function getWorkingImage(
    originalUrl: string | undefined,
    searchQuery: string,
    usedPhotoIds: string[] = []
): Promise<{
    imageUrl: string | null;
    photographerName: string | null;
    photographerUrl: string | null;
    photoId: string | null;
    source: 'original' | 'unsplash';
}> {
    // First, try the original image
    if (originalUrl && await isImageAccessible(originalUrl)) {
        console.log(`✅ Original image accessible: ${originalUrl.substring(0, 50)}...`);
        return {
            imageUrl: originalUrl,
            photographerName: null,
            photographerUrl: null,
            photoId: null,
            source: 'original',
        };
    }

    // Fallback to Unsplash
    console.log(`⚠️ Original image not accessible, falling back to Unsplash for: ${searchQuery}`);

    const { searchPhotoForArticle } = await import('./unsplash');
    const photo = await searchPhotoForArticle(searchQuery, usedPhotoIds);

    if (photo) {
        return {
            imageUrl: photo.imageUrl,
            photographerName: photo.photographerName,
            photographerUrl: photo.photographerUrl,
            photoId: photo.photoId,
            source: 'unsplash',
        };
    }

    return {
        imageUrl: null,
        photographerName: null,
        photographerUrl: null,
        photoId: null,
        source: 'unsplash',
    };
}
