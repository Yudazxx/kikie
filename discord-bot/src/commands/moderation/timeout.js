const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout member')
    .addUserOption(opt => opt.setName('user').setDescription('User yang akan di-timeout').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration').setDescription('Durasi timeout (menit)').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(opt => opt.setName('reason').setDescription('Alasan timeout').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';

    if (!target) return interaction.reply({ content: '❌ User tidak ditemukan.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Kamu tidak bisa timeout dirimu sendiri.', ephemeral: true });
    if (!target.moderatable) return interaction.reply({ content: '❌ Bot tidak bisa timeout user ini.', ephemeral: true });

    const ms = duration * 60 * 1000;
    await target.timeout(ms, reason);

    const embed = new EmbedBuilder()
      .setColor('#FF6B35')
      .setTitle('⏱️ Member Di-Timeout')
      .addFields(
        { name: '👤 User', value: `${target} (${target.user.tag})`, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user}`, inline: true },
        { name: '⏰ Durasi', value: `${duration} menit`, inline: true },
        { name: '📝 Alasan', value: reason }
      )
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    try {
      await target.send({
        embeds: [new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle(`⏱️ Kamu di-timeout di ${interaction.guild.name}`)
          .addFields(
            { name: '⏰ Durasi', value: `${duration} menit` },
            { name: '📝 Alasan', value: reason }
          )
          .setTimestamp()]
      });
    } catch {}
  }
};
