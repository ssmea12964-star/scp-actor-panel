import { ReportStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<ReportStatus, { label: string; variant: "secure" | "breach" | "amber" | "default"; dot: string }> = {
  BEKLEMEDE: { label: "Beklemede", variant: "amber", dot: "bg-amber" },
  REVIZYON_ISTENDI: { label: "Revizyon İstendi", variant: "amber", dot: "bg-amber" },
  ONAYLANDI: { label: "Onaylandı", variant: "secure", dot: "bg-secure" },
  REDDEDILDI: { label: "Reddedildi", variant: "breach", dot: "bg-breach" },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge variant={cfg.variant}>
      <span className={`status-dot ${cfg.dot} animate-pulse-glow`} />
      {cfg.label}
    </Badge>
  );
}
