require('dotenv').config();

const { REST, Routes } = require('@discordjs/rest');
const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('[ERROR] DISCORD_TOKEN dan CLIENT_ID harus diisi di .env!');
  process.exit(1);
}

const commands = [];

function loadCommands(dir) {
  const folders = fs.readdirSync(dir);
  for (const folder of folders) {
    const folderPath = path.join(dir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(folderPath, file));
      if (command.data) {
        commands.push(command.data.toJSON());
        console.log(`[CMD] Ditemukan: /${command.data.name}`);
      }
    }
  }
}

loadCommands(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`\n[DEPLOY] Mendaftarkan ${commands.length} slash commands...`);

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`[DEPLOY] ✅ Berhasil daftarkan ke guild ${guildId} (instant, tanpa delay)`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('[DEPLOY] ✅ Berhasil daftarkan ke global (efektif dalam ~1 jam)');
    }
  } catch (error) {
    console.error('[DEPLOY ERROR]', error);
  }
})();
