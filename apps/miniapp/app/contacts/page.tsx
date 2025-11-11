"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@vapc/ui/components";
import { useTelegramBackButton } from "@/lib/telegram/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { QuickAccessTiles } from "@/components/layout/quick-access-tiles";

const contacts = [
  {
    name: "ВКонтакте",
    url: "https://vk.com/vapc",
    icon: "vk",
    color: "from-blue-500/20 to-blue-600/20",
    hoverColor: "group-hover:from-blue-500/30 group-hover:to-blue-600/30",
  },
  {
    name: "Telegram",
    url: "https://t.me/vapc",
    icon: "telegram",
    color: "from-cyan-500/20 to-blue-500/20",
    hoverColor: "group-hover:from-cyan-500/30 group-hover:to-blue-500/30",
  },
  {
    name: "Телефон",
    url: "tel:+79000000000",
    icon: "phone",
    color: "from-green-500/20 to-emerald-500/20",
    hoverColor: "group-hover:from-green-500/30 group-hover:to-emerald-500/30",
  },
];

export default function ContactsPage() {
  useTelegramBackButton();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <PageHeader title="Связь с нами" />

        {/* Quick Access Tiles */}
        <QuickAccessTiles />

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact, index) => (
            <a
              key={contact.name}
              href={contact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card
                className={`card-glass shadow-purple hover:shadow-lift transition-all cursor-pointer group h-full animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {contact.name}
                    </CardTitle>
                    <ExternalLink className="w-5 h-5 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`p-6 rounded-lg bg-gradient-to-br ${contact.color} ${contact.hoverColor} transition-all flex items-center justify-center`}
                  >
                    {contact.icon === "vk" && (
                      <svg
                        className="w-16 h-16 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.046-1.727-1.033-1.025-1.487-1.167-1.743-1.167-.356 0-.458.102-.458.593v1.575c0 .424-.137.678-1.252.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.644v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.644-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.78 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                      </svg>
                    )}
                    {contact.icon === "telegram" && (
                      <svg
                        className="w-16 h-16 text-cyan-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.03-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.499-.187.935.112.77.89z" />
                      </svg>
                    )}
                    {contact.icon === "phone" && (
                      <svg
                        className="w-16 h-16 text-green-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    )}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
