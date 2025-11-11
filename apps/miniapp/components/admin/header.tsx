"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import type { SessionPayload } from "@/lib/auth/session";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  session: SessionPayload;
}

export function Header({ session }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#9D4EDD]/20 bg-[#1A1A1A]/80 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Spacer for desktop */}
          <div className="hidden lg:block" />

          {/* User menu */}
          <UserMenu
            user={{
              name: session.email.split("@")[0], // Use email username as fallback
              email: session.email,
              role: session.role,
            }}
          />
        </div>
      </header>

      {/* Mobile navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
