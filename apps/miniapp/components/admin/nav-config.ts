import {
  LayoutDashboard,
  Cpu,
  HardDrive,
  Tags,
  Percent,
  Gamepad2,
  Settings,
  Image,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Catalog",
    children: [
      {
        label: "PC Builds",
        href: "/admin/pcs",
        icon: Cpu,
      },
      {
        label: "Devices",
        href: "/admin/devices",
        icon: HardDrive,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Tags,
      },
    ],
  },
  {
    label: "Promotions",
    href: "/admin/promos",
    icon: Percent,
  },
  {
    label: "FPS Metrics",
    href: "/admin/fps",
    icon: Gamepad2,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Media Library",
    href: "/admin/media",
    icon: Image,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Users,
  },
];
