/**
 * Slash komutlarını Discord'a kaydeder. Bot koduyla ayrı çalışır çünkü
 * komutlar sadece bot/token değiştiğinde ya da yeni komut eklendiğinde
 * yeniden kaydedilmesi gerekir.
 *
 * Çalıştırma: npm run bot:deploy
 */
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Aktörlük & Rapor Yönetim Panelinin bağlantısını gönderir."),

  new SlashCommandBuilder()
    .setName("rapor-durum")
    .setDescription("Son gönderdiğin rol raporunun durumunu gösterir."),
].map((c) => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN!);

(async () => {
  try {
    console.log(`${commands.length} slash komutu kaydediliyor...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
      { body: commands }
    );
    console.log("Slash komutları başarıyla kaydedildi.");
  } catch (err) {
    console.error(err);
  }
})();
