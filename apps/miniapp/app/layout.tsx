import type { Metadata } from "next";
import "@vapc/ui/globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { TelegramProvider } from "@/lib/telegram/telegram-provider";
import { SentryRouteTag } from "@/lib/sentry/sentry-route-tag";
import { BackgroundPattern } from "@/components/layout/background-pattern";

export const metadata: Metadata = {
  title: "VA-PC | Игровые компьютеры",
  description: "Каталог игровых компьютеров VA-PC в Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <BackgroundPattern />
        <TelegramProvider>
          <SentryRouteTag />
          <QueryProvider>{children}</QueryProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
