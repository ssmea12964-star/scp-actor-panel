import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { author: true, reviewedBy: true },
  });

  if (!report) return NextResponse.json({ error: "Rapor bulunamadı." }, { status: 404 });

  const admin = isAdminRole(session.user.role);
  if (!admin && report.authorId !== session.user.id) {
    return NextResponse.json({ error: "Bu rapora erişim yetkiniz yok." }, { status: 403 });
  }

  return NextResponse.json({ report });
}
