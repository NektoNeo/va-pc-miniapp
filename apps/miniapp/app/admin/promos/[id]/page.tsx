import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PromoForm } from "@/components/admin/promos/promo-form";

interface PromoFormPageProps {
  params: Promise<{ id: string }>;
}

async function getPromoCampaign(id: string) {
  if (id === "new") {
    return null;
  }

  const campaign = await db.promoCampaign.findUnique({
    where: { id },
    include: {
      bannerImage: true,
    },
  });

  if (!campaign) {
    notFound();
  }

  return campaign;
}

export async function generateMetadata({ params }: PromoFormPageProps) {
  const { id } = await params;
  const campaign = await getPromoCampaign(id);

  return {
    title: campaign ? `Редактирование: ${campaign.title}` : "Новая промо-кампания",
    description: campaign
      ? `Редактирование промо-кампании ${campaign.title}`
      : "Создание новой промо-кампании",
  };
}

export default async function PromoFormPage({ params }: PromoFormPageProps) {
  const { id } = await params;
  const campaign = await getPromoCampaign(id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {campaign ? `Редактирование: ${campaign.title}` : "Новая промо-кампания"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {campaign
            ? "Измените параметры промо-кампании и сохраните изменения"
            : "Заполните форму для создания новой промо-кампании"}
        </p>
      </div>

      <PromoForm campaign={campaign} />
    </div>
  );
}
