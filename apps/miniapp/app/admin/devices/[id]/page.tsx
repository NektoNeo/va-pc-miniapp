import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DeviceForm } from "@/components/admin/devices/device-form";

interface DeviceFormPageProps {
  params: Promise<{ id: string }>;
}

async function getDevice(id: string) {
  if (id === "new") {
    return null;
  }

  const device = await db.device.findUnique({
    where: { id },
    include: {
      category: true,
      coverImage: true,
      gallery: true,
    },
  });

  if (!device) {
    notFound();
  }

  return device;
}

async function getCategories() {
  const categories = await db.category.findMany({
    where: {
      kind: "DEVICE",
    },
    orderBy: {
      title: "asc",
    },
  });

  return categories;
}

export async function generateMetadata({ params }: DeviceFormPageProps) {
  const { id } = await params;
  const device = await getDevice(id);

  return {
    title: device ? `Редактирование: ${device.title}` : "Новый девайс",
    description: device
      ? `Редактирование девайса ${device.title}`
      : "Создание нового девайса",
  };
}

export default async function DeviceFormPage({ params }: DeviceFormPageProps) {
  const { id } = await params;
  const device = await getDevice(id);
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {device ? `Редактирование: ${device.title}` : "Новый девайс"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {device
            ? "Измените параметры девайса и сохраните изменения"
            : "Заполните форму для создания нового девайса"}
        </p>
      </div>

      <DeviceForm device={device} categories={categories} />
    </div>
  );
}
