const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { GuildConfig } = require('../../database');
const { joinAfkChannel } = require('../../handlers/voiceManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setafkvoice')
    .setDescription('Atur AFK voice channel untuk bot')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Voice channel yang akan dijoin bot 24/7')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const me = interaction.guild.members.me;
    const perms = channel.permissionsFor(me);

    if (!perms.has(PermissionFlagsBits.Connect)) {
      return interaction.reply({ content: '❌ Bot tidak punya izin untuk join channel tersebut.', ephemeral: true });
    }
    if (!perms.has(PermissionFlagsBits.ViewChannel)) {
      return interaction.reply({ content: '❌ Bot tidak bisa melihat channel tersebut.', ephemeral: true });
    }

    await interaction.deferReply();

    GuildConfig.set(interaction.guild.id, 'afk_voice_channel', channel.id);

    try {
      await joinAfkChannel(interaction.client, interaction.guild.id, channel.id);

      const embed = new EmbedBuilder()
        .setColor('#00FF7F')
        .setTitle('🎙️ AFK Voice Channel Diatur')
        .setDescription(`Bot sekarang akan join dan stay di ${channel} secara 24/7.`)
        .addFields(
          { name: '📢 Channel', value: `${channel} (\`${channel.id}\`)` },
          { name: '🔄 Auto-Reconnect', value: '✅ Aktif — bot akan reconnect jika terputus' },
          { name: '🔇 Status', value: 'Bot join sebagai muted dan deafened (low resource)' }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: `❌ Gagal join voice channel: ${err.message}` });
    }
  }
};
