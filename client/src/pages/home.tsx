import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Article, Trend } from "@shared/schema";
import { Clock, Flame, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch articles with category filter
  const { data: articlesResponse, isLoading: articlesLoading } = useQuery<{ articles: Article[], total: number }>({
    queryKey: ["/api/articles", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/articles?category=${encodeURIComponent(selectedCategory)}`
        : "/api/articles";
      const res = await fetch(url);
      return res.json();
    }
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  // Handle both old array format and new object format
  const articles = Array.isArray(articlesResponse)
    ? articlesResponse
    : (articlesResponse?.articles || []);

  const mainArticle = articles[0];
  const latestArticles = articles.slice(1);
  const trendingTopics = trends.filter(t => !t.isProcessed).slice(0, 8);

  const categories = ["Siyosat", "Iqtisodiyot", "Sport", "Texnologiya", "Madaniyat", "Sog'liqni saqlash", "Ta'lim", "Ijtimoiy", "Boshqa"];

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

      <Header />

      <div className="container mx-auto px-4 py-8">

        {/* Main News Grid - Hero Section */}
        {mainArticle && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Main Featured Article - 2/3 width */}
            <div className="lg:col-span-2">
              <Link href={`/article/${mainArticle.id}/${generateSlug(mainArticle.title)}`}>
                <article className="group relative overflow-hidden rounded-2xl bg-card border border-border card-hover h-full" data-testid={`article-main-${mainArticle.id}`}>
                  <div
                    className="w-full aspect-[16/9] bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: mainArticle.imageUrl
                        ? `url(${mainArticle.imageUrl})`
                        : 'linear-gradient(135deg, hsl(351, 84%, 55%) 0%, hsl(338, 100%, 65%) 50%, hsl(262, 80%, 55%) 100%)',
                      minHeight: '300px',
                      backgroundColor: 'hsl(var(--muted))'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="badge-gradient" data-testid={`badge-main-category-${mainArticle.id}`}>
                        {mainArticle.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-white/80 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Calendar className="h-3 w-3" />
                        <span>{mainArticle.publishedAt && format(new Date(mainArticle.publishedAt), "dd MMM yyyy")}</span>
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 line-clamp-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                      {mainArticle.title}
                    </h2>
                    <p className="text-white/90 text-base mb-4 line-clamp-2 leading-relaxed">
                      {mainArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-white/80">
                      <span className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Clock className="h-4 w-4" />
                        {mainArticle.publishedAt && format(new Date(mainArticle.publishedAt), "HH:mm")}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </div>

            {/* Side Articles - 1/3 width */}
            <div className="flex flex-col gap-5">
              {latestArticles.slice(0, 2).map((article, index) => (
                <Link key={article.id} href={`/article/${article.id}/${generateSlug(article.title)}`}>
                  <article className={`group relative overflow-hidden rounded-2xl bg-card border border-border card-hover img-zoom h-full fade-in`} style={{ animationDelay: `${index * 100}ms` }} data-testid={`article-side-${article.id}`}>
                    <div
                      className="w-full aspect-[16/9] bg-cover bg-center"
                      style={{
                        backgroundImage: article.imageUrl
                          ? `url(${article.imageUrl})`
                          : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="badge-gradient mb-2 inline-block text-xs">
                        {article.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest News - Main Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-primary">
              <div className="w-1.5 h-7 bg-primary rounded-full" />
              <h2 className="text-3xl font-bold">So'nggi yangiliklar</h2>
            </div>

            {articlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <div className="w-full aspect-[16/9] bg-muted rounded-lg animate-pulse mb-3" />
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                ))}
              </div>
            ) : latestArticles.length > 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestArticles.slice(2).map((article, index) => (
                  <Link key={article.id} href={`/article/${article.id}/${generateSlug(article.title)}`}>
                    <article className="group rounded-2xl border border-border overflow-hidden card-hover bg-card h-full fade-in" style={{ animationDelay: `${index * 50}ms` }} data-testid={`card-article-${article.id}`}>
                      <div className="relative img-zoom">
                        <div
                          className="w-full aspect-[16/9] bg-muted bg-cover bg-center"
                          style={{
                            backgroundImage: article.imageUrl
                              ? `url(${article.imageUrl})`
                              : 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)'
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="badge-gradient" data-testid={`badge-article-category-${article.id}`}>
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                            <Clock className="h-3 w-3" />
                            {article.publishedAt && format(new Date(article.publishedAt), "HH:mm")}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
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
              <div className="text-center py-16 bg-muted/30 rounded-xl">
                <p className="text-muted-foreground text-lg">Hozircha yangiliklar yo'q</p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="mt-4 text-primary hover:underline text-sm"
                    data-testid="button-clear-filter"
                  >
                    Filterni tozalash
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Topics */}
            {trendingTopics.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-primary">
                  <Flame className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Trend Mavzular</h2>
                </div>
                <div className="space-y-3">
                  {trendingTopics.map((trend, index) => (
                    <div key={trend.id} className="group p-4 rounded-xl border border-border bg-background hover:bg-accent hover:shadow-md transition-all duration-200" data-testid={`card-trend-${trend.id}`}>
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-bold text-base">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                            {trend.keyword}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {trend.category && (
                              <Badge variant="outline" className="text-xs py-0.5 h-6 font-medium">
                                {trend.category}
                              </Badge>
                            )}
                            <span className="font-semibold text-primary flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {trend.score} ball
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-12 glass">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">
                ✦
              </div>
              <div>
                <span className="font-bold text-lg gradient-text">Real News</span>
                <p className="text-xs text-muted-foreground">O'zbekiston yangiliklari</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2025 Real News. AI yordamida ishlaydigan avtomatik yangiliklar platformasi
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Telegram</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
