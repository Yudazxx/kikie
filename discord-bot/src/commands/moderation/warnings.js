const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Warnings } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Lihat daftar warning user')
    .addUserOption(opt => opt.setName('user').setDescription('User yang ingin dilihat warningnya').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('user') || interaction.options.getUser('user');
    const userId = target.id || target.user?.id;
    const warns = Warnings.get(interaction.guild.id, userId);

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(`📋 Warnings - ${target.user?.tag || target.tag}`)
      .setThumbnail((target.user || target).displayAvatarURL())
      .setTimestamp();

    if (warns.length === 0) {
      embed.setDescription('✅ User ini tidak memiliki warning.');
    } else {
      embed.setDescription(`Total: **${warns.length} warning(s)**`);
      warns.slice(0, 10).forEach((w, i) => {
        embed.addFields({
          name: `#${w.id} — ${new Date(w.created_at).toLocaleDateString('id-ID')}`,
          value: `**Alasan:** ${w.reason}\n**Moderator:** <@${w.moderator_id}>`
        });
      });
      if (warns.length > 10) embed.setFooter({ text: `Menampilkan 10 dari ${warns.length} warnings` });
    }

    await interaction.reply({ embeds: [embed] });
  }
};
