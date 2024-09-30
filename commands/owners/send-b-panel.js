const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 

module.exports = {
  name: 'send-b-panel',
  owners: true,
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setTitle('شراء رصيد')
    .setImage("https://media.discordapp.net/attachments/1164323309526196327/1165382982387900609/20231021_230401.jpg?ex=6546a67a&is=6534317a&hm=be393896984d8ac8375c869ae6818ce0a97f8da375b1c239a2d2855f9d77a821&")
      .setDescription('**يمكنك شراء رصيد عن طريق الضغط على الزر**')
      .setTimestamp();
    
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder() 
      .setStyle(ButtonStyle.Secondary)
      .setCustomId('buy-balance')
      .setEmoji("<:pp393:1028740537215365150>")
      .setLabel('شراء رصيد'))
    
    message.channel.send({ embeds: [embed], components: [row] });
    message.delete();
  },
};
