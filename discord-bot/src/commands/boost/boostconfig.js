const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boostconfig')
    .setDescription('Konfigurasi tampilan embed boost')
    .addStringOption(opt => opt.setName('color').setDescription('Warna embed (hex, contoh: #FF73FA)').setRequired(false))
    .addStringOption(opt => opt.setName('footer').setDescription('Teks footer embed').setRequired(false))
    .addStringOption(opt => opt.setName('image').setDescription('URL gambar embed').setRequired(false))
    .addStringOption(opt => opt.setName('thumbnail').setDescription('URL thumbnail embed').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const color = interaction.options.getString('color');
    const footer = interaction.options.getString('footer');
    const image = interaction.options.getString('image');
    const thumbnail = interaction.options.getString('thumbnail');

    if (!color && !footer && !image && !thumbnail) {
      return interaction.reply({ content: '❌ Masukkan minimal satu opsi konfigurasi.', ephemeral: true });
    }

    const data = {};
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;

    if (color) {
      if (!hexRegex.test(color)) return interaction.reply({ content: '❌ Format warna tidak valid. Gunakan hex seperti #FF73FA', ephemeral: true });
      data.boost_color = color;
    }
    if (footer) data.boost_footer = footer;
    if (image) data.boost_image = image;
    if (thumbnail) data.boost_thumbnail = thumbnail;

    GuildConfig.setMultiple(interaction.guild.id, data);
    const config = GuildConfig.get(interaction.guild.id);

    const previewEmbed = new EmbedBuilder()
      .setColor(config.boost_color || '#FF73FA')
      .setTitle('🚀 Preview Boost Embed')
      .setDescription(config.boost_message || 'Terima kasih sudah boost server!')
      .setTimestamp();

    if (config.boost_footer) previewEmbed.setFooter({ text: config.boost_footer });
    if (config.boost_image) previewEmbed.setImage(config.boost_image).catch(() => {});
    if (config.boost_thumbnail) previewEmbed.setThumbnail(config.boost_thumbnail).catch(() => {});

    await interaction.reply({
      content: '✅ Konfigurasi boost berhasil diperbarui! Berikut preview:',
      embeds: [previewEmbed]
    });
  }
};
