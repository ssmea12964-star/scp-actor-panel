import { prisma } from "@/lib/prisma";
import { ScpAssignForm } from "@/components/scp-assign-form";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTR } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export default async function AssignScpPage() {
  const recent = await prisma.scpAssignment.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { actor: true, assignedBy: true },
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-wide text-steel-100">SCP ATA</h1>
          <p className="mt-1 text-sm text-steel-300">
            Sunucudaki aktör kadrosundan birini bir anomaliye görevlendir.
          </p>
        </div>
        <ScpAssignForm />
      </div>

      <div className="lg:col-span-2">
        <h2 className="terminal-label mb-3">SON ATAMALAR</h2>
        <div className="space-y-3">
          {recent.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-steel-400">
                Henüz bir atama yapılmadı.
              </CardContent>
            </Card>
          )}
          {recent.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="mt-0.5 rounded-md border border-secure/30 bg-secure/5 p-1.5">
                  <ShieldCheck className="h-4 w-4 text-secure-glow" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-steel-100">{a.scpName}</p>
                  <p className="font-mono text-[11px] text-steel-400">
                    {a.actor.username} · {formatDateTR(a.scheduledAt)}
                  </p>
                  {a.roleNote && <p className="mt-1 text-xs text-steel-400">{a.roleNote}</p>}
                  <p className="mt-1 font-mono text-[10px] text-steel-600">
                    Atayan: {a.assignedBy.username ?? a.assignedBy.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
