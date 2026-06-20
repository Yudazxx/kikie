const { SpamTracker, Warnings, GuildConfig } = require('../database');

const URL_REGEX = /(https?:\/\/|discord\.gg\/|discord\.com\/invite\/)[^\s]+/gi;
const INVITE_REGEX = /(discord\.gg\/|discord\.com\/invite\/)[^\s]+/gi;

async function handleAutoMod(message) {
  if (!message.guild || message.author.bot) return false;

  const member = message.member;
  if (!member) return false;

  if (member.permissions.has('ManageMessages') || member.permissions.has('Administrator')) return false;

  const config = GuildConfig.get(message.guild.id);

  if (config.anti_spam) {
    const isSpam = await checkSpam(message, config);
    if (isSpam) return true;
  }

  if (config.anti_link) {
    const hasLink = checkLinks(message, config);
    if (hasLink) return true;
  }

  if (config.anti_mention_spam) {
    const isMentionSpam = await checkMentionSpam(message, config);
    if (isMentionSpam) return true;
  }

  return false;
}

async function checkSpam(message, config) {
  const guildId = message.guild.id;
  const userId = message.author.id;
  const now = Date.now();
  const threshold = config.spam_threshold || 5;
  const interval = config.spam_interval || 5000;

  const record = SpamTracker.get(guildId, userId);

  if (record && now - record.last_message_time < interval) {
    const newCount = record.message_count + 1;
    SpamTracker.update(guildId, userId, newCount, now);

    if (newCount >= threshold) {
      SpamTracker.reset(guildId, userId);
      try {
        await message.delete().catch(() => {});
        const warn = Warnings.add(guildId, userId, message.client.user.id, 'Auto-Moderation: Spam detected');
        await message.channel.send({
          content: `⚠️ ${message.author}, kamu telah di-warn karena spam! (${Warnings.count(guildId, userId)} warnings)`
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

        try {
          await message.member.timeout(60_000, 'Auto-Mod: Spam');
        } catch {}
        return true;
      } catch {}
    }
  } else {
    SpamTracker.update(guildId, userId, 1, now);
  }
  return false;
}

function checkLinks(message, config) {
  if (URL_REGEX.test(message.content) || INVITE_REGEX.test(message.content)) {
    message.delete().catch(() => {});
    message.channel.send({
      content: `🔗 ${message.author}, link tidak diizinkan di server ini!`
    }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    return true;
  }
  return false;
}

async function checkMentionSpam(message, config) {
  const threshold = config.mention_threshold || 5;
  const mentionCount = message.mentions.users.size + message.mentions.roles.size;

  if (mentionCount >= threshold) {
    try {
      await message.delete().catch(() => {});
      Warnings.add(message.guild.id, message.author.id, message.client.user.id, 'Auto-Moderation: Mention spam');
      await message.channel.send({
        content: `⚠️ ${message.author}, kamu di-warn karena mention spam! (${Warnings.count(message.guild.id, message.author.id)} warnings)`
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

      try {
        await message.member.timeout(120_000, 'Auto-Mod: Mention Spam');
      } catch {}
      return true;
    } catch {}
  }
  return false;
}

module.exports = { handleAutoMod };
