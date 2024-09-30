const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 
const { BOT_URL } = require('../../src/Constants.js');
const usersData = require('../../src/models/Users.js');

module.exports = {
  name: 'panel',
  owners: true,
  async execute(message, args, client) {
    const usersCount = await usersData.countDocuments({ accessToken: { $exists: true } });

    const embed = new EmbedBuilder()
      .setTitle('شـراء الأعـضـاء :')
      .setColor('#1a1a1a')
      .setImage("https://media.discordapp.net/attachments/944620604026408971/949576383896641566/LH_INFO7.png?ex=66c8e9ac&is=66c7982c&hm=403d87b3d2ab96ec556b24125e30f781145da7b2fdf144183a8b9ec5e5b16eba&=&format=webp&quality=lossless&width=750&height=231")
      .setDescription(`**عدد الأعضاء الحقيقيين في البوت هو  :  \`${usersCount}\` .**`)
    
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder() 
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('withdraw-m-balance')
        .setEmoji("👥")
        .setLabel('أدخَالُ الأعضَاء'), 
      new ButtonBuilder()
        .setStyle (ButtonStyle.Secondary)
        .setCustomId("buy-balance")
        .setEmoji("💰")
        .setLabel('شِراءْ عمُلات'),
      new ButtonBuilder()
        .setStyle (ButtonStyle.Secondary)
        .setCustomId("my-coins")
        .setEmoji("🪙")
        .setLabel('عُملاتي'),
      new ButtonBuilder() 
        .setStyle(ButtonStyle.Link)
        .setURL(BOT_URL)
        .setEmoji("🌐")
        .setLabel('إدخَالُ البُوت'));
        
    message.channel.send({ embeds: [embed], components: [row] });
    message.delete();
  },
};
