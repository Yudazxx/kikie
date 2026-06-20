require('dotenv').config();

const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('[ERROR] DISCORD_TOKEN tidak ditemukan di .env!');
  console.error('[ERROR] Salin .env.example ke .env lalu isi DISCORD_TOKEN.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
  rest: { timeout: 15000 }
});

client.commands = new Collection();

function loadCommands(dir) {
  const folders = fs.readdirSync(dir);
  for (const folder of folders) {
    const folderPath = path.join(dir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(folderPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`[CMD] Loaded: /${command.data.name}`);
      }
    }
  }
}

function loadEvents(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const event = require(path.join(dir, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[EVT] Loaded: ${event.name}`);
  }
}

loadCommands(path.join(__dirname, 'commands'));
loadEvents(path.join(__dirname, 'events'));

client.on('error', err => console.error('[CLIENT ERROR]', err.message));
client.on('warn', msg => console.warn('[WARN]', msg));

process.on('unhandledRejection', err => console.error('[UNHANDLED]', err));
process.on('uncaughtException', err => {
  console.error('[UNCAUGHT]', err);
});

client.login(token).then(() => {
  console.log('[BOT] 🚀 Berhasil login ke Discord!');
}).catch(err => {
  console.error('[LOGIN ERROR]', err.message);
  process.exit(1);
});
