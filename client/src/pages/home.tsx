import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Article, Trend } from "@shared/schema";
import { ArrowRight, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDistanceToNow } from "date-fns";

export default function Home() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  const publishedArticles = articles.filter(a => a.status === "published");
  const featuredArticle = publishedArticles[0];
  const latestArticles = publishedArticles.slice(1, 7);
  const trendingTopics = trends.filter(t => !t.isProcessed).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <a className="flex items-center space-x-2" data-testid="link-home">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Real News</span>
            </a>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-home">
                Bosh sahifa
              </a>
            </Link>
            <Link href="/admin">
              <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-admin">
                Admin
              </a>
            </Link>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      {featuredArticle && (
        <section className="relative w-full h-[70vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: featuredArticle.imageUrl 
                ? `url(${featuredArticle.imageUrl})` 
                : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-1)) 100%)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary text-primary-foreground" data-testid="badge-featured-category">
                {featuredArticle.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {featuredArticle.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-white/80 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {featuredArticle.publishedAt && formatDistanceToNow(new Date(featuredArticle.publishedAt), { addSuffix: true })}
                </span>
              </div>
              <Link href={`/article/${featuredArticle.id}`}>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20" data-testid="button-read-featured">
                  O'qishni davom ettirish
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Trending Hozir</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingTopics.map((trend) => (
                <Card key={trend.id} className="hover-elevate active-elevate-2 overflow-visible" data-testid={`card-trend-${trend.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs" data-testid={`badge-trend-score-${trend.id}`}>
                        {trend.score}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2">{trend.keyword}</h3>
                    {trend.category && (
                      <p className="text-xs text-muted-foreground mt-1">{trend.category}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">So'nggi Yangiliklar</h2>
          
          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="w-full aspect-[16/9] bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-6 bg-muted rounded animate-pulse mb-4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <Link key={article.id} href={`/article/${article.id}`}>
                  <Card className="overflow-hidden hover-elevate active-elevate-2 h-full overflow-visible" data-testid={`card-article-${article.id}`}>
                    <div 
                      className="w-full aspect-[16/9] bg-muted bg-cover bg-center"
                      style={{
                        backgroundImage: article.imageUrl 
                          ? `url(${article.imageUrl})` 
                          : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)'
                      }}
                    />
                    <CardContent className="p-6">
                      <Badge className="mb-3" variant="outline" data-testid={`badge-article-category-${article.id}`}>
                        {article.category}
                      </Badge>
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{article.publishedAt && formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Hozircha yangiliklar yo'q</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Real News</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered automated news platform for Uzbekistan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
