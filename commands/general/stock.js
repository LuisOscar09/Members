const usersData = require('../../src/models/Users.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'stock',
  async execute(message, args, client) {
    const usersCount = await usersData.countDocuments({ accessToken: { $exists: true } });
    const embed = new EmbedBuilder()
      .setColor('#1a1a1a')
      .setImage("https://media.discordapp.net/attachments/944620604026408971/949576383896641566/LH_INFO7.png?ex=66c8e9ac&is=66c7982c&hm=403d87b3d2ab96ec556b24125e30f781145da7b2fdf144183a8b9ec5e5b16eba&=&format=webp&quality=lossless&width=750&height=231")
      .setTitle(`عـدد الأعـضـاء الـحـالـيـيـن هـو : ${usersCount}`) 
      .setTimestamp();
    
    message.channel.send({ embeds: [embed] });
  },
};