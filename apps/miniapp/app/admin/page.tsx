import { getSession } from "@/lib/auth/session";
import { LayoutDashboard } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9D4EDD]/20">
            <LayoutDashboard className="h-5 w-5 text-[#9D4EDD]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-white/60">
              Welcome back, {session?.email.split("@")[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "PC Builds", value: "0", color: "#9D4EDD" },
          { label: "Devices", value: "0", color: "#9D4EDD" },
          { label: "Promotions", value: "0", color: "#9D4EDD" },
          { label: "Leads", value: "0", color: "#9D4EDD" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg"
          >
            <p className="text-sm font-medium text-white/60">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg">
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Add PC Build", href: "/admin/pcs/new" },
            { label: "Add Device", href: "/admin/devices/new" },
            { label: "Create Promotion", href: "/admin/promos/new" },
            { label: "Manage Settings", href: "/admin/settings" },
            { label: "Upload Media", href: "/admin/media" },
            { label: "View Leads", href: "/admin/leads" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="rounded-lg border border-[#9D4EDD]/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-[#9D4EDD]/20 hover:shadow-[0_0_12px_rgba(157,78,221,0.3)]"
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>

      {/* Placeholder for upcoming features */}
      <div className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg">
        <h2 className="mb-2 text-lg font-semibold text-white">
          Admin Panel Status
        </h2>
        <p className="text-sm text-white/60">
          Phase 1: Authentication and navigation - ✅ Complete
          <br />
          Next: CRUD interfaces for PC Builds, Devices, Categories, and more
        </p>
      </div>
    </div>
  );
}
