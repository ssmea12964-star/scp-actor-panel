import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { sendDiscordEmbed, EMBED_COLORS, mentionUser } from "@/lib/discord";

const createSchema = z.object({
  scpName: z.string().min(2, "SCP / rol adı gerekli.").max(80),
  actorDiscordId: z.string().min(5, "Atanacak aktör seçilmeli."),
  actorUsername: z.string().min(1),
  scheduledAt: z.string().datetime({ message: "Geçerli bir tarih/saat girin." }),
  roleNote: z.string().max(1000).optional(),
});

/** GET /api/scp-assignments — Tüm SCP atamalarını listeler. */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const assignments = await prisma.scpAssignment.findMany({
    orderBy: { scheduledAt: "desc" },
    include: { actor: true, assignedBy: true },
    take: 100,
  });

  return NextResponse.json({ assignments });
}

/** POST /api/scp-assignments — Yeni SCP ataması oluşturur ve Discord'a bildirim atar. */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekir." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { scpName, actorDiscordId, actorUsername, scheduledAt, roleNote } = parsed.data;

  // Atanacak aktörü DB'de bul ya da (ilk defa görülüyorsa) oluştur.
  const actor = await prisma.user.upsert({
    where: { discordId: actorDiscordId },
    update: { username: actorUsername },
    create: { discordId: actorDiscordId, username: actorUsername, name: actorUsername },
  });

  const assignment = await prisma.scpAssignment.create({
    data: {
      scpName,
      roleNote,
      scheduledAt: new Date(scheduledAt),
      actorId: actor.id,
      assignedById: session.user.id,
    },
  });

  const messageId = await sendDiscordEmbed(
    process.env.DISCORD_SCP_ASSIGNMENT_CHANNEL_ID!,
    {
      title: `📋 YENİ ATAMA — ${scpName}`,
      description: "Aşağıdaki personel belirtilen anomali/rol için görevlendirilmiştir.",
      color: EMBED_COLORS.secure,
      fields: [
        { name: "Atanan Aktör", value: mentionUser(actorDiscordId), inline: true },
        {
          name: "Tarih / Saat",
          value: new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
            new Date(scheduledAt)
          ),
          inline: true,
        },
        { name: "Atayan Yetkili", value: session.user.name ?? "Bilinmiyor", inline: true },
        ...(roleNote ? [{ name: "Rol Notu", value: roleNote }] : []),
      ],
      footer: { text: "SCP Vakıası — Aktörlük Yönetim Sistemi" },
      timestamp: new Date().toISOString(),
    },
    mentionUser(actorDiscordId)
  );

  if (messageId) {
    await prisma.scpAssignment.update({
      where: { id: assignment.id },
      data: { discordMessageId: messageId },
    });
  }

  return NextResponse.json({ assignment }, { status: 201 });
}
