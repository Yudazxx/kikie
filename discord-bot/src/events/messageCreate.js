const { handleAutoMod } = require('../handlers/automod');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    await handleAutoMod(message);
  }
};
