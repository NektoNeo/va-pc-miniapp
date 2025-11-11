"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vapc/ui/components";
import { useTelegramUser, getUserDisplayName, getUserInitials } from "@/hooks/use-telegram-user";
import { Avatar, AvatarFallback, AvatarImage } from "@vapc/ui/components";
import { useTelegramBackButton } from "@/lib/telegram/navigation";
import { Heart, Package, User } from "lucide-react";

export default function ProfilePage() {
  const user = useTelegramUser();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  // Enable Telegram back button
  useTelegramBackButton();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="relative animate-fade-in-up">
          <Card className="card-glass shadow-purple overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <Avatar className="h-16 w-16 border-2 border-primary/30">
                  {user?.photoUrl ? (
                    <AvatarImage src={user.photoUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-primary font-bold text-xl">
                    {user ? initials : <User className="w-7 h-7" />}
                  </AvatarFallback>
                </Avatar>

                {/* User Details */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-glow">{displayName}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    {user?.languageCode && (
                      <span className="text-sm text-muted-foreground">
                        🌐 {user.languageCode.toUpperCase()}
                      </span>
                    )}
                    {user?.isPremium && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-accent font-medium">⭐ Telegram Premium</span>
                      </div>
                    )}
                  </div>
                  {user && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ID: {user.id}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Favorites Section */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <Card className="card-glass shadow-cyan hover:shadow-lift transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 group-hover:from-pink-500/30 group-hover:to-red-500/30 transition-all">
                    <Heart className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      Избранное
                    </CardTitle>
                    <CardDescription>Сохраненные сборки</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Empty State */}
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Вы еще не добавили сборки в избранное
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Нажмите на ❤️ на карточке сборки
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Card className="card-glass shadow-green hover:shadow-lift transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all">
                    <Package className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      Мои заказы
                    </CardTitle>
                    <CardDescription>История покупок</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Empty State */}
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      У вас пока нет заказов
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Выберите сборку и оформите заказ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="relative animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Card className="card-glass shadow-purple overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Telegram ID</span>
                  <span className="font-mono text-foreground">{user?.id || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Username</span>
                  <span className="text-foreground">{user?.username ? `@${user.username}` : "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Язык</span>
                  <span className="text-foreground">{user?.languageCode?.toUpperCase() || "—"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Premium статус</span>
                  <span className="text-foreground">{user?.isPremium ? "✅ Активен" : "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
