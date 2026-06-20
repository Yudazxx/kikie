const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick member dari server')
    .addUserOption(opt => opt.setName('user').setDescription('User yang akan di-kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Alasan kick').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';

    if (!target) return interaction.reply({ content: '❌ User tidak ditemukan.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Kamu tidak bisa kick dirimu sendiri.', ephemeral: true });
    if (!target.kickable) return interaction.reply({ content: '❌ Bot tidak bisa kick user ini.', ephemeral: true });

    try {
      await target.send({
        embeds: [new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(`👢 Kamu di-kick dari ${interaction.guild.name}`)
          .addFields({ name: '📝 Alasan', value: reason })
          .setTimestamp()]
      });
    } catch {}

    await target.kick(reason);

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('👢 Member Di-Kick')
      .addFields(
        { name: '👤 User', value: `${target.user.tag}`, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user}`, inline: true },
        { name: '📝 Alasan', value: reason }
      )
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
