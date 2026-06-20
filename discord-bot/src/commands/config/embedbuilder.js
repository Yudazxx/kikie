const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('GUI Editor untuk membuat embed kustom')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎨 GUI Embed Builder')
      .setDescription('Gunakan tombol di bawah untuk mengatur embed kustom kamu.')
      .addFields(
        { name: 'Title', value: '*(belum diatur)*', inline: true },
        { name: 'Description', value: '*(belum diatur)*', inline: true },
        { name: 'Color', value: '#5865F2', inline: true }
      )
      .setFooter({ text: 'Klik tombol untuk mengedit bagian embed' });

    const state = {
      title: '',
      description: '',
      color: '#5865F2',
      footer: '',
      image: '',
      thumbnail: '',
      author: ''
    };

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('eb_title').setLabel('📝 Title').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_description').setLabel('📄 Description').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_color').setLabel('🎨 Color').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('eb_footer').setLabel('📌 Footer').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('eb_image').setLabel('🖼️ Image URL').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('eb_thumbnail').setLabel('🖼️ Thumbnail').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('eb_send').setLabel('📤 Kirim Embed').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('eb_preview').setLabel('👁️ Preview').setStyle(ButtonStyle.Secondary)
    );

    const reply = await interaction.reply({ embeds: [embed], components: [row1, row2], fetchReply: true });

    const collector = reply.createMessageComponentCollector({ time: 300_000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ Hanya pembuat embed yang bisa menggunakannya.', ephemeral: true });
      }

      if (i.customId === 'eb_send') {
        if (!state.title && !state.description) {
          return i.reply({ content: '❌ Tambahkan minimal title atau description!', ephemeral: true });
        }
        const finalEmbed = buildEmbed(state);
        await interaction.channel.send({ embeds: [finalEmbed] });
        return i.reply({ content: '✅ Embed berhasil dikirim!', ephemeral: true });
      }

      if (i.customId === 'eb_preview') {
        const previewEmbed = buildEmbed(state);
        return i.reply({ content: '👁️ **Preview:**', embeds: [previewEmbed], ephemeral: true });
      }

      const modal = buildModal(i.customId, state);
      await i.showModal(modal);

      try {
        const modalInteraction = await i.awaitModalSubmit({ time: 120_000, filter: m => m.user.id === interaction.user.id });
        const fieldName = i.customId.replace('eb_', '');
        state[fieldName] = modalInteraction.fields.getTextInputValue('value').trim();

        const updatedEmbed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🎨 GUI Embed Builder')
          .setDescription('Embed kamu sejauh ini:')
          .addFields(
            { name: 'Title', value: state.title || '*(belum diatur)*', inline: true },
            { name: 'Color', value: state.color || '#5865F2', inline: true },
            { name: 'Footer', value: state.footer || '*(belum diatur)*', inline: true },
            { name: 'Description', value: state.description || '*(belum diatur)*' }
          )
          .setFooter({ text: 'Klik tombol untuk mengedit' });

        await modalInteraction.update({ embeds: [updatedEmbed], components: [row1, row2] });
      } catch {}
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] }).catch(() => {});
    });
  }
};

function buildEmbed(state) {
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  const color = hexRegex.test(state.color) ? state.color : '#5865F2';

  const e = new EmbedBuilder().setColor(color);
  if (state.title) e.setTitle(state.title);
  if (state.description) e.setDescription(state.description);
  if (state.footer) e.setFooter({ text: state.footer });
  if (state.author) e.setAuthor({ name: state.author });
  try { if (state.image) e.setImage(state.image); } catch {}
  try { if (state.thumbnail) e.setThumbnail(state.thumbnail); } catch {}
  e.setTimestamp();
  return e;
}

function buildModal(customId, state) {
  const fieldName = customId.replace('eb_', '');
  const labels = {
    title: 'Title Embed',
    description: 'Description Embed',
    color: 'Warna (Hex, contoh: #FF0000)',
    footer: 'Footer Text',
    image: 'URL Gambar (Image)',
    thumbnail: 'URL Thumbnail'
  };

  const modal = new ModalBuilder()
    .setCustomId(`modal_${customId}`)
    .setTitle(labels[fieldName] || fieldName);

  const input = new TextInputBuilder()
    .setCustomId('value')
    .setLabel(labels[fieldName] || fieldName)
    .setStyle(fieldName === 'description' ? TextInputStyle.Paragraph : TextInputStyle.Short)
    .setRequired(false)
    .setValue(state[fieldName] || '');

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}
