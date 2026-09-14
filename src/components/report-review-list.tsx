"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { formatDateTR, formatDuration } from "@/lib/utils";

type ReportItem = {
  id: string;
  scpOrRoleName: string;
  roleDate: string;
  roleDurationMin: number;
  accompaniedStaff: string | null;
  summary: string;
  status: "BEKLEMEDE" | "REVIZYON_ISTENDI" | "ONAYLANDI" | "REDDEDILDI";
  author: { username: string | null; name: string | null };
};

export function ReportReviewList({ initialReports }: { initialReports: ReportItem[] }) {
  const [reports, setReports] = useState(initialReports);
  const [dialogState, setDialogState] = useState<{
    reportId: string;
    kind: "reject" | "request-info";
  } | null>(null);
  const [dialogText, setDialogText] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function callAction(id: string, action: "approve" | "reject" | "request-info", body?: object) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/reports/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem başarısız.");

      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: data.report.status } : r)));
      toast.success(
        action === "approve"
          ? "Rapor onaylandı."
          : action === "reject"
          ? "Rapor reddedildi."
          : "Revizyon talebi gönderildi."
      );
    } catch (err: any) {
      toast.error(err.message ?? "Bir hata oluştu.");
    } finally {
      setBusyId(null);
      setDialogState(null);
      setDialogText("");
    }
  }

  const pending = reports.filter((r) => r.status === "BEKLEMEDE" || r.status === "REVIZYON_ISTENDI");
  const resolved = reports.filter((r) => r.status === "ONAYLANDI" || r.status === "REDDEDILDI");

  return (
    <>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Bekleyenler ({pending.length})</TabsTrigger>
          <TabsTrigger value="resolved">Sonuçlananlar ({resolved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-steel-400">
                İncelenmeyi bekleyen rapor yok. Sistem güvenli.
              </CardContent>
            </Card>
          )}
          {pending.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-semibold text-steel-100">
                      {r.scpOrRoleName}
                    </p>
                    <p className="font-mono text-[11px] text-steel-400">
                      {r.author.username ?? r.author.name} · {formatDateTR(r.roleDate)} ·{" "}
                      {formatDuration(r.roleDurationMin)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <p className="text-sm text-steel-300">{r.summary}</p>
                {r.accompaniedStaff && (
                  <p className="text-xs text-steel-400">
                    <span className="text-steel-500">Eşlik eden: </span>
                    {r.accompaniedStaff}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    disabled={busyId === r.id}
                    onClick={() => callAction(r.id, "approve")}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="amber"
                    disabled={busyId === r.id}
                    onClick={() => setDialogState({ reportId: r.id, kind: "request-info" })}
                    className="gap-1.5"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Daha Fazla Bilgi İste
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busyId === r.id}
                    onClick={() => setDialogState({ reportId: r.id, kind: "reject" })}
                    className="gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reddet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolved.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium text-steel-100">{r.scpOrRoleName}</p>
                  <p className="font-mono text-[11px] text-steel-400">
                    {r.author.username ?? r.author.name} · {formatDateTR(r.roleDate)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!dialogState} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState?.kind === "reject" ? "Raporu Reddet" : "Daha Fazla Bilgi İste"}
            </DialogTitle>
            <DialogDescription>
              {dialogState?.kind === "reject"
                ? "Reddetme nedenini yaz. Bu not, aktöre ve log kanalına iletilir."
                : "Aktörden hangi bilgiyi/detayı revize etmesini istediğini yaz."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="dialog-note">
              {dialogState?.kind === "reject" ? "Reddetme Nedeni" : "Revizyon Notu"}
            </Label>
            <Textarea
              id="dialog-note"
              value={dialogText}
              onChange={(e) => setDialogText(e.target.value)}
              placeholder="Açıklamanızı buraya yazın..."
            />
          </div>

          <DialogFooter>
            <Button
              variant={dialogState?.kind === "reject" ? "destructive" : "amber"}
              disabled={dialogText.trim().length < 3 || busyId === dialogState?.reportId}
              onClick={() =>
                dialogState &&
                callAction(
                  dialogState.reportId,
                  dialogState.kind === "reject" ? "reject" : "request-info",
                  dialogState.kind === "reject" ? { reason: dialogText } : { note: dialogText }
                )
              }
            >
              Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
