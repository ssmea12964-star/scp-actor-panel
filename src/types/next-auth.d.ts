import { ActorRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      role: ActorRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
