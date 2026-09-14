import { ActorRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_BADGE_STYLES } from "@/lib/roles";

export function RoleBadge({ role, className }: { role: ActorRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wider",
        ROLE_BADGE_STYLES[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
