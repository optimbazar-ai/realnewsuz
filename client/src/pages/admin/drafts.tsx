import { useQuery, useMutation } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useState } from "react";
import { Edit, Image as ImageIcon, CheckCircle, X } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDrafts() {
  const { toast } = useToast();
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const { data: draftArticles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/drafts"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/articles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles/drafts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Muvaffaqiyatli yangilandi",
        description: "Maqola yangilandi",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Maqolani yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/articles/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles/drafts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setEditingArticle(null);
      toast({
        title: "Muvaffaqiyatli nashr etildi",
        description: "Maqola nashr etildi",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Maqolani nashr etishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setImageUrl(article.imageUrl || "");
    setTitle(article.title);
    setContent(article.content);
    setExcerpt(article.excerpt);
  };

  const handleSaveChanges = () => {
    if (!editingArticle) return;

    updateMutation.mutate({
      id: editingArticle.id,
      data: {
        title,
        content,
        excerpt,
        imageUrl: imageUrl || null,
      },
    });
  };

  const handlePublish = () => {
    if (!editingArticle) return;

    if (title !== editingArticle.title || content !== editingArticle.content || excerpt !== editingArticle.excerpt || imageUrl !== (editingArticle.imageUrl || "")) {
      updateMutation.mutate({
        id: editingArticle.id,
        data: {
          title,
          content,
          excerpt,
          imageUrl: imageUrl || null,
        },
      }, {
        onSuccess: () => {
          publishMutation.mutate(editingArticle.id);
        },
      });
    } else {
      publishMutation.mutate(editingArticle.id);
    }
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setImageUrl("");
    setTitle("");
    setContent("");
    setExcerpt("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Qoralamalar</h1>
          <p className="text-muted-foreground">
            Rasm topilmagan yoki chop etilmagan maqolalarni tahrirlash va nashr etish
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Qoralama Maqolalar ({draftArticles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yuklanmoqda...</div>
          ) : draftArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Qoralama maqolalar yo'q
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sarlavha</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Rasm</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Yaratilgan</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draftArticles.map((article) => (
                    <TableRow key={article.id} data-testid={`row-draft-${article.id}`}>
                      <TableCell className="font-medium max-w-md truncate">
                        {article.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {article.imageUrl ? (
                          <Badge variant="default" className="bg-green-600">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Bor
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            Yo'q
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {article.trendKeyword || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(article.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(article)}
                          data-testid={`button-edit-${article.id}`}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Tahrirlash
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingArticle} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Maqolani tahrirlash va nashr etish</DialogTitle>
            <DialogDescription>
              Maqolani tahrirlang va rasimni qo'shing, keyin nashr eting
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Sarlavha</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-edit-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Qisqacha mazmun</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                data-testid="input-edit-excerpt"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Maqola matni</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                data-testid="input-edit-content"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">
                Rasm URL (Unsplash yoki boshqa manba)
              </Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-testid="input-edit-image"
              />
              {imageUrl && (
                <div className="mt-2 rounded-md border p-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                    }}
                  />
                </div>
              )}
            </div>

            {editingArticle && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Kategoriya:</span>{" "}
                  {editingArticle.category}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Trend kalit so'z:</span>{" "}
                  {editingArticle.trendKeyword || "-"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Yaratilgan:</span>{" "}
                  {new Date(editingArticle.createdAt).toLocaleString("uz-UZ")}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              data-testid="button-cancel-edit"
            >
              Bekor qilish
            </Button>
            <Button
              variant="secondary"
              onClick={handleSaveChanges}
              disabled={updateMutation.isPending || !title || !content}
              data-testid="button-save-changes"
            >
              <Edit className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending || updateMutation.isPending || !title || !content}
              data-testid="button-publish"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {publishMutation.isPending ? "Nashr etilmoqda..." : "Nashr etish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
