import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Article } from "@shared/schema";
import { ArrowLeft, Clock, Tag, Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { format } from "date-fns";

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
        <header className="border-b border-border bg-background">
          <div className="container mx-auto">
            <div className="flex h-16 items-center justify-between px-4">
              <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
                <div className="bg-primary text-primary-foreground w-10 h-10 rounded flex items-center justify-center font-bold text-lg">
                  RN
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold leading-none">Real News</span>
                  <span className="text-xs text-muted-foreground">O'zbekiston yangiliklari</span>
                </div>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background">
          <div className="container mx-auto">
            <div className="flex h-16 items-center justify-between px-4">
              <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
                <div className="bg-primary text-primary-foreground w-10 h-10 rounded flex items-center justify-center font-bold text-lg">
                  RN
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold leading-none">Real News</span>
                  <span className="text-xs text-muted-foreground">O'zbekiston yangiliklari</span>
                </div>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
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
      </div>
    );
  }

  const related = relatedArticles
    .filter(a => a.id !== article.id && a.category === article.category && a.status === "published")
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" data-testid="link-home">
              <div className="bg-primary text-primary-foreground w-10 h-10 rounded flex items-center justify-center font-bold text-lg">
                RN
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none">Real News</span>
                <span className="text-xs text-muted-foreground">O'zbekiston yangiliklari</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-home">
                Bosh sahifa
              </Link>
              <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-nav-admin">
                Boshqaruv
              </Link>
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:text-primary" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Bosh sahifa
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Article header */}
              <article>
                <div className="mb-6">
                  <Badge className="mb-4 bg-primary text-primary-foreground" data-testid="badge-category">
                    {article.category}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground pb-6 border-b border-border">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-primary" />
                      {article.publishedAt && format(new Date(article.publishedAt), "HH:mm, dd MMMM yyyy")}
                    </span>
                    {article.trendKeyword && (
                      <span className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-primary" />
                        {article.trendKeyword}
                      </span>
                    )}
                  </div>
                </div>

                {/* Featured image */}
                {article.imageUrl && (
                  <div 
                    className="w-full aspect-[16/9] bg-cover bg-center rounded-lg mb-8 border border-border"
                    style={{ backgroundImage: `url(${article.imageUrl})` }}
                  />
                )}

                {/* Article content */}
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <div className="text-base md:text-lg leading-relaxed whitespace-pre-wrap text-foreground">
                    {article.content}
                  </div>
                </div>

                {/* Share buttons */}
                <div className="py-6 border-y border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Ulashish:</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Nusxa olish
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Related articles */}
                {related.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b-2 border-primary">
                      <div className="w-1 h-6 bg-primary" />
                      <h2 className="text-2xl font-bold">Shunga o'xshash maqolalar</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {related.map((relatedArticle) => (
                        <Link key={relatedArticle.id} href={`/article/${relatedArticle.id}`}>
                          <Card className="overflow-hidden hover-elevate transition-all bg-card border border-border" data-testid={`card-related-${relatedArticle.id}`}>
                            <div className="flex gap-4 p-4">
                              <div 
                                className="w-32 h-24 flex-shrink-0 bg-muted bg-cover bg-center rounded"
                                style={{
                                  backgroundImage: relatedArticle.imageUrl 
                                    ? `url(${relatedArticle.imageUrl})` 
                                    : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)'
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                  {relatedArticle.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {relatedArticle.excerpt}
                                </p>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {relatedArticle.publishedAt && format(new Date(relatedArticle.publishedAt), "HH:mm, dd MMM")}
                                </span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Latest News */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary" />
                  So'nggi yangiliklar
                </h3>
                <div className="space-y-4">
                  {relatedArticles
                    .filter(a => a.status === "published" && a.id !== article.id)
                    .slice(0, 5)
                    .map((sideArticle) => (
                      <Link key={sideArticle.id} href={`/article/${sideArticle.id}`}>
                        <div className="group pb-4 border-b border-border last:border-0 last:pb-0 hover-elevate rounded p-2 -m-2">
                          <h4 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                            {sideArticle.title}
                          </h4>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {sideArticle.publishedAt && format(new Date(sideArticle.publishedAt), "HH:mm")}
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Categories */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary" />
                  Turkumlar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Siyosat", "Iqtisod", "Jamiyat", "Sport", "Texnologiya", "Dunyo"].map((cat) => (
                    <Badge key={cat} variant="outline" className="cursor-pointer hover-elevate">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded flex items-center justify-center font-bold">
                RN
              </div>
              <span className="font-semibold">Real News</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 Real News. AI yordamida ishlaydigan avtomatik yangiliklar platformasi
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
