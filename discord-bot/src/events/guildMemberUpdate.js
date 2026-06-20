const { EmbedBuilder } = require('discord.js');
const { GuildConfig } = require('../database');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const wasBooster = oldMember.premiumSince;
    const isBooster = newMember.premiumSince;

    if (!wasBooster && isBooster) {
      await handleBoost(newMember);
    }
  }
};

async function handleBoost(member) {
  const config = GuildConfig.get(member.guild.id);
  if (!config.boost_channel) return;

  const channel = member.guild.channels.cache.get(config.boost_channel);
  if (!channel) return;

  const boostCount = member.guild.premiumSubscriptionCount || 0;

  const message = (config.boost_message || 'Thank you {mention_user} for boosting the server! 🚀')
    .replace(/{mention_user}/g, `${member}`)
    .replace(/{username}/g, member.user.username)
    .replace(/{server}/g, member.guild.name)
    .replace(/{boost_count}/g, boostCount);

  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  const color = hexRegex.test(config.boost_color) ? config.boost_color : '#FF73FA';

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('🚀 Server Boost!')
    .setDescription(message)
    .addFields({ name: '💎 Total Boosts', value: `${boostCount}`, inline: true })
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setTimestamp();

  if (config.boost_footer) embed.setFooter({ text: config.boost_footer });
  if (config.boost_image) {
    try { embed.setImage(config.boost_image); } catch {}
  }
  if (config.boost_thumbnail) {
    try { embed.setThumbnail(config.boost_thumbnail); } catch {}
  }

  await channel.send({ content: `${member}`, embeds: [embed] }).catch(console.error);
}
