const usersData = require('../../src/models/Users.js');
const axios = require('axios');

module.exports = {
  name: 'check',
  owners: true,
  async execute(message, args, client) {
    if (!args[0]) {
      let done = 0;
      let failed = 0;
      const msg = await message.lineReplyNoMention('**جاري الفحص ..**');
      const users = await usersData.find({ accessToken: { $exists: true } });
      
      for (const userData of users) {
        try {
          await axios.get('https://discord.com/api/users/@me', {
            headers: {
              Authorization: `Bearer ${userData.accessToken}`
            }
          });
          done++;
        } catch {
          failed++;
        }       
      }      
      
      msg.edit(`**✅ ${done}\n❌ ${failed}**`);

    } else {
      const userData = await usersData.findOne({
        id: args[0].toId()
      });

      if (userData) {
        try {
          await axios.get('https://discord.com/api/users/@me', {
            headers: {
              Authorization: `Bearer ${userData.accessToken}`
            }
          });

          return message.lineReplyNoMention('✅');
        } catch {
          return message.lineReplyNoMention('❌');
        }

      } else {
        return message.lineReplyNoMention('❌');
      }
    }
  },
};