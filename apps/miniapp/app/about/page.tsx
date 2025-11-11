"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@vapc/ui/components";
import { useTelegramBackButton } from "@/lib/telegram/navigation";
import { Clock, Wrench, Star, Shield, Package, Headphones, Palette, ArrowUpDown, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { QuickAccessTiles } from "@/components/layout/quick-access-tiles";

const whyUs = [
  {
    icon: Clock,
    title: "Более 5 лет",
    description: "За это время мы накопили огромный опыт, который позволяет нам решать задачи любой сложности.",
  },
  {
    icon: Wrench,
    title: "30 000+ сборок",
    description: "Мы собрали уже больше 30 000 компьютеров. За каждым из них стоит команда, которая вкладывает душу в каждый компьютер.",
  },
  {
    icon: Star,
    title: "4.9/5 общий рейтинг",
    description: "Мы ценим каждого клиента и стараемся сделать его покупку максимально комфортной.",
  },
];

const whatWeOffer = [
  {
    icon: Shield,
    title: "Гарантия до 3 лет",
    description: "на любой ПК, собранный у нас",
  },
  {
    icon: Package,
    title: "Бесплатная доставка",
    description: "по России, Казахстану и Беларуси",
  },
  {
    icon: Headphones,
    title: "Бесплатная консультация",
    description: "подберем оптимальную конфигурацию под ваши задачи",
  },
  {
    icon: Headphones,
    title: "Онлайн-поддержка 7 дней в неделю",
    description: "всегда на связи, чтобы помочь",
  },
  {
    icon: Sparkles,
    title: "Тестирование под нагрузкой",
    description: "обеспечиваем стабильную работу без сбоев и перегрева",
  },
];

const additionalServices = [
  {
    icon: Wrench,
    title: "Сборка под заказ",
    description: "учтем все ваши пожелания и настроим систему на максимальную производительность",
  },
  {
    icon: Palette,
    title: "Уникальный дизайн",
    description: "сделаем не просто ПК, а произведение технического искусства",
  },
  {
    icon: ArrowUpDown,
    title: "Апгрейд",
    description: "Заменим устаревшие комплектующие и повысим производительность в играх и работе",
  },
  {
    icon: Package,
    title: "Trade In",
    description: "Честно оценим ваш старый ПК и дадим скидку на новый",
  },
];

export default function AboutPage() {
  useTelegramBackButton();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <PageHeader title="О компании" />

        {/* Quick Access Tiles */}
        <QuickAccessTiles />

        {/* Why Choose Us */}
        <Card className="card-glass shadow-purple overflow-hidden animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl text-glow">Почему выбирают нас?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {whyUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* What We Offer */}
        <Card className="card-glass shadow-cyan overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="text-2xl text-glow">Что мы предлагаем?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {whatWeOffer.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                      <Icon className="w-5 h-5 text-cyan-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Additional Services */}
        <Card className="card-glass shadow-green overflow-hidden animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="text-2xl text-glow">Дополнительные услуги</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {additionalServices.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                      <Icon className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
