module.exports = {
  name: 'remove',
  owners: true,
  async execute(message, args, client) {
    const userId = args[0]?.toId();
    const amount = +args[1];
    
    if (!userId) return message.lineReplyNoMention('❌ **يرجى تحديد المستخدم!**');
    if (!amount) return message.lineReplyNoMention('❌ **يرجي تحديد العدد!**');
    if (!amount.isNumber()) return message.lineReplyNoMention('❌ **هذا العدد غير صحيح!**');
  
    const user = client.users.cache.get(userId);
    if (!user) return message.lineReplyNoMention('❌ **لا يمكنني العثور على هذا المستخدم!**');
    if (user.bot) return message.lineReplyNoMention('❌ **لا يمكن الإضافة إلى البوتات!**');
  
    const userData = await client.db.users.patch(user.id);
   
    if (amount > userData.balance) return message.lineReplyNoMention('❌ **لا يمكن خصم عدد اكبر من رصيده!**');
    
    userData.balance -= amount;
    await userData.save();
  
    message.channel.send(`✅ **تم بنجاح! خصم \`${amount}\` من ${user}\nرصيده الان هو \`${userData.balance}\`**`);
  },
};