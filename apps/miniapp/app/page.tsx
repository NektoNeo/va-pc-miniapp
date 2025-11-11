"use client";

import { CategoryTiles } from "@/components/home/category-tiles";
import { TopPCs } from "@/components/home/top-pcs";
import { SearchBar } from "@/components/search/search-bar";
import { CompactHeader } from "@/components/layout/compact-header";
import { QuickAccessTiles } from "@/components/layout/quick-access-tiles";
import { useTelegramBackButton } from "@/lib/telegram/navigation";

export default function HomePage() {
  // Telegram navigation integration
  useTelegramBackButton();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Compact Header - Logo + Profile */}
        <CompactHeader />

        {/* Quick Access Tiles */}
        <QuickAccessTiles />

        {/* Search Bar */}
        <SearchBar />

        {/* Category Tiles */}
        <CategoryTiles />

        {/* Top PCs */}
        <TopPCs />
      </div>
    </main>
  );
}
