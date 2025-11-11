"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, User } from "lucide-react";
import { useTelegramUser, getUserDisplayName, getUserInitials } from "@/hooks/use-telegram-user";
import { Avatar, AvatarFallback, AvatarImage } from "@vapc/ui/components";

export function CompactHeader() {
  const user = useTelegramUser();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  return (
    <div className="flex items-center justify-between gap-4 animate-fade-in-up">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image
          src="/logo.svg"
          alt="VA-PC"
          width={120}
          height={40}
          className="h-10 w-auto"
          priority
        />
      </div>

      {/* Compact Profile Card */}
      <Link href="/profile">
        <div className="card-glass shadow-purple overflow-hidden hover:shadow-lift transition-all cursor-pointer group">
          <div className="px-2 py-1 flex items-center gap-1.5">
            {/* Avatar */}
            <Avatar className="h-5 w-5 border border-primary/20 group-hover:border-primary/40 transition-colors flex-shrink-0">
              {user?.photoUrl ? (
                <AvatarImage src={user.photoUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-[10px]">
                {user ? initials : <User className="w-2.5 h-2.5" />}
              </AvatarFallback>
            </Avatar>

            {/* User name */}
            <span className="text-[10px] font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[80px]">
              {displayName}
            </span>

            {/* Arrow */}
            <ChevronRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </div>
        </div>
      </Link>
    </div>
  );
}
