import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTR } from "@/lib/utils";
import { FileStack, ShieldCheck, Clock3, ShieldPlus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const admin = isAdminRole(session!.user.role);

  const [myReports, pendingCount, upcomingAssignments] = await Promise.all([
    prisma.report.findMany({
      where: admin ? {} : { authorId: session!.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { author: true },
    }),
    prisma.report.count({ where: { status: "BEKLEMEDE" } }),
    prisma.scpAssignment.findMany({
      where: { scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { actor: true },
    }),
  ]);

  const totalReports = await prisma.report.count({
  where: admin ? {} : { authorId: session!.user.id },
});
  const approvedCount = await prisma.report.count({
    where: { status: "ONAYLANDI", ...(admin ? {} : { authorId: session!.user.id }) },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-steel-100">
          GENEL BAKIŞ
        </h1>
        <p className="mt-1 text-sm text-steel-300">
          Hoş geldin, {session!.user.name}. Sistem durumu ve son aktiviteler aşağıda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileStack} label={admin ? "Toplam Rapor" : "Raporlarım"} value={totalReports} accent="secure" />
        <StatCard icon={Clock3} label="Beklemede" value={pendingCount} accent="amber" />
        <StatCard icon={ShieldCheck} label="Onaylanan" value={approvedCount} accent="secure" />
        <StatCard icon={ShieldPlus} label="Yaklaşan Atama" value={upcomingAssignments.length} accent="breach" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{admin ? "Son Raporlar" : "Son Raporlarım"}</CardTitle>
            <Link href="/dashboard/reports" className="terminal-label text-secure-glow hover:underline">
              TÜMÜNÜ GÖR
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {myReports.length === 0 && (
              <p className="text-sm text-steel-400">Henüz kayıtlı rapor bulunmuyor.</p>
            )}
            {myReports.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border border-steel-800/70 bg-void-900/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-steel-100">{r.scpOrRoleName}</p>
                  <p className="font-mono text-[11px] text-steel-400">
                    {admin ? `${r.author.username} · ` : ""}
                    {formatDateTR(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Yaklaşan SCP Atamaları</CardTitle>
            {admin && (
              <Link href="/dashboard/admin/assign-scp" className="terminal-label text-secure-glow hover:underline">
                YENİ ATA
              </Link>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAssignments.length === 0 && (
              <p className="text-sm text-steel-400">Planlanmış bir atama bulunmuyor.</p>
            )}
            {upcomingAssignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border border-steel-800/70 bg-void-900/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-steel-100">{a.scpName}</p>
                  <p className="font-mono text-[11px] text-steel-400">{a.actor.username}</p>
                </div>
                <p className="font-mono text-xs text-secure-glow">{formatDateTR(a.scheduledAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: "secure" | "breach" | "amber";
}) {
  const accentClasses = {
    secure: "text-secure-glow border-secure/30 bg-secure/5",
    breach: "text-breach-glow border-breach/30 bg-breach/5",
    amber: "text-amber border-amber/30 bg-amber/5",
  }[accent];

  return (
    <div className={`glass-panel flex items-center gap-4 border p-5 ${accentClasses}`}>
      <div className={`rounded-md border p-2.5 ${accentClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-2xl font-bold text-steel-100">{value}</p>
        <p className="terminal-label">{label}</p>
      </div>
    </div>
  );
}
