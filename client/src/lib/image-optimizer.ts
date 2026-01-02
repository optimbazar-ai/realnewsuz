/**
 * Optimizes image URLs for better performance
 * Currently supports Unsplash and generic URLs
 */
export function getOptimizedImageUrl(url: string | null | undefined, width: number = 800): string {
    if (!url) return '/og-default.jpg';

    // Check if it's an Unsplash URL
    if (url.includes('images.unsplash.com')) {
        // Check if it already has parameters
        const separator = url.includes('?') ? '&' : '?';
        // Append width, quality (80%), and format (auto/webp)
        // If width param already exists, this might append another, but Unsplash usually takes the last one or we can replace.
        // Simpler approach: if it has query params, try to replace w=...

        if (url.includes('w=')) {
            return url.replace(/w=\d+/, `w=${width}`).replace(/q=\d+/, 'q=80');
        }

        return `${url}${separator}w=${width}&q=80&auto=format`;
    }

    return url;
}
