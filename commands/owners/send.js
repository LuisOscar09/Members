const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { AUTH_URL } = require('../../src/Constants.js');

module.exports = {
  name: 'send',
  owners: true, 
  execute(message, args, client) {
     const row = new ActionRowBuilder().addComponents(
       new ButtonBuilder()
       .setStyle(ButtonStyle.Link)
       .setLabel('اثــبــت نــفــســك ✅')
       .setURL(AUTH_URL));
    message.channel.send({ components: [row] });
  },
};