"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FilePlus2, FileStack, ShieldPlus, ClipboardList, Radio } from "lucide-react";
import { ActorRole } from "@prisma/client";
import { isAdminRole } from "@/lib/roles";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard, admin: false },
  { href: "/dashboard/reports", label: "Raporlarım", icon: FileStack, admin: false },
  { href: "/dashboard/reports/new", label: "Yeni Rapor", icon: FilePlus2, admin: false },
  { href: "/dashboard/admin/reports", label: "Rapor İnceleme", icon: ClipboardList, admin: true },
  { href: "/dashboard/admin/assign-scp", label: "SCP Ata", icon: ShieldPlus, admin: true },
];

export function Sidebar({ role }: { role: ActorRole }) {
  const pathname = usePathname();
  const admin = isAdminRole(role);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-steel-800/70 bg-void-950/70 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-steel-800/70 px-6">
        <Radio className="h-5 w-5 text-breach animate-pulse-glow" />
        <span className="font-display text-sm font-bold tracking-[0.15em] text-steel-100">
          VAKIA // TERMİNAL
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.filter((item) => !item.admin || admin).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-secure/10 text-secure-glow border border-secure/30 shadow-glow-green/0"
                  : "text-steel-300 hover:bg-void-800/70 hover:text-steel-100 border border-transparent"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-secure-glow" : "text-steel-400 group-hover:text-steel-100")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-steel-800/70 p-4">
        <p className="terminal-label uppercase">Erişim Seviyesi</p>
        <p className="mt-1 font-mono text-xs text-steel-400">
          {admin ? "SEVİYE 3 — YÖNETİM" : "SEVİYE 1 — SAHA"}
        </p>
      </div>
    </aside>
  );
}
