import { useQuery, useMutation } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { Trash2, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminArticles() {
  const { toast } = useToast();
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Muvaffaqiyatli o'chirildi",
        description: "Maqola o'chirildi",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Maqolani o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      published: { variant: "default", label: "Nashr etilgan" },
      draft: { variant: "secondary", label: "Qoralama" },
      scheduled: { variant: "outline", label: "Rejalashtirilgan" },
      failed: { variant: "destructive", label: "Xatolik" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Maqolalar</h1>
          <p className="text-muted-foreground">
            Barcha yaratilgan maqolalarni boshqarish
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maqolalar ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sarlavha</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>Nashr vaqti</TableHead>
                    <TableHead className="w-[100px]">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id} data-testid={`row-article-${article.id}`}>
                      <TableCell className="font-medium max-w-md">
                        <div className="line-clamp-2">{article.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {article.publishedAt
                          ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${article.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild data-testid={`button-view-${article.id}`}>
                              <Link href={`/article/${article.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ko'rish
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(article.id)}
                              data-testid={`button-delete-${article.id}`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Hozircha maqolalar yo'q</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
