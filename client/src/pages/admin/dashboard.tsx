import { useQuery } from "@tanstack/react-query";
import { Article, Trend, SystemLog } from "@shared/schema";
import { 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: trends = [] } = useQuery<Trend[]>({
    queryKey: ["/api/trends"],
  });

  const { data: logs = [] } = useQuery<SystemLog[]>({
    queryKey: ["/api/logs"],
  });

  const publishedCount = articles.filter(a => a.status === "published").length;
  const draftCount = articles.filter(a => a.status === "draft").length;
  const scheduledCount = articles.filter(a => a.status === "scheduled").length;
  const activeTrends = trends.filter(t => !t.isProcessed).length;
  const recentLogs = logs.slice(0, 10);

  const stats = [
    {
      title: "Nashr etilgan",
      value: publishedCount,
      icon: CheckCircle2,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Qoralama",
      value: draftCount,
      icon: FileText,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Rejalashtirilgan",
      value: scheduledCount,
      icon: Clock,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Aktiv Trendlar",
      value: activeTrends,
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Tizim holatini kuzatish va faoliyatni boshqarish
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} data-testid={`card-stat-${stat.title}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">So'nggi Faoliyat</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0" data-testid={`log-${log.id}`}>
                    <div className="mt-1">
                      {log.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-chart-2" />
                      ) : log.status === "error" ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Activity className="h-4 w-4 text-chart-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{log.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Hozircha faoliyat yo'q
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Trends */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Aktiv Trendlar</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {activeTrends > 0 ? (
              <div className="space-y-3">
                {trends
                  .filter(t => !t.isProcessed)
                  .slice(0, 8)
                  .map((trend) => (
                    <div key={trend.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50" data-testid={`trend-item-${trend.id}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{trend.keyword}</p>
                        {trend.category && (
                          <p className="text-xs text-muted-foreground mt-1">{trend.category}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {trend.score}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Hozircha trendlar yo'q
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
