"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ShieldPlus, Loader2 } from "lucide-react";

type RosterMember = { id: string; username: string; avatarUrl: string | null };

// Örnek SCP havuzu — kendi topluluğunun listesiyle değiştirebilirsin, ya da
// serbest metin girişine çevirebilirsin.
const SCP_POOL = [
  "SCP-049", "SCP-076", "SCP-096", "SCP-105", "SCP-173",
  "SCP-682", "SCP-811", "SCP-939", "SCP-999", "SCP-1048",
];

export function ScpAssignForm() {
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [scpName, setScpName] = useState("");
  const [actorId, setActorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [roleNote, setRoleNote] = useState("");

  useEffect(() => {
    fetch("/api/discord/members")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Kadro alınamadı.");
        setRoster(data.members);
      })
      .catch((err) => setRosterError(err.message))
      .finally(() => setLoadingRoster(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const actor = roster.find((m) => m.id === actorId);
    if (!actor) {
      toast.error("Lütfen bir aktör seçin.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/scp-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scpName,
          actorDiscordId: actor.id,
          actorUsername: actor.username,
          scheduledAt: new Date(scheduledAt).toISOString(),
          roleNote: roleNote || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Atama oluşturulamadı.");

      toast.success(`${scpName} ataması ${actor.username} için oluşturuldu.`);
      setScpName("");
      setActorId("");
      setScheduledAt("");
      setRoleNote("");
    } catch (err: any) {
      toast.error(err.message ?? "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SCP Ataması Oluştur</CardTitle>
        <CardDescription>
          Atama yapıldığında Discord'daki atama kanalına embed bildirim düşer ve aktör etiketlenir.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="scpName">SCP Adı</Label>
            <Select value={scpName} onValueChange={setScpName}>
              <SelectTrigger id="scpName">
                <SelectValue placeholder="Bir anomali seçin" />
              </SelectTrigger>
              <SelectContent>
                {SCP_POOL.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="actor">Atanacak Aktör</Label>
            {rosterError ? (
              <p className="rounded-md border border-breach/40 bg-breach/5 px-3 py-2 text-xs text-breach-glow">
                {rosterError}
              </p>
            ) : (
              <Select value={actorId} onValueChange={setActorId} disabled={loadingRoster}>
                <SelectTrigger id="actor">
                  <SelectValue placeholder={loadingRoster ? "Kadro yükleniyor..." : "Bir aktör seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {roster.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={m.avatarUrl ?? undefined} />
                          <AvatarFallback>{m.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {m.username}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="scheduledAt">Tarih / Saat</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="roleNote">Rol Notu</Label>
            <Textarea
              id="roleNote"
              placeholder="Aktöre iletilecek özel talimatlar, kısıtlamalar, senaryo notları..."
              value={roleNote}
              onChange={(e) => setRoleNote(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={submitting || !scpName || !actorId} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4" />}
            {submitting ? "Atanıyor..." : "Atamayı Oluştur"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
