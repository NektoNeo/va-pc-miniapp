import { Metadata } from "next";
import { MediaUploader } from "@/components/admin/media/media-uploader";
import { MediaGallery } from "@/components/admin/media/media-gallery";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vapc/ui/components/tabs";

export const metadata: Metadata = {
  title: "Медиа библиотека | VA-PC Admin",
  description: "Управление изображениями",
};

/**
 * /admin/media - Медиа библиотека
 * Upload + Gallery view для управления изображениями
 */
export default function MediaPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Медиа библиотека</h1>
        <p className="text-muted-foreground mt-2">
          Загружайте и управляйте изображениями для сборок, устройств и промо-кампаний
        </p>
      </div>

      {/* Content */}
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Загрузить</TabsTrigger>
          <TabsTrigger value="gallery">Галерея</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="border rounded-xl p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4">Загрузить изображение</h2>
            <MediaUploader />
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <div className="border rounded-xl p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4">Все изображения</h2>
            <MediaGallery />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
