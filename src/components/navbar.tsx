"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/role-badge";
import { LogOut } from "lucide-react";
import { ActorRole } from "@prisma/client";

export function Navbar({
  name,
  image,
  role,
}: {
  name: string;
  image?: string | null;
  role: ActorRole;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-steel-800/70 bg-void-950/70 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="status-dot bg-secure animate-pulse-glow" />
        <span className="terminal-label">SİSTEM AKTİF — GÜVENLİ BAĞLANTI</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-md px-2 py-1.5 outline-none hover:bg-void-800/70">
          <div className="text-right">
            <p className="text-sm font-medium text-steel-100">{name}</p>
            <RoleBadge role={role} className="mt-0.5" />
          </div>
          <Avatar>
            <AvatarImage src={image ?? undefined} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hesap</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4 text-breach" />
            Oturumu Kapat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
