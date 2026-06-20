const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Warnings } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Beri peringatan kepada member')
    .addUserOption(opt => opt.setName('user').setDescription('User yang akan di-warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Alasan warn').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';

    if (!target) return interaction.reply({ content: '❌ User tidak ditemukan.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ Kamu tidak bisa warn dirimu sendiri.', ephemeral: true });
    if (target.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: '❌ Tidak bisa warn Administrator.', ephemeral: true });

    Warnings.add(interaction.guild.id, target.id, interaction.user.id, reason);
    const count = Warnings.count(interaction.guild.id, target.id);

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('⚠️ Warning Diberikan')
      .addFields(
        { name: '👤 User', value: `${target} (${target.user.tag})`, inline: true },
        { name: '🛡️ Moderator', value: `${interaction.user}`, inline: true },
        { name: '📝 Alasan', value: reason },
        { name: '📊 Total Warnings', value: `${count} warning(s)` }
      )
      .setThumbnail(target.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    try {
      await target.send({
        embeds: [new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle(`⚠️ Kamu mendapat warning di ${interaction.guild.name}`)
          .addFields(
            { name: '📝 Alasan', value: reason },
            { name: '📊 Total Warnings', value: `${count}` }
          )
          .setTimestamp()]
      });
    } catch {}
  }
};
