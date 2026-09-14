/**
 * Discord REST API yardımcıları.
 *
 * Vercel serverless ortamında kalıcı bir Gateway bağlantısı (discord.js Client)
 * tutmak pratik değildir. Bu yüzden panel, bot token'ı ile doğrudan Discord'un
 * REST API'sine (https://discord.com/api/v10) istek atar: kanal bilgisi çekmek,
 * üye/rol listelemek ve embed mesaj göndermek için bu yeterlidir.
 *
 * Slash-command tabanlı etkileşimli bot (opsiyonel) `bot/index.ts` içinde,
 * discord.js Gateway client'ı ile ayrı bir process olarak çalışır (örn. Railway,
 * bir VPS veya Vercel'de değil çünkü Vercel fonksiyonları kalıcı soket tutamaz).
 */

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

function botHeaders() {
  if (!BOT_TOKEN) throw new Error("DISCORD_BOT_TOKEN tanımlı değil (.env kontrol et)");
  return {
    Authorization: `Bot ${BOT_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export type DiscordGuildMember = {
  user: {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  };
  roles: string[];
  nick: string | null;
};

/** Sunucudaki tüm üyeleri (max 1000, sayfalanmamış basit sürüm) çeker. */
export async function fetchGuildMembers(): Promise<DiscordGuildMember[]> {
  const res = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members?limit=1000`, {
    headers: botHeaders(),
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`Discord üye listesi alınamadı: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Kadro rollerinden birine sahip (Deneme Aktör -> Aktör Sorumlusu arası) üyeleri döndürür. */
export async function fetchActorRoster() {
  const actorRoleIds = [
    process.env.ROLE_TRIAL_ACTOR_ID,
    process.env.ROLE_ACTOR_ID,
    process.env.ROLE_SENIOR_ACTOR_ID,
    process.env.ROLE_HEAD_ADMIN_ID,
    process.env.ROLE_CHIEF_ACTOR_ID,
    process.env.ROLE_ACTOR_MANAGER_ID,
  ].filter(Boolean) as string[];

  const members = await fetchGuildMembers();
  return members
    .filter((m) => m.roles.some((r) => actorRoleIds.includes(r)))
    .map((m) => ({
      id: m.user.id,
      username: m.nick ?? m.user.global_name ?? m.user.username,
      avatarUrl: m.user.avatar
        ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
        : null,
      roles: m.roles,
    }));
}

export type DiscordEmbed = {
  title: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
  thumbnail?: { url: string };
};

/** Bir kanala embed mesajı gönderir, gönderilen mesajın ID'sini döndürür. */
export async function sendDiscordEmbed(
  channelId: string,
  embed: DiscordEmbed,
  content?: string
): Promise<string | null> {
  if (!BOT_TOKEN || !channelId) return null;

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: botHeaders(),
    body: JSON.stringify({
      content,
      embeds: [embed],
      allowed_mentions: { parse: ["users", "roles"] },
    }),
  });

  if (!res.ok) {
    console.error("Discord embed gönderilemedi:", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data.id as string;
}

// --- Renk / rol sabitleri ---
export const EMBED_COLORS = {
  breach: 0xe4232f, // Kırmızı - reddedildi / uyarı
  secure: 0x1fd67a, // Yeşil - onaylandı / güvenli
  amber: 0xe2a336, // Sarı - revizyon / dikkat
  neutral: 0x5b636b, // Gri - bilgi
};

export function mentionUser(discordId: string) {
  return `<@${discordId}>`;
}

export function mentionRole(roleId: string) {
  return `<@&${roleId}>`;
}

export function adminRoleMentions() {
  return [
    process.env.ROLE_HEAD_ADMIN_ID,
    process.env.ROLE_CHIEF_ACTOR_ID,
    process.env.ROLE_ACTOR_MANAGER_ID,
  ]
    .filter(Boolean)
    .map((id) => mentionRole(id as string))
    .join(" ");
}
