const usersData = require('../../src/models/Users.js');

module.exports = {
  name: 'join',
  owners: true,
  async execute(message, args, client) {
    let done = 0;
    let failed = 0;
    let already = 0;
    const users = await usersData.find();
    const guildId = args[0];
    const guild = client.guilds.cache.get(guildId);
    const count = args[1]?.toLowerCase() === 'all' ? users.length : +args[1];
    
    if (!guildId) return message.lineReplyNoMention('❌ **يجب أن تحدد معرف الخادم!**');
    if (!guild) return message.lineReplyNoMention('❌ **يجب أن يكون البوت داخل هذا الخادم!**');
    
    if (!count) return message.lineReplyNoMention('❌ **يجب أن تحدد العدد او all**');
    if (!count.isNumber()) return message.lineReplyNoMention('❌ **يجب أن تحدد عدد صحيح!**');
    if (count > users.length) return message.lineReplyNoMention(`❌ **هذا العدد غير متوفر! المتوفر الان ${users.length}**`);
    
    const msg = await message.channel.send('**جاري الإدخال ..**');
    
    for (let i=count - 1;i>=0;i--) {
      const userId = users[i].id;
      const accessToken = users[i].accessToken;
      const members = guild.members;
      
      if (members.cache.get(userId)) {
        already++;
        continue;
      }
      try {
        await members.add(userId, {
          accessToken
        });
        done++;
      } catch {
        failed++;
      } 
    }
    
    msg.edit(`**‼️ تم طلب ${count}\n✅ تم إدخال ${done}\n❌ فشل إدخال ${failed}\n❌ موجود بالفعل ${already}**`);
  },
};