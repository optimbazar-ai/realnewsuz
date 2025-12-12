import { Link } from 'wouter';

interface Article {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    imageUrl?: string | null;
    createdAt: string;
}

interface RelatedArticlesProps {
    articles: Article[];
    currentArticleId: string;
    category: string;
}

export function RelatedArticles({ articles, currentArticleId, category }: RelatedArticlesProps) {
    // Filter out current article and get articles from same category
    const relatedArticles = articles
        .filter(article => article.id !== currentArticleId)
        .filter(article => article.category === category)
        .slice(0, 3);

    // If not enough articles from same category, add others
    if (relatedArticles.length < 3) {
        const otherArticles = articles
            .filter(article => article.id !== currentArticleId)
            .filter(article => article.category !== category)
            .slice(0, 3 - relatedArticles.length);
        relatedArticles.push(...otherArticles);
    }

    if (relatedArticles.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8" />
                    <path d="M15 18h-5" />
                    <path d="M10 6h8v4h-8V6Z" />
                </svg>
                O'xshash maqolalar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((article) => (
                    <Link key={article.id} href={`/article/${article.id}`}>
                        <div className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer">
                            {article.imageUrl && (
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                                    {article.category}
                                </span>
                                <h4 className="font-semibold text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                                    {article.title}
                                </h4>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
