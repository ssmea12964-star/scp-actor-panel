import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTR, formatDuration } from "@/lib/utils";
import { FilePlus2, MessageSquareWarning } from "lucide-react";

export default async function MyReportsPage() {
  const session = await getServerSession(authOptions);

  const reports = await prisma.report.findMany({
    where: { authorId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-steel-100">RAPORLARIM</h1>
          <p className="mt-1 text-sm text-steel-300">Gönderdiğin tüm rol raporlarının durumu.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/reports/new" className="gap-2">
            <FilePlus2 className="h-4 w-4" />
            Yeni Rapor
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-steel-400">
            Henüz bir rapor göndermedin. "Yeni Rapor" ile ilk rol raporunu oluştur.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-steel-100">
                      {r.scpOrRoleName}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="font-mono text-[11px] text-steel-400">
                    {formatDateTR(r.roleDate)} · {formatDuration(r.roleDurationMin)}
                  </p>
                  <p className="max-w-xl text-sm text-steel-300 line-clamp-2">{r.summary}</p>

                  {r.status === "REVIZYON_ISTENDI" && r.reviewNote && (
                    <div className="mt-2 flex items-start gap-2 rounded-md border border-amber/40 bg-amber/5 px-3 py-2 text-xs text-amber">
                      <MessageSquareWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{r.reviewNote}</span>
                    </div>
                  )}
                  {r.status === "REDDEDILDI" && r.rejectionReason && (
                    <div className="mt-2 flex items-start gap-2 rounded-md border border-breach/40 bg-breach/5 px-3 py-2 text-xs text-breach-glow">
                      <MessageSquareWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{r.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
