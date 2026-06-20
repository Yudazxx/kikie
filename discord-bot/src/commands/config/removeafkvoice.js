const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../database');
const { leaveAfkChannel } = require('../../handlers/voiceManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeafkvoice')
    .setDescription('Hapus AFK voice channel dan bot akan leave')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const config = GuildConfig.get(interaction.guild.id);

    if (!config.afk_voice_channel) {
      return interaction.reply({ content: '❌ Tidak ada AFK voice channel yang diatur.', ephemeral: true });
    }

    leaveAfkChannel(interaction.guild.id);
    GuildConfig.set(interaction.guild.id, 'afk_voice_channel', null);

    const embed = new EmbedBuilder()
      .setColor('#FF4444')
      .setTitle('🎙️ AFK Voice Channel Dihapus')
      .setDescription('Bot telah leave dari voice channel dan AFK voice channel telah dihapus.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
