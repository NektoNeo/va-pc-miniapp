import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";
import { SentryAdminTag } from "@/lib/sentry/sentry-admin-tag";
import { Toaster } from "sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session from cookies
  const session = await getSession();

  // Redirect to login if no session (middleware should catch this, but double check)
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <>
      {/* Sentry tagging для отслеживания ошибок admin панели */}
      <SentryAdminTag
        adminId={session.userId}
        adminEmail={session.email}
        adminRole={session.role}
      />

      <div className="flex h-screen bg-[#1A1A1A]">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Header with mobile nav trigger and user menu */}
          <Header session={session} />

          {/* Page content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
          },
        }}
      />
    </>
  );
}
