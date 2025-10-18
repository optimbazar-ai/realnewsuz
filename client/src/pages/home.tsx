import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Article, Trend } from "@shared/schema";
import { Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  const mainArticle = articles[0];
  const latestArticles = articles.slice(1);
  const trendingTopics = trends.filter(t => !t.isProcessed).slice(0, 8);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageTitle = "Real News - O'zbekiston yangiliklari | AI yordamida ishlaydigan avtomatik yangiliklar";
  const pageDescription = "O'zbekiston va dunyodagi so'nggi yangiliklar. AI texnologiyasi yordamida tahlil qilingan dolzarb maqolalar. Siyosat, iqtisod, sport, texnologiya va boshqa turkumlardagi yangiliklar.";
  const ogImage = mainArticle?.imageUrl || `${baseUrl}/og-default.jpg`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:site_name" content="Real News" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

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

      <div className="container mx-auto px-4 py-6">
        {/* Main News Grid */}
        {mainArticle && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Featured Article */}
            <div className="lg:col-span-2">
              <Link href={`/article/${mainArticle.id}`}>
                <article className="group relative overflow-hidden rounded-lg bg-card border border-border hover-elevate transition-all h-full" data-testid={`article-main-${mainArticle.id}`}>
                  <div 
                    className="w-full aspect-[16/9] bg-cover bg-center"
                    style={{
                      backgroundImage: mainArticle.imageUrl 
                        ? `url(${mainArticle.imageUrl})` 
                        : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--chart-1)) 100%)'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-3 bg-primary text-primary-foreground border-0" data-testid={`badge-main-category-${mainArticle.id}`}>
                      {mainArticle.category}
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-3 group-hover:text-primary-foreground transition-colors">
                      {mainArticle.title}
                    </h2>
                    <p className="text-white/90 text-sm mb-3 line-clamp-2">
                      {mainArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Clock className="h-3 w-3" />
                      <span>{mainArticle.publishedAt && format(new Date(mainArticle.publishedAt), "HH:mm, dd MMM")}</span>
                    </div>
                  </div>
                </article>
              </Link>
            </div>

            {/* Side Articles */}
            <div className="flex flex-col gap-4">
              {latestArticles.slice(0, 2).map((article) => (
                <Link key={article.id} href={`/article/${article.id}`}>
                  <article className="group relative overflow-hidden rounded-lg bg-card border border-border hover-elevate transition-all h-full" data-testid={`article-side-${article.id}`}>
                    <div 
                      className="w-full aspect-[16/9] bg-cover bg-center"
                      style={{
                        backgroundImage: article.imageUrl 
                          ? `url(${article.imageUrl})` 
                          : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-foreground transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Clock className="h-3 w-3" />
                        <span>{article.publishedAt && format(new Date(article.publishedAt), "HH:mm")}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest News - Main Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b-2 border-primary">
              <div className="w-1 h-6 bg-primary" />
              <h2 className="text-2xl font-bold">So'nggi yangiliklar</h2>
            </div>

            {articlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <div className="w-full aspect-[16/9] bg-muted rounded animate-pulse mb-3" />
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                ))}
              </div>
            ) : latestArticles.length > 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestArticles.slice(2).map((article) => (
                  <Link key={article.id} href={`/article/${article.id}`}>
                    <article className="group rounded-lg border border-border overflow-hidden hover-elevate transition-all bg-card h-full" data-testid={`card-article-${article.id}`}>
                      <div 
                        className="w-full aspect-[16/9] bg-muted bg-cover bg-center"
                        style={{
                          backgroundImage: article.imageUrl 
                            ? `url(${article.imageUrl})` 
                            : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)'
                        }}
                      />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-article-category-${article.id}`}>
                            {article.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.publishedAt && format(new Date(article.publishedAt), "HH:mm")}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">Hozircha yangiliklar yo'q</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            {trendingTopics.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-primary">
                  <Flame className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Trend Mavzular</h2>
                </div>
                <div className="space-y-2">
                  {trendingTopics.map((trend, index) => (
                    <div key={trend.id} className="group p-3 rounded-lg border border-border bg-card hover-elevate transition-all" data-testid={`card-trend-${trend.id}`}>
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {trend.keyword}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {trend.category && (
                              <Badge variant="outline" className="text-xs py-0 h-5">
                                {trend.category}
                              </Badge>
                            )}
                            <span className="font-medium text-primary">{trend.score} ball</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links / Categories */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold mb-3">Turkumlar</h3>
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
