"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@vapc/ui/components";
import { useTelegramBackButton } from "@/lib/telegram/navigation";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { QuickAccessTiles } from "@/components/layout/quick-access-tiles";

export default function CartPage() {
  useTelegramBackButton();

  // TODO: Replace with actual cart state from context/store
  const cartItems: any[] = [];

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <PageHeader title="Корзина" />

        {/* Quick Access Tiles */}
        <QuickAccessTiles />

        {/* Cart Content */}
        {cartItems.length === 0 ? (
          <Card className="card-glass shadow-purple overflow-hidden animate-fade-in-up">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <ShoppingCart className="w-16 h-16 text-primary/50" />
                  </div>
                  <div className="absolute inset-0 glow-primary opacity-20 blur-2xl" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Корзина пуста
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Добавьте товары из каталога, чтобы они появились здесь
                  </p>
                </div>

                <Link href="/pcs">
                  <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:shadow-lg transition-all">
                    Перейти в каталог
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* TODO: Cart items list will go here */
          <div className="space-y-4">
            {/* Cart items */}
            <Card className="card-glass shadow-purple">
              <CardHeader>
                <CardTitle>Товары в корзине</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Cart item cards will be mapped here */}
              </CardContent>
            </Card>

            {/* Total and Checkout */}
            <Card className="card-glass shadow-cyan">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold text-primary">
                    0 ₽
                  </span>
                </div>
                <button className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium hover:shadow-lg transition-all">
                  Оформить заказ
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
