import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStorageProvider } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/admin/media/[id] - Delete image asset
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch image asset
    const imageAsset = await db.imageAsset.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            pcBuildsCover: true,
            pcBuildsGallery: true,
            devicesCover: true,
            devicesGallery: true,
            promoCampaigns: true,
          },
        },
      },
    });

    if (!imageAsset) {
      return NextResponse.json({ error: "Изображение не найдено" }, { status: 404 });
    }

    // Check if image is in use
    const usageCount =
      imageAsset._count.pcBuildsCover +
      imageAsset._count.pcBuildsGallery +
      imageAsset._count.devicesCover +
      imageAsset._count.devicesGallery +
      imageAsset._count.promoCampaigns;

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: `Изображение используется в ${usageCount} местах. Удалите связи сначала.`,
          usage: {
            pcBuildsCover: imageAsset._count.pcBuildsCover,
            pcBuildsGallery: imageAsset._count.pcBuildsGallery,
            devicesCover: imageAsset._count.devicesCover,
            devicesGallery: imageAsset._count.devicesGallery,
            promoCampaigns: imageAsset._count.promoCampaigns,
          },
        },
        { status: 400 }
      );
    }

    // Extract all file keys from derivatives
    const derivatives = imageAsset.derivatives as any;
    const keysToDelete: string[] = [];

    // Add original key
    if (derivatives?.original?.key) {
      keysToDelete.push(derivatives.original.key);
    }

    // Add derivative keys
    if (derivatives?.sizes && Array.isArray(derivatives.sizes)) {
      for (const size of derivatives.sizes) {
        if (size.key) {
          keysToDelete.push(size.key);
        }
      }
    }

    // Delete files from storage
    const storage = getStorageProvider();
    if (keysToDelete.length > 0) {
      await storage.deleteMany(keysToDelete);
    }

    // Delete database record
    await db.imageAsset.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Изображение успешно удалено",
    });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении изображения" },
      { status: 500 }
    );
  }
}
