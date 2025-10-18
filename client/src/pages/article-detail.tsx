import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Article } from "@shared/schema";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:id");
  const articleId = params?.id;

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !!articleId,
  });

  const { data: relatedArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-muted rounded animate-pulse mb-8 w-32" />
            <div className="h-12 bg-muted rounded animate-pulse mb-4" />
            <div className="h-6 bg-muted rounded animate-pulse mb-8 w-48" />
            <div className="w-full aspect-[16/9] bg-muted rounded-lg animate-pulse mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Maqola topilmadi</h1>
          <Link href="/">
            <Button data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Bosh sahifaga qaytish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const related = relatedArticles
    .filter(a => a.id !== article.id && a.category === article.category && a.status === "published")
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link href="/">
            <Button variant="ghost" className="mb-8" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>
          </Link>

          {/* Article header */}
          <div className="mb-8">
            <Badge className="mb-4" data-testid="badge-category">
              {article.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                {article.publishedAt && formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
              </span>
              {article.trendKeyword && (
                <span className="flex items-center gap-1 text-sm">
                  <Tag className="h-4 w-4" />
                  {article.trendKeyword}
                </span>
              )}
            </div>
          </div>

          {/* Featured image */}
          {article.imageUrl && (
            <div 
              className="w-full aspect-[16/9] bg-cover bg-center rounded-lg mb-8"
              style={{ backgroundImage: `url(${article.imageUrl})` }}
            />
          )}

          {/* Article content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <div className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <h2 className="text-2xl font-bold mb-6">Shunga o'xshash maqolalar</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((relatedArticle) => (
                  <Link key={relatedArticle.id} href={`/article/${relatedArticle.id}`}>
                    <Card className="overflow-hidden hover-elevate active-elevate-2 h-full overflow-visible" data-testid={`card-related-${relatedArticle.id}`}>
                      <div 
                        className="w-full aspect-[16/9] bg-muted bg-cover bg-center"
                        style={{
                          backgroundImage: relatedArticle.imageUrl 
                            ? `url(${relatedArticle.imageUrl})` 
                            : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)'
                        }}
                      />
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
