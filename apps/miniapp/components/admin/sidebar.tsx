"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { navItems, type NavItem } from "./nav-config";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Catalog"])
  );

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    // Section with children
    if (item.children) {
      const isExpanded = expandedSections.has(item.label);
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
              "text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            <span>{item.label}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => renderNavItem(child))}
            </div>
          )}
        </div>
      );
    }

    // Regular nav item
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href!}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          active
            ? "border-l-2 border-[#9D4EDD] bg-[#9D4EDD]/20 text-white shadow-[0_0_12px_rgba(157,78,221,0.3)]"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden w-[280px] border-r border-[#9D4EDD]/20 bg-white/5 backdrop-blur-lg lg:block">
      <div className="flex h-full flex-col">
        {/* Logo / Brand */}
        <div className="border-b border-[#9D4EDD]/20 p-6">
          <Link href="/admin" className="block">
            <h1 className="text-xl font-bold text-white">
              VA-PC <span className="text-[#9D4EDD]">Admin</span>
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#9D4EDD]/20 p-4">
          <p className="text-xs text-white/40">
            VA-PC Admin Panel v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
