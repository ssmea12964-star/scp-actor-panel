import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { sendDiscordEmbed, EMBED_COLORS, mentionUser } from "@/lib/discord";

const schema = z.object({ reason: z.string().min(3, "Reddetme nedeni gerekli.").max(1000) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekir." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { author: true },
  });
  if (!report) return NextResponse.json({ error: "Rapor bulunamadı." }, { status: 404 });

  const updated = await prisma.report.update({
    where: { id: params.id },
    data: {
      status: "REDDEDILDI",
      rejectionReason: parsed.data.reason,
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    },
  });

  await sendDiscordEmbed(process.env.DISCORD_REPORT_LOG_CHANNEL_ID!, {
    title: `❌ RAPOR REDDEDİLDİ — ${report.scpOrRoleName}`,
    description: `${mentionUser(report.author.discordId)} tarafından gönderilen rapor reddedildi.`,
    color: EMBED_COLORS.breach,
    fields: [
      { name: "Reddeden", value: session.user.name ?? "Bilinmiyor" },
      { name: "Neden", value: parsed.data.reason },
    ],
    footer: { text: `Rapor ID: ${report.id}` },
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ report: updated });
}
