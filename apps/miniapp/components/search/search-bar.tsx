"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@vapc/ui/components";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = "Поиск по названию, характеристикам...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/pcs?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative card-glass shadow-cyan overflow-hidden animate-fade-in-up">
        {/* Search icon */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Search className="w-3.5 h-3.5 text-primary/60" />
        </div>

        {/* Input */}
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-1.5 bg-transparent border-0 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 p-0.5 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Очистить поиск"
          >
            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
    </form>
  );
}
