import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { resolveHighestRole } from "@/lib/roles";

const GUILD_ID = process.env.DISCORD_GUILD_ID!;

/** Kullanıcının hedef Discord sunucusundaki rollerini çeker (bot token ile). */
async function fetchMemberRoles(discordUserId: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordUserId}`,
      {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.roles ?? [];
  } catch {
    return [];
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
   DiscordProvider({
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  authorization: { params: { scope: "identify email guilds guilds.members.read" } },
  allowDangerousEmailAccountLinking: true,
  profile(profile) {
        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          email: profile.email,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
        };
      },
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.providerAccountId) return false;

      const roleIds = await fetchMemberRoles(account.providerAccountId);
      const resolvedRole = resolveHighestRole(roleIds);

      await prisma.user.upsert({
        where: { discordId: account.providerAccountId },
        update: {
          role: resolvedRole,
          name: user.name,
          image: user.image,
          username: user.name,
        },
        create: {
          discordId: account.providerAccountId,
          name: user.name,
          image: user.image,
          username: user.name,
          email: user.email,
          role: resolvedRole,
        },
      });

      return true;
    },
    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (dbUser && session.user) {
        session.user.id = dbUser.id;
        session.user.discordId = dbUser.discordId;
        session.user.role = dbUser.role;
      }
      return session;
    },
  },
};
