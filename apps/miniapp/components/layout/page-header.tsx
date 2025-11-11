"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useTelegramUser, getUserDisplayName, getUserInitials } from "@/hooks/use-telegram-user";
import { Avatar, AvatarFallback, AvatarImage } from "@vapc/ui/components";

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const router = useRouter();
  const user = useTelegramUser();
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-between gap-2 animate-fade-in-up">
      {/* Back Button + Title */}
      <div className="flex items-center gap-2 flex-1">
        <button
          onClick={handleBack}
          className="card-glass shadow-purple overflow-hidden hover:shadow-lift transition-all cursor-pointer group p-1.5"
          aria-label="Назад"
        >
          <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <h1 className="text-lg font-bold text-glow truncate">{title}</h1>
      </div>

      {/* Compact Profile Card */}
      <Link href="/profile">
        <div className="card-glass shadow-purple overflow-hidden hover:shadow-lift transition-all cursor-pointer group flex-shrink-0">
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

            {/* User name - hidden on very small screens */}
            <span className="text-[10px] font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[60px] hidden xs:inline">
              {displayName}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
