const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Warnings } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('Hapus semua warning user')
    .addUserOption(opt => opt.setName('user').setDescription('User yang warningnya akan dihapus').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const target = interaction.options.getMember('user') || interaction.options.getUser('user');
    const userId = target.id || target.user?.id;
    const user = target.user || target;

    const count = Warnings.count(interaction.guild.id, userId);
    if (count === 0) return interaction.reply({ content: `✅ ${user.tag} tidak memiliki warning.`, ephemeral: true });

    Warnings.clear(interaction.guild.id, userId);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🗑️ Warnings Dihapus')
      .setDescription(`Semua **${count}** warning milik ${user.tag} telah dihapus.`)
      .addFields({ name: '🛡️ Moderator', value: `${interaction.user}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
