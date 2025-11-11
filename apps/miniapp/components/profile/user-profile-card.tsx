"use client";

import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { useTelegramUser, getUserDisplayName, getUserInitials } from "@/hooks/use-telegram-user";
import { Avatar, AvatarFallback, AvatarImage } from "@vapc/ui/components";

export function UserProfileCard() {
  const user = useTelegramUser();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  return (
    <Link href="/profile">
      <div className="card-glass shadow-purple overflow-hidden animate-fade-in-up hover:shadow-lift transition-all cursor-pointer group">
        <div className="p-4 flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
            {user?.photoUrl ? (
              <AvatarImage src={user.photoUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
              {user ? initials : <User className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {displayName}
            </p>
            {user?.isPremium && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-accent font-medium">Telegram Premium</span>
                <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
            )}
          </div>

          {/* Arrow button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-muted-foreground group-hover:text-primary transition-colors">
              В профиль
            </span>
            <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
