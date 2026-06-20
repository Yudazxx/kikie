const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban member dari server')
    .addUserOption(opt => opt.setName('user').setDescription('User yang akan di-ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Alasan ban').setRequired(false))
    .addIntegerOption(opt => opt.setName('delete_days').setDescription('Hapus pesan (hari, 0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user') || interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';
    const deleteMessageSeconds = (interaction.options.getInteger('delete_days') || 0) * 86400;

    if (!target) return interaction.reply({ content: '❌ User tidak ditemukan.', ephemeral: true });
    const userId = target.id || target.user?.id;
    if (userId === interaction.user.id) return interaction.reply({ content: '❌ Kamu tidak bisa ban dirimu sendiri.', ephemeral: true });

    const member = target.user ? target : null;
    if (member && !member.bannable) return interaction.reply({ content: '❌ Bot tidak bisa ban user ini.', ephemeral: true });

    try {
      const user = target.user || target;
      await user.send({
        embeds: [new EmbedBuilder()
          .setColor('#8B0000')
          .setTitle(`🔨 Kamu di-ban dari ${interaction.guild.name}`)
          .addFields({ name: '📝 Alasan', value: reason })
          .setTimestamp()]
      }).catch(() => {});
    } catch {}

    await interaction.guild.members.ban(target, { reason, deleteMessageSeconds });

    const user = target.user || target;
    const embed = new EmbedBuilder()
      .setColor('#8B0000')
      .setTitle('🔨 Member Di-Ban')
      .addFields(
        { name: '👤 User', value: `${user.tag}`, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user}`, inline: true },
        { name: '📝 Alasan', value: reason }
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
