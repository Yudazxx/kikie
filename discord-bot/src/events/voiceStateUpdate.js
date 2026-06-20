const { GuildConfig } = require('../database');
const { joinAfkChannel } = require('../handlers/voiceManager');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const client = oldState.client || newState.client;
    const guildId = oldState.guild?.id || newState.guild?.id;
    if (!guildId) return;

    const config = GuildConfig.get(guildId);
    if (!config.afk_voice_channel) return;

    const botId = client.user.id;

    if (oldState.id === botId || newState.id === botId) {
      if (oldState.channelId && !newState.channelId) {
        setTimeout(async () => {
          const freshConfig = GuildConfig.get(guildId);
          if (freshConfig.afk_voice_channel) {
            await joinAfkChannel(client, guildId, freshConfig.afk_voice_channel);
          }
        }, 5000);
      }
    }
  }
};
