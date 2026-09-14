import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { fetchActorRoster } from "@/lib/discord";

/** GET /api/discord/members — Sunucudaki aktör kadrosunu döndürür (dropdown için). */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  if (!isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekir." }, { status: 403 });
  }

  try {
    const roster = await fetchActorRoster();
    return NextResponse.json({ members: roster });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Discord aktör kadrosu alınamadı. Bot izinlerini kontrol edin." },
      { status: 502 }
    );
  }
}
