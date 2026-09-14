"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Send } from "lucide-react";

export function ReportForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    scpOrRoleName: "",
    roleDate: "",
    roleDurationMin: "",
    accompaniedStaff: "",
    summary: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          roleDate: new Date(form.roleDate).toISOString(),
          roleDurationMin: Number(form.roleDurationMin),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Rapor gönderilemedi.");

      toast.success("Rapor gönderildi. Discord kanalına bildirim düştü.");
      router.push("/dashboard/reports");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Rol Raporu</CardTitle>
        <CardDescription>
          Rol içi etkinliğini kayıt altına al. Gönderdiğinde Rapor Kanalına otomatik
          bildirim düşer ve yönetim ekibi etiketlenir.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="scpOrRoleName">SCP / Rol Adı</Label>
            <Input
              id="scpOrRoleName"
              placeholder="Örn: SCP-811"
              required
              value={form.scpOrRoleName}
              onChange={(e) => setForm({ ...form, scpOrRoleName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="roleDate">Tarih / Saat</Label>
              <Input
                id="roleDate"
                type="datetime-local"
                required
                value={form.roleDate}
                onChange={(e) => setForm({ ...form, roleDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roleDurationMin">Rol Süresi (dakika)</Label>
              <Input
                id="roleDurationMin"
                type="number"
                min={1}
                placeholder="60"
                required
                value={form.roleDurationMin}
                onChange={(e) => setForm({ ...form, roleDurationMin: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="accompaniedStaff">Eşlik Eden Personel</Label>
            <Input
              id="accompaniedStaff"
              placeholder="Örn: Dr. Aylin Kaya, Güvenlik Görevlisi Mert Y."
              value={form.accompaniedStaff}
              onChange={(e) => setForm({ ...form, accompaniedStaff: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="summary">Günün Kısa Özeti</Label>
            <Textarea
              id="summary"
              placeholder="Rol sırasında yaşanan olayları, anomali davranışlarını ve sonuçları özetle..."
              required
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="gap-2">
            <Send className="h-4 w-4" />
            {loading ? "Gönderiliyor..." : "Raporu Gönder"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
