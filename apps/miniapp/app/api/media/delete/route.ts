/**
 * DELETE /api/media/delete
 * Delete media asset and all its derivatives from S3 and database
 */

import { NextRequest, NextResponse } from "next/server";
import { DeleteAssetSchema } from "@/lib/media/validators";
import { deleteMultipleFromS3 } from "@/lib/media/storage";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validation = DeleteAssetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { assetId, type } = validation.data;

    if (type === "image") {
      // Find ImageAsset with derivatives
      const asset = await prisma.imageAsset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }

      // Extract all S3 keys from derivatives JSON
      const derivatives = asset.derivatives as {
        original: { key: string };
        sizes: Array<{ key: string }>;
      } | null;

      const keysToDelete: string[] = [];

      if (derivatives) {
        keysToDelete.push(derivatives.original.key);
        keysToDelete.push(...derivatives.sizes.map((s) => s.key));
      }

      // Delete from S3
      const deletedKeys = await deleteMultipleFromS3(keysToDelete);

      // Delete from database
      await prisma.imageAsset.delete({
        where: { id: assetId },
      });

      return NextResponse.json(
        {
          success: true,
          deletedKeys,
        },
        { status: 200 }
      );
    } else if (type === "video") {
      // Find VideoAsset
      const asset = await prisma.videoAsset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }

      // Delete video file from S3
      const keysToDelete = [asset.key];
      const deletedKeys = await deleteMultipleFromS3(keysToDelete);

      // Delete from database
      await prisma.videoAsset.delete({
        where: { id: assetId },
      });

      return NextResponse.json(
        {
          success: true,
          deletedKeys,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid media type" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
