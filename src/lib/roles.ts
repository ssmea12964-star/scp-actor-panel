import { ActorRole } from "@prisma/client";

/**
 * Hiyerarşi sırası (düşükten yükseğe). Discord rol ID'leri .env üzerinden
 * eşleştirilir; bir kullanıcının Discord'da birden çok rolü varsa en
 * yüksek olan esas alınır.
 */
export const ROLE_HIERARCHY: ActorRole[] = [
  "DENEME_AKTOR",
  "AKTOR",
  "KIDEMLI_AKTOR",
  "UST_AKTOR",
  "BAS_AKTOR",
  "AKTOR_SORUMLUSU",
];

export const ROLE_LABELS: Record<ActorRole, string> = {
  DENEME_AKTOR: "Deneme Aktör",
  AKTOR: "Aktör",
  KIDEMLI_AKTOR: "Kıdemli Aktör",
  UST_AKTOR: "Üst Aktör",
  BAS_AKTOR: "Baş Aktör",
  AKTOR_SORUMLUSU: "Aktör Sorumlusu",
};

/** Panelde "Yönetici" sayılan roller (raporları inceleyebilir, SCP atayabilir). */
export const ADMIN_ROLES: ActorRole[] = ["UST_AKTOR", "BAS_AKTOR", "AKTOR_SORUMLUSU"];

export function isAdminRole(role: ActorRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function roleRank(role: ActorRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/** Discord rol ID listesinden (.env eşlemesi) en yüksek ActorRole'ü döndürür. */
export function resolveHighestRole(discordRoleIds: string[]): ActorRole {
  const map: { envKey: string; role: ActorRole }[] = [
    { envKey: process.env.ROLE_ACTOR_MANAGER_ID!, role: "AKTOR_SORUMLUSU" },
    { envKey: process.env.ROLE_CHIEF_ACTOR_ID!, role: "BAS_AKTOR" },
    { envKey: process.env.ROLE_HEAD_ADMIN_ID!, role: "UST_AKTOR" },
    { envKey: process.env.ROLE_SENIOR_ACTOR_ID!, role: "KIDEMLI_AKTOR" },
    { envKey: process.env.ROLE_ACTOR_ID!, role: "AKTOR" },
    { envKey: process.env.ROLE_TRIAL_ACTOR_ID!, role: "DENEME_AKTOR" },
  ];

  for (const { envKey, role } of map) {
    if (envKey && discordRoleIds.includes(envKey)) {
      return role;
    }
  }
  // Sunucudaki hiçbir kadro rolüne sahip değilse en düşük rütbeye düş.
  return "DENEME_AKTOR";
}

export const ROLE_BADGE_STYLES: Record<ActorRole, string> = {
  DENEME_AKTOR: "border-steel-500/40 bg-steel-800/60 text-steel-100",
  AKTOR: "border-secure-dim bg-secure-dim/30 text-secure-glow",
  KIDEMLI_AKTOR: "border-secure/50 bg-secure/10 text-secure-glow",
  UST_AKTOR: "border-amber/50 bg-amber/10 text-amber",
  BAS_AKTOR: "border-breach/50 bg-breach/10 text-breach-glow",
  AKTOR_SORUMLUSU: "border-breach bg-breach/20 text-breach-glow",
};
