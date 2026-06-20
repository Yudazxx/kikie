const { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
const { GuildConfig } = require('../database');

const connections = new Map();
const reconnectTimers = new Map();

async function joinAfkChannel(client, guildId, channelId) {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;

  if (connections.has(guildId)) {
    const existing = connections.get(guildId);
    if (existing.joinConfig && existing.joinConfig.channelId === channelId &&
        existing.state.status !== VoiceConnectionStatus.Destroyed) {
      return;
    }
    existing.destroy();
    connections.delete(guildId);
  }

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });

    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
        ]);
      } catch {
        scheduleReconnect(client, guildId, channelId);
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      connections.delete(guildId);
    });

    connection.on('error', () => {
      scheduleReconnect(client, guildId, channelId);
    });

    connections.set(guildId, connection);
    return connection;
  } catch {
    scheduleReconnect(client, guildId, channelId);
  }
}

function scheduleReconnect(client, guildId, channelId) {
  if (reconnectTimers.has(guildId)) return;

  const timer = setTimeout(async () => {
    reconnectTimers.delete(guildId);
    const config = GuildConfig.get(guildId);
    if (config && config.afk_voice_channel === channelId) {
      await joinAfkChannel(client, guildId, channelId);
    }
  }, 10_000);

  reconnectTimers.set(guildId, timer);
}

function leaveAfkChannel(guildId) {
  if (connections.has(guildId)) {
    connections.get(guildId).destroy();
    connections.delete(guildId);
  }
  if (reconnectTimers.has(guildId)) {
    clearTimeout(reconnectTimers.get(guildId));
    reconnectTimers.delete(guildId);
  }
}

async function initAllAfkChannels(client) {
  for (const [guildId] of client.guilds.cache) {
    const config = GuildConfig.get(guildId);
    if (config && config.afk_voice_channel) {
      await joinAfkChannel(client, guildId, config.afk_voice_channel);
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

module.exports = { joinAfkChannel, leaveAfkChannel, initAllAfkChannels };
