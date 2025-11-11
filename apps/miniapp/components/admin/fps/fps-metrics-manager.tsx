"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, X, Check } from "lucide-react";

import { Button } from "@vapc/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vapc/ui/components/form";
import { Input } from "@vapc/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vapc/ui/components/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vapc/ui/components/card";
import { Badge } from "@vapc/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vapc/ui/components/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@vapc/ui/components/alert-dialog";
import {
  fpsMetricFormSchema,
  getResolutionShortLabel,
  POPULAR_GAMES,
  type FpsMetricFormData,
} from "@/lib/validations/fps-metrics";

type FpsMetric = {
  id: string;
  game: string;
  resolution: "FHD" | "QHD" | "UHD4K";
  fpsMin: number | null;
  fpsAvg: number;
  fpsP95: number | null;
};

interface FpsMetricsManagerProps {
  pcId: string;
}

export function FpsMetricsManager({ pcId }: FpsMetricsManagerProps) {
  const [metrics, setMetrics] = useState<FpsMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FpsMetricFormData>({
    resolver: zodResolver(fpsMetricFormSchema),
    defaultValues: {
      game: "",
      resolution: "FHD",
      fpsMin: null,
      fpsAvg: 60,
      fpsP95: null,
    },
  });

  // Загрузка метрик при монтировании
  useEffect(() => {
    loadMetrics();
  }, [pcId]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/pcs/${pcId}/fps`);
      if (!response.ok) throw new Error("Не удалось загрузить метрики");
      const result = await response.json();
      setMetrics(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FpsMetricFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingId
        ? `/api/admin/fps/${editingId}`
        : `/api/admin/pcs/${pcId}/fps`;
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось сохранить метрику");
      }

      toast.success(editingId ? "Метрика обновлена" : "Метрика добавлена");
      form.reset();
      setEditingId(null);
      await loadMetrics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при сохранении");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (metric: FpsMetric) => {
    setEditingId(metric.id);
    form.reset({
      game: metric.game,
      resolution: metric.resolution,
      fpsMin: metric.fpsMin,
      fpsAvg: metric.fpsAvg,
      fpsP95: metric.fpsP95,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      game: "",
      resolution: "FHD",
      fpsMin: null,
      fpsAvg: 60,
      fpsP95: null,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/fps/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Не удалось удалить метрику");
      }

      toast.success("Метрика удалена");
      await loadMetrics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при удалении");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getResolutionBadgeColor = (resolution: string) => {
    switch (resolution) {
      case "FHD":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "QHD":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "UHD4K":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FPS Метрики</CardTitle>
        <CardDescription>
          Показатели производительности в играх для этой PC сборки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Таблица метрик */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : metrics.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Нет добавленных метрик. Добавьте первую метрику используя форму ниже.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Игра</TableHead>
                  <TableHead>Разрешение</TableHead>
                  <TableHead className="text-right">FPS Min</TableHead>
                  <TableHead className="text-right">FPS Avg</TableHead>
                  <TableHead className="text-right">FPS P95</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">{metric.game}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getResolutionBadgeColor(metric.resolution)}>
                        {getResolutionShortLabel(metric.resolution)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {metric.fpsMin ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-400">
                      {metric.fpsAvg}
                    </TableCell>
                    <TableCell className="text-right text-blue-400">
                      {metric.fpsP95 ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(metric)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(metric.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Форма добавления/редактирования */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="game"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Игра *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cyberpunk 2077"
                        list="popular-games"
                        {...field}
                      />
                    </FormControl>
                    <datalist id="popular-games">
                      {POPULAR_GAMES.map((game) => (
                        <option key={game} value={game} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Разрешение *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FHD">Full HD (1080p)</SelectItem>
                        <SelectItem value="QHD">2K (1440p)</SelectItem>
                        <SelectItem value="UHD4K">4K (2160p)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fpsMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FPS Min</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="45"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fpsAvg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FPS Avg *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fpsP95"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FPS P95</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="80"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : editingId ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {editingId ? "Сохранить изменения" : "Добавить метрику"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Отмена
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Delete confirmation dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить метрику?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие нельзя отменить. Метрика будет удалена навсегда.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Удаление..." : "Удалить"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
