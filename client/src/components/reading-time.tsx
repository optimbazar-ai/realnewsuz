interface ReadingTimeProps {
    content: string;
    className?: string;
}

export function ReadingTime({ content, className = '' }: ReadingTimeProps) {
    // Average reading speed: 200 words per minute for Uzbek
    const wordsPerMinute = 200;

    // Count words (split by whitespace)
    const wordCount = content.trim().split(/\s+/).length;

    // Calculate reading time
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    return (
        <span className={`text-sm text-muted-foreground flex items-center gap-1 ${className}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
            {minutes} daqiqa o'qish
        </span>
    );
}

// Helper function to calculate reading time
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}
