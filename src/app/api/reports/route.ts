import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { sendDiscordEmbed, EMBED_COLORS, adminRoleMentions } from "@/lib/discord";

const createSchema = z.object({
  scpOrRoleName: z.string().min(2, "SCP / rol adı gerekli.").max(80),
  roleDate: z.string().datetime({ message: "Geçerli bir tarih girin." }),
  roleDurationMin: z.coerce.number().int().min(1, "Rol süresi gerekli.").max(1440),
  accompaniedStaff: z.string().max(500).optional(),
  summary: z.string().min(10, "Özet en az 10 karakter olmalı.").max(4000),
});

/** GET /api/reports — Yönetici ise tüm raporları, değilse yalnızca kendi raporlarını döndürür. */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const admin = isAdminRole(session.user.role);

  const reports = await prisma.report.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(admin ? {} : { authorId: session.user.id }),
    },
    orderBy: { createdAt: "desc" },
    include: { author: true, reviewedBy: true },
    take: 200,
  });

  return NextResponse.json({ reports });
}

/** POST /api/reports — Yeni rapor oluşturur (tüm aktörler, Deneme Aktör dahil). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { scpOrRoleName, roleDate, roleDurationMin, accompaniedStaff, summary } = parsed.data;

  const report = await prisma.report.create({
    data: {
      scpOrRoleName,
      roleDate: new Date(roleDate),
      roleDurationMin,
      accompaniedStaff,
      summary,
      authorId: session.user.id,
    },
  });

  const messageId = await sendDiscordEmbed(
    process.env.DISCORD_REPORT_CHANNEL_ID!,
    {
      title: `📝 YENİ RAPOR — ${scpOrRoleName}`,
      description: summary.length > 300 ? summary.slice(0, 297) + "..." : summary,
      color: EMBED_COLORS.amber,
      fields: [
        { name: "Aktör", value: session.user.name ?? "Bilinmiyor", inline: true },
        {
          name: "Tarih",
          value: new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(roleDate)),
          inline: true,
        },
        { name: "Süre", value: `${roleDurationMin} dk`, inline: true },
        ...(accompaniedStaff ? [{ name: "Eşlik Eden Personel", value: accompaniedStaff }] : []),
        { name: "Durum", value: "🟡 Beklemede" },
      ],
      footer: { text: `Rapor ID: ${report.id}` },
      timestamp: new Date().toISOString(),
    },
    `${adminRoleMentions()} — yeni bir rapor incelemenizi bekliyor.`
  );

  if (messageId) {
    await prisma.report.update({ where: { id: report.id }, data: { discordMessageId: messageId } });
  }

  return NextResponse.json({ report }, { status: 201 });
}
