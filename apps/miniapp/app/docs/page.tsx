"use client";

import { useTelegramBackButton } from "@/lib/telegram/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@vapc/ui/components";
import { FileText, ExternalLink } from "lucide-react";

const DOCS_LINKS = [
  {
    id: "privacy",
    title: "Политика обработки персональных данных",
    description: "Политика конфиденциальности и защиты персональных данных",
    url: process.env.NEXT_PUBLIC_TG_PRIVACY || "https://telegra.ph/Privacy-Policy-VA-PC-01-01",
  },
  {
    id: "offer",
    title: "Публичная оферта",
    description: "Договор публичной оферты на оказание услуг",
    url: process.env.NEXT_PUBLIC_TG_OFFER || "https://telegra.ph/Public-Offer-VA-PC-01-01",
  },
  {
    id: "pd_consent",
    title: "Согласие на обработку персональных данных",
    description: "Форма согласия на обработку ПДн в соответствии с 152-ФЗ",
    url: process.env.NEXT_PUBLIC_TG_PD_CONSENT || "https://telegra.ph/PD-Consent-VA-PC-01-01",
  },
  {
    id: "review_consent",
    title: "Согласие на публикацию отзыва",
    description: "Согласие на публикацию отзыва и использование изображений",
    url: process.env.NEXT_PUBLIC_TG_REVIEW_CONSENT || "https://telegra.ph/Review-Consent-VA-PC-01-01",
  },
  {
    id: "faq",
    title: "FAQ / Доставка / Гарантия",
    description: "Часто задаваемые вопросы, условия доставки и гарантии",
    url: process.env.NEXT_PUBLIC_TG_FAQ || "https://telegra.ph/FAQ-VA-PC-01-01",
  },
];

export default function DocsPage() {
  useTelegramBackButton();

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Юридические документы</h1>
          <p className="text-muted-foreground">
            Правовая информация и пользовательские соглашения
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCS_LINKS.map((doc) => (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {doc.title}
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {/* Additional Info */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Документы открываются в Telegraph
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
