import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@vapc/ui/components/button";
import { db } from "@/lib/db";
import { PromosCampaignsTable } from "@/components/admin/promos/promos-table";
import { PlusCircle } from "lucide-react";

export const metadata = {
  title: "Промо-кампании | Admin Panel",
  description: "Управление промо-кампаниями и акциями",
};

async function getPromoCampaigns() {
  const campaigns = await db.promoCampaign.findMany({
    include: {
      bannerImage: true,
    },
    orderBy: [
      { active: "desc" },
      { priority: "desc" },
      { startsAt: "desc" },
    ],
  });

  return campaigns;
}

export default async function PromoCampaignsPage() {
  const campaigns = await getPromoCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Промо-кампании</h1>
          <p className="text-muted-foreground mt-2">
            Управление акциями, скидками и промо-предложениями
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/promos/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Создать промо-кампанию
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Загрузка промо-кампаний...</p>
          </div>
        }
      >
        <PromosCampaignsTable campaigns={campaigns} />
      </Suspense>
    </div>
  );
}
