"use client";

import Link from "next/link";
import { MessageCircle, LayoutGrid, Info, ShoppingCart } from "lucide-react";

const tiles = [
  {
    href: "/contacts",
    icon: MessageCircle,
    label: "Связь",
    color: "purple",
  },
  {
    href: "/pcs",
    icon: LayoutGrid,
    label: "Каталог",
    color: "cyan",
  },
  {
    href: "/about",
    icon: Info,
    label: "Инфо",
    color: "green",
  },
  {
    href: "/cart",
    icon: ShoppingCart,
    label: "Корзина",
    color: "yellow",
  },
];

const colorStyles = {
  purple: "shadow-purple hover:shadow-purple-lg",
  cyan: "shadow-cyan hover:shadow-cyan-lg",
  green: "shadow-green hover:shadow-green-lg",
  yellow: "shadow-yellow hover:shadow-yellow-lg",
};

export function QuickAccessTiles() {
  return (
    <div className="grid grid-cols-4 gap-2 animate-fade-in-up">
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <Link key={tile.href} href={tile.href}>
            <div
              className={`card-glass ${colorStyles[tile.color as keyof typeof colorStyles]} overflow-hidden cursor-pointer group transition-all h-full`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-1 flex flex-col items-center justify-center gap-0.5">
                <div className="relative">
                  <Icon className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] font-medium text-foreground group-hover:text-primary transition-colors">
                  {tile.label}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
