import { useQuery, useMutation } from "@tanstack/react-query";
import { Trend } from "@shared/schema";
import { TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminTrends() {
  const { toast } = useToast();
  const { data: trends = [], isLoading } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  const generateMutation = useMutation({
    mutationFn: async (trendId: string) => {
      await apiRequest("POST", "/api/trends/generate", { trendId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Maqola yaratilmoqda",
        description: "Maqola generatsiya qilinmoqda...",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Maqola yaratishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const fetchTrendsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/trends/fetch");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trends"] });
      toast({
        title: "Trendlar yangilandi",
        description: "Yangi trendlar topildi",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Trendlarni olishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const activeTrends = trends.filter(t => !t.isProcessed);
  const processedTrends = trends.filter(t => t.isProcessed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trendlar</h1>
          <p className="text-muted-foreground">
            Aktiv trendlarni kuzatish va maqola yaratish
          </p>
        </div>
        <Button 
          onClick={() => fetchTrendsMutation.mutate()}
          disabled={fetchTrendsMutation.isPending}
          data-testid="button-fetch-trends"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${fetchTrendsMutation.isPending ? 'animate-spin' : ''}`} />
          Trendlarni yangilash
        </Button>
      </div>

      {/* Active Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Aktiv Trendlar</CardTitle>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : activeTrends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTrends.map((trend) => (
                <Card key={trend.id} className="overflow-visible" data-testid={`card-trend-${trend.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-sm font-semibold">
                        {trend.score}
                      </Badge>
                      {trend.category && (
                        <Badge variant="secondary" className="text-xs">
                          {trend.category}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {trend.keyword}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {formatDistanceToNow(new Date(trend.detectedAt), { addSuffix: true })}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => generateMutation.mutate(trend.id)}
                      disabled={generateMutation.isPending}
                      data-testid={`button-generate-${trend.id}`}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Maqola yaratish
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Hozircha aktiv trendlar yo'q</p>
              <Button
                variant="outline"
                onClick={() => fetchTrendsMutation.mutate()}
                disabled={fetchTrendsMutation.isPending}
                data-testid="button-fetch-trends-empty"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Trendlarni qidirish
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Trends */}
      {processedTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Qayta ishlangan Trendlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processedTrends.slice(0, 10).map((trend) => (
                <div
                  key={trend.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  data-testid={`processed-trend-${trend.id}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{trend.keyword}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Qayta ishlangan: {trend.processedAt && formatDistanceToNow(new Date(trend.processedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline">{trend.score}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
