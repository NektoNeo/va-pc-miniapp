import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@vapc/ui/components/button";
import { db } from "@/lib/db";
import { DevicesTable } from "@/components/admin/devices/devices-table";
import { PlusCircle } from "lucide-react";

export const metadata = {
  title: "Девайсы | Admin Panel",
  description: "Управление девайсами и аксессуарами",
};

async function getDevices() {
  const devices = await db.device.findMany({
    include: {
      category: true,
      coverImage: true,
    },
    orderBy: [
      { isTop: "desc" },
      { createdAt: "desc" },
    ],
  });

  return devices;
}

export default async function DevicesPage() {
  const devices = await getDevices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Девайсы</h1>
          <p className="text-muted-foreground mt-2">
            Управление девайсами, периферией и аксессуарами
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/devices/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Создать девайс
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Загрузка девайсов...</p>
          </div>
        }
      >
        <DevicesTable devices={devices} />
      </Suspense>
    </div>
  );
}
