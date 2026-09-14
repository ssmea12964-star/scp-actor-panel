import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { sendDiscordEmbed, EMBED_COLORS, mentionUser } from "@/lib/discord";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekir." }, { status: 403 });
  }

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { author: true },
  });
  if (!report) return NextResponse.json({ error: "Rapor bulunamadı." }, { status: 404 });

  const updated = await prisma.report.update({
    where: { id: params.id },
    data: {
      status: "ONAYLANDI",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
  });

  await sendDiscordEmbed(process.env.DISCORD_REPORT_LOG_CHANNEL_ID!, {
    title: `✅ RAPOR ONAYLANDI — ${report.scpOrRoleName}`,
    description: `${mentionUser(report.author.discordId)} tarafından gönderilen rapor onaylandı.`,
    color: EMBED_COLORS.secure,
    fields: [{ name: "Onaylayan", value: session.user.name ?? "Bilinmiyor" }],
    footer: { text: `Rapor ID: ${report.id}` },
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ report: updated });
}
