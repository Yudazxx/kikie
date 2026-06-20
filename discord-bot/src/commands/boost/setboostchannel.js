const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { GuildConfig } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setboostchannel')
    .setDescription('Atur channel untuk pesan boost')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel boost').setRequired(true).addChannelTypes(ChannelType.GuildText))
    .addStringOption(opt => opt.setName('message').setDescription('Pesan boost. Variabel: {mention_user}, {username}, {server}').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');

    const data = { boost_channel: channel.id };
    if (message) data.boost_message = message;

    GuildConfig.setMultiple(interaction.guild.id, data);

    const embed = new EmbedBuilder()
      .setColor('#FF73FA')
      .setTitle('🚀 Boost Channel Dikonfigurasi')
      .addFields(
        { name: '📢 Channel', value: `${channel}`, inline: true },
        { name: '📝 Pesan', value: message || GuildConfig.get(interaction.guild.id).boost_message }
      )
      .addFields({ name: '💡 Variabel Tersedia', value: '`{mention_user}` `{username}` `{server}` `{boost_count}`' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
