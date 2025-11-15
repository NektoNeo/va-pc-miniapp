import { Gamepad2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Маппинг игр к иконкам
 *
 * TODO: Заменить на реальные иконки игр когда будут доступны
 * Варианты:
 * 1. Использовать изображения из /public/images/games/
 * 2. Использовать SVG иконки
 * 3. Использовать emoji как placeholder
 */

export interface GameIconInfo {
  /** Название игры */
  name: string;
  /** Lucide иконка (fallback) */
  icon: LucideIcon;
  /** Путь к изображению иконки (если есть) */
  imagePath?: string;
  /** Emoji как альтернатива иконке */
  emoji?: string;
  /** Цвет для фона (hex) */
  color?: string;
}

/**
 * Маппинг для всех 13 фиксированных игр
 */
export const GAME_ICONS: Record<string, GameIconInfo> = {
  "Forza Horizon 5": {
    name: "Forza Horizon 5",
    icon: Gamepad2,
    emoji: "🏎️",
    color: "#FF6B35",
  },
  "Cyberpunk 2077": {
    name: "Cyberpunk 2077",
    icon: Gamepad2,
    emoji: "🤖",
    color: "#FFD23F",
  },
  "GTA V": {
    name: "GTA V",
    icon: Gamepad2,
    emoji: "🚗",
    color: "#8FBC8F",
  },
  "CS 2": {
    name: "CS 2",
    icon: Gamepad2,
    emoji: "🔫",
    color: "#FF8C42",
  },
  "PUBG": {
    name: "PUBG",
    icon: Gamepad2,
    emoji: "🪂",
    color: "#F4A261",
  },
  "Fortnite": {
    name: "Fortnite",
    icon: Gamepad2,
    emoji: "🎮",
    color: "#6A4C93",
  },
  "Rust": {
    name: "Rust",
    icon: Gamepad2,
    emoji: "🔨",
    color: "#8B4513",
  },
  "Atomic Heart": {
    name: "Atomic Heart",
    icon: Gamepad2,
    emoji: "⚙️",
    color: "#E63946",
  },
  "Hogwarts Legacy": {
    name: "Hogwarts Legacy",
    icon: Gamepad2,
    emoji: "🪄",
    color: "#8E44AD",
  },
  "God of War": {
    name: "God of War",
    icon: Gamepad2,
    emoji: "⚔️",
    color: "#C0392B",
  },
  "RDR 2": {
    name: "RDR 2",
    icon: Gamepad2,
    emoji: "🤠",
    color: "#D4A373",
  },
  "Apex Legends": {
    name: "Apex Legends",
    icon: Gamepad2,
    emoji: "🎯",
    color: "#FF4655",
  },
  "Dota 2": {
    name: "Dota 2",
    icon: Gamepad2,
    emoji: "🛡️",
    color: "#D32F2F",
  },
};

/**
 * Получить информацию об иконке игры
 * @param gameName - название игры
 * @returns информация об иконке или fallback
 */
export function getGameIcon(gameName: string): GameIconInfo {
  return (
    GAME_ICONS[gameName] || {
      name: gameName,
      icon: Gamepad2,
      emoji: "🎮",
      color: "#9D4EDD", // VA-PC purple
    }
  );
}

/**
 * Получить все доступные игры
 */
export function getAllGames(): string[] {
  return Object.keys(GAME_ICONS);
}

/**
 * Проверить, существует ли игра в маппинге
 */
export function isGameSupported(gameName: string): boolean {
  return gameName in GAME_ICONS;
}
