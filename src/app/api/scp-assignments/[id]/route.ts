import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekir." }, { status: 403 });
  }

  await prisma.scpAssignment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
