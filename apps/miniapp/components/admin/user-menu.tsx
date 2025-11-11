"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminRole } from "@prisma/client";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: {
    name: string | null;
    email: string;
    role: AdminRole;
  };
}

const roleLabels: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
};

const roleColors: Record<AdminRole, string> = {
  SUPER_ADMIN: "bg-[#9D4EDD] text-white",
  ADMIN: "bg-[#9D4EDD]/60 text-white",
  MODERATOR: "bg-white/20 text-white/80",
};

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/admin/auth/logout", {
        method: "POST",
        headers: {
          "x-csrf-token": "logout", // Simple CSRF token
        },
      });

      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      } else {
        console.error("Logout failed");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 rounded-lg border border-[#9D4EDD]/20 bg-white/5 px-3 py-2 transition-all",
          "hover:bg-white/10 hover:shadow-[0_0_12px_rgba(157,78,221,0.2)]"
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9D4EDD]/20">
          <User className="h-4 w-4 text-[#9D4EDD]" />
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-white">
            {user.name || user.email}
          </p>
          <p className={cn("text-xs rounded px-1.5 py-0.5 inline-block", roleColors[user.role])}>
            {roleLabels[user.role]}
          </p>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-[#9D4EDD]/20 bg-[#1A1A1A] p-2 shadow-lg backdrop-blur-lg">
            <div className="border-b border-[#9D4EDD]/20 px-3 py-2">
              <p className="text-sm font-medium text-white">
                {user.name || "Admin User"}
              </p>
              <p className="text-xs text-white/60">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                "mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                "text-white/80 hover:bg-white/10 hover:text-white",
                isLoggingOut && "opacity-50 cursor-not-allowed"
              )}
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
