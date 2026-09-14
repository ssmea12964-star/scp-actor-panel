/**
 * SCP Vakıası Aktörlük Botu — sadece 2 basit komut yapar:
 *   /panel        -> web panelinin linkini gönderir
 *   /rapor-durum  -> kullanıcının son raporunun durumunu gösterir
 * SCP atama, rapor gönderme/inceleme gibi TÜM diğer işlemler yalnızca
 * web panelinden yapılır — bot sadece bilgi amaçlıdır, bu yüzden kurulumu
 * da minimum seviyede tutulmuştur.
 *
 * Kalıcı bir Gateway bağlantısı gerektirdiği için bu bot Vercel'de DEĞİL,
 * ayrı bir process olarak (Railway, Fly.io, bir VPS) çalıştırılmalıdır.
 * Web panel ile aynı DATABASE_URL'i kullanır.
 *
 * Çalıştırma: npm run bot:start
 */
import "dotenv/config";
import { Client, GatewayIntentBits, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { EMBED_COLORS } from "../src/lib/discord";

const prisma = new PrismaClient();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
  console.log(`Bot aktif: ${client.user?.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === "panel") return handlePanel(interaction);
    if (interaction.commandName === "rapor-durum") return handleReportStatus(interaction);
  } catch (err) {
    console.error(err);
    const msg = { content: "İşlem sırasında bir hata oluştu.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

async function handlePanel(interaction: ChatInputCommandInteraction) {
  const url = process.env.NEXTAUTH_URL ?? "https://your-project.vercel.app";
  await interaction.reply({
    content: `🖥️ Aktörlük & Rapor Yönetim Paneli: ${url}`,
    ephemeral: true,
  });
}

async function handleReportStatus(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const user = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
  if (!user) {
    return interaction.editReply("Panelde henüz kayıtlı görünmüyorsun. Önce web paneline giriş yap.");
  }

  const report = await prisma.report.findFirst({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!report) {
    return interaction.editReply("Henüz gönderilmiş bir rapor bulunamadı.");
  }

  const statusLabel: Record<string, string> = {
    BEKLEMEDE: "🟡 Beklemede",
    REVIZYON_ISTENDI: "🟠 Revizyon İstendi",
    ONAYLANDI: "🟢 Onaylandı",
    REDDEDILDI: "🔴 Reddedildi",
  };

  const embed = new EmbedBuilder()
    .setTitle(`Son Raporun — ${report.scpOrRoleName}`)
    .setDescription(statusLabel[report.status])
    .setColor(EMBED_COLORS.neutral)
    .setTimestamp(report.createdAt);

  if (report.reviewNote) embed.addFields({ name: "Revizyon Notu", value: report.reviewNote });
  if (report.rejectionReason) embed.addFields({ name: "Reddetme Nedeni", value: report.rejectionReason });

  await interaction.editReply({ embeds: [embed] });
}

client.login(process.env.DISCORD_BOT_TOKEN);
