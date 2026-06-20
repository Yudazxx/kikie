const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automodconfig')
    .setDescription('Konfigurasi Auto-Moderation')
    .addBooleanOption(opt => opt.setName('anti_spam').setDescription('Aktifkan/nonaktifkan anti-spam').setRequired(false))
    .addBooleanOption(opt => opt.setName('anti_link').setDescription('Aktifkan/nonaktifkan anti-link').setRequired(false))
    .addBooleanOption(opt => opt.setName('anti_mention').setDescription('Aktifkan/nonaktifkan anti-mention spam').setRequired(false))
    .addIntegerOption(opt => opt.setName('spam_threshold').setDescription('Jumlah pesan sebelum dianggap spam (default: 5)').setMinValue(2).setMaxValue(20))
    .addIntegerOption(opt => opt.setName('mention_threshold').setDescription('Jumlah mention sebelum dianggap spam (default: 5)').setMinValue(2).setMaxValue(20))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const antiSpam = interaction.options.getBoolean('anti_spam');
    const antiLink = interaction.options.getBoolean('anti_link');
    const antiMention = interaction.options.getBoolean('anti_mention');
    const spamThreshold = interaction.options.getInteger('spam_threshold');
    const mentionThreshold = interaction.options.getInteger('mention_threshold');

    const data = {};
    if (antiSpam !== null) data.anti_spam = antiSpam ? 1 : 0;
    if (antiLink !== null) data.anti_link = antiLink ? 1 : 0;
    if (antiMention !== null) data.anti_mention_spam = antiMention ? 1 : 0;
    if (spamThreshold) data.spam_threshold = spamThreshold;
    if (mentionThreshold) data.mention_threshold = mentionThreshold;

    if (Object.keys(data).length === 0) {
      return interaction.reply({ content: '❌ Masukkan minimal satu opsi.', ephemeral: true });
    }

    GuildConfig.setMultiple(interaction.guild.id, data);
    const config = GuildConfig.get(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('🛡️ Auto-Moderation Config')
      .addFields(
        { name: '🚫 Anti-Spam', value: config.anti_spam ? '✅ Aktif' : '❌ Nonaktif', inline: true },
        { name: '🔗 Anti-Link', value: config.anti_link ? '✅ Aktif' : '❌ Nonaktif', inline: true },
        { name: '💬 Anti-Mention Spam', value: config.anti_mention_spam ? '✅ Aktif' : '❌ Nonaktif', inline: true },
        { name: '📊 Spam Threshold', value: `${config.spam_threshold} pesan/5 detik`, inline: true },
        { name: '📊 Mention Threshold', value: `${config.mention_threshold} mentions`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
