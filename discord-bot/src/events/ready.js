const { initAllAfkChannels } = require('../handlers/voiceManager');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[BOT] ✅ Login sebagai: ${client.user.tag}`);
    console.log(`[BOT] 🌐 Melayani ${client.guilds.cache.size} server`);

    client.user.setPresence({
      activities: [{ name: `${client.guilds.cache.size} server | /help`, type: 3 }],
      status: 'online'
    });

    console.log('[VOICE] 🎙️ Menghubungkan ke AFK voice channels...');
    await initAllAfkChannels(client);
    console.log('[VOICE] ✅ AFK voice channels diinisialisasi.');
  }
};
