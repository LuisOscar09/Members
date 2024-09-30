const { Client, IntentsBitField, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { MIN_MEMBERS, BALANCE_PRICE, RECIPIENT_ID, TRANSACTIONS_CHANNEL, PROBOT_IDS, CLIENTS_ROLE, SUPERCLIENTS_ROLE, BALANCE_LOG, DONE_CHANNEL } = require('../src/Constants.js');
const cooldowns = new Map();
const mCooldowns = new Map();
const m2Cooldowns = new Map();
const usersData = require('../src/models/Users.js');
const client = new Client({ 
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
  ]
});
module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isButton()) {
      if (interaction.customId === 'buy-balance') {
        if (cooldowns.has(interaction.user.id)) {
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('cancel-buy')
            .setStyle(ButtonStyle.Danger)
            .setLabel('إنهاء عملية الشراء'));

          interaction.reply({
            content: '> `-` **عذراً ، هناك عملية شراء لم يتم أكمالها !**',
            components: [row],
            ephemeral: true,
          });
        } else {
          if (m2Cooldowns.has(interaction.user.id)) return interaction.reply({
            content: '> `-` **يرجى الإنتظار حتى إنتهاء العملية الحاليا !**',
            ephemeral: true
          });

          const modal = new ModalBuilder()
            .setCustomId('balance-modal')
            .setTitle('Buy Balance');

          const amount = new TextInputBuilder()
            .setCustomId('amount')
            .setMinLength(1)
            .setPlaceholder('Ex: 100')
            .setStyle(TextInputStyle.Short)
            .setLabel('الـكـمـيـة');

          const row = new ActionRowBuilder().addComponents(amount);

          modal.addComponents(row);
          interaction.showModal(modal);
        }
      }

      if (interaction.customId === 'cancel-buy' && cooldowns.has(interaction.user.id)) {
        await cooldowns.delete(interaction.user.id);

        interaction.reply({
          content: '> `-` **تم بنجاح! إنهاء عملية الشراء**',
          ephemeral: true
        });
      }

      if (interaction.customId === 'my-coins') {
        const userData1 = await usersData.findOne({ id: interaction.user.id }) || new usersData({ id: interaction.user.id });
        const embed = new EmbedBuilder()
        .setColor('#1a1a1a')
        .setTitle(`**رصـيـدك الـحـالـي هـو : ${userData1.balance}**`)
    
        interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      }

      if (interaction.customId === 'withdraw-m-balance' && !mCooldowns.has(interaction.user.id)) {
        if (cooldowns.has(interaction.user.id)) {
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
            .setCustomId('cancel-buy')
            .setStyle(ButtonStyle.Danger)
            .setLabel('إنهاء عملية الشراء'));

          interaction.reply({
            content: '> `-` **عذراً ، هناك عملية شراء لم يتم أكمالها !**',
            components: [row],
            ephemeral: true,
          });
        } else {
          if (m2Cooldowns.has(interaction.user.id)) return interaction.reply({
            content: '> `-` **يرجى الإنتظار حتى إنتهاء العملية الحاليا !**',
            ephemeral: true
          });

          const modal = new ModalBuilder()
            .setCustomId('members-modal')
            .setTitle('Buy Members');

          const amount = new TextInputBuilder()
            .setCustomId('amount')
            .setMinLength(1)
            .setPlaceholder('Ex: 50')
            .setStyle(TextInputStyle.Short)
            .setLabel('الـكـمـيـة');

          const id = new TextInputBuilder()
            .setCustomId('id')
            .setMinLength(1)
            .setPlaceholder('Ex: 1151650671884517447')
            .setStyle(TextInputStyle.Short)
            .setLabel('معرف الخادم (Server ID)');

          const row = new ActionRowBuilder().addComponents(amount);
          const row1 = new ActionRowBuilder().addComponents(id);

          modal.addComponents(row, row1);
          interaction.showModal(modal);
        }

      }
      if (interaction.customId === 'cancel-m' && mCooldowns.get(interaction.user.id)?.messageId === interaction.message.id) {
        await mCooldowns.delete(interaction.user.id);

        interaction.reply({
          content: '> `-` **تم إلغاء العملية بنجاح!**',
          ephemeral: true
        });
      }

if (
  interaction.customId.startsWith('join') &&
  mCooldowns.has(interaction.user.id) &&
  mCooldowns.get(interaction.user.id)?.messageId === interaction.message.id
) {
  const cooldownData = mCooldowns.get(interaction.user.id);

  if (!cooldownData || !cooldownData.members) {
    return interaction.reply({
      content: '> `-` **حدث خطأ: لم يتم العثور على البيانات المطلوبة.**',
      ephemeral: true,
    });
  }

  const members = cooldownData.members;
  mCooldowns.delete(interaction.user.id);

  let done = 0,
    failed = 0;

  const userData = await client.db.users.patch(interaction.user.id);
  const [, ID, COUNT] = interaction.customId.split('-');
  const guild = client.guilds.cache.get(ID);

  if (!guild) {
    return interaction.reply({
      content: '> `-` **يجب إدخال البوت إلى هذا الخادم أولاً !**',
      ephemeral: true,
    });
  }

  const msg = await interaction.reply({
    content: '> `-` **جـاري الإدخـال ..**',
    ephemeral: true,
  });

  userData.balance -= +COUNT;
  await userData.save();

  await m2Cooldowns.set(interaction.user.id);
  const notInGuildMembers = members.filter(member => !guild.members.cache.has(member.id));

  for (const member of notInGuildMembers) {
    const userId = member.id;
    const accessToken = member.accessToken;

    try {
      await guild.members.add(userId, {
        accessToken,
      });
      done++;
    } catch {
      failed++;
    }
  }


  m2Cooldowns.delete(interaction.user.id);

  if (COUNT - done > 0) { 
    const unusedBalance = COUNT - done;
    const refundAmount = unusedBalance * 0.7;
    userData.balance += refundAmount;
    await userData.save();
  }

  if (done > 0) {

    await msg.edit(`> \`-\` **تم بنجاح! إدخال \`${done}\` عضو ✔️**\n> \`-\` **لم أستطيع أدخال \`${failed}\` ❌ .**`);

    const doneChannel = client.channels.cache.get(DONE_CHANNEL);

    if (doneChannel) {
      const channel = guild.channels.cache.find(
          (ch) => ch.isTextBased() && ch.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.CreateInstantInvite)
      );

      if (channel) {
        const invite = await guild.invites.create(channel); // استخدم أي قناة متاحة لإنشاء رابط دعوة
        const embed = new EmbedBuilder()
          .setColor('#1a1a1a')
          .setDescription(`> \`-\` **تم شراء \`${done}\` عضو بواسطة : ${interaction.user}**\n> \`-\` **رابط السيرفر: ${invite.url}**\n> \`-\` **اسم السيرفر: ${guild.name}**`)
          .setTimestamp();

        await doneChannel.send({
          content: `${invite.url}`,
          embeds: [embed],
        });
      } else {
        await doneChannel.send('> `-` **لم يتم العثور على قناة لإنشاء دعوة.**');
      }
    }
  } else {
    await msg.edit(`> \`-\` **عذراً ، جميع الاعضاء موجودين في الخادم بالفعل ، لا يمكن أضافة المزيد!**`);
  }
}
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'balance-modal') {
        let ended = false;

        const amount = +interaction.fields.getTextInputValue('amount');

        if (!amount.isNumber()) return interaction.reply({
          content: '✖️ **هذا العدد غير صحيح!**',
          ephemeral: true
        });

        const price = Math.floor(amount * BALANCE_PRICE);
        const fullPrice = price === 1 ? 1 : Math.ceil(price / 0.95);

        const channel = client.channels.cache.get(TRANSACTIONS_CHANNEL);
        const embed = new EmbedBuilder()
          .setColor('#1a1a1a')
          .setTitle('الرجاء التحويل لإكمال عملية الشراء')
          //.setDescription(`\`\`\`#credit ${RECIPIENT_ID} ${fullPrice}\`\`\`\n**لديك 5 دقائق فقط لإكمال عملية التحويل\nالتحويل يكون في روم ${channel}**`)
          .setDescription(`\`\`\`#credit ${RECIPIENT_ID} ${fullPrice}\`\`\``)
          .addFields({ name: 'لديك 5 دقائق فقط لإكمال عملية التحويل', value: `التحويل يكون في روم ${channel}` })
          .setTimestamp();
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('cancel-buy')
            .setStyle(ButtonStyle.Danger)
            .setLabel('إنهاء عملية الشراء'));

        const mention = await channel.send(`${interaction.user}`);
        setTimeout(() => mention.delete(), 2000);

     // try {
        const msg = await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true
        });


        await cooldowns.set(interaction.user.id, {
          messageId: msg.id
        });
        const filter = message => PROBOT_IDS.includes(message.author.id) && message.content.includes(`${price}`) & message.content.includes(`${RECIPIENT_ID}`) && message.content.includes(`${interaction.user.username}`);
        const pay = await channel.createMessageCollector({
          filter,
          max: 1,
          time: 3e5
        });

        pay.once('collect', async (message) => {
          if (cooldowns.get(interaction.user.id)?.messageId !== msg.id) return;

          ended = true;
          const userData = await client.db.users.patch(interaction.user.id);

          userData.balance += amount;
          await userData.save();

          let embed = new EmbedBuilder()
            .setTitle('تم شراء الرصيد بنجاح !')
            .setDescription(`**تم شراء رصيد بنجاح رصيدك الحالي هو : \`${userData.balance}\`**`)
            .setTimestamp();

          msg.edit({
            embeds: [embed],
            components: []
          });


          message.channel.send({
            content: `${interaction.user}`,
            embeds: [embed]
          }).then(sentMessage => {
                  setTimeout(() => {
                    sentMessage.delete().catch(console.error);
                }, 5000); // 5000 ميلي ثانية = 5 ثوانٍ
          });

          const member = message.guild.members.cache.get(interaction.user.id);
          const clientsRole = message.guild.roles.cache.get('1266476879557431336');
          const superClientsRole = message.guild.roles.cache.get('1276560324010573936');

          if (userData.balance < 300) {
            member.roles.add(clientsRole);
          }
          if (userData.balance >= 300) {
            member.roles.add(superClientsRole);
          }
        });

        pay.once('end', () => {
          if (cooldowns.get(interaction.user.id)?.messageId !== msg.id) return;

          cooldowns.delete(interaction.user.id);

          if (!ended) {

            msg.edit({
              content: '> `-` **لقد انتهى وقت التحويل !**'
            });
          }
        });
      }
    }

    if (interaction.customId === 'members-modal') {
      const users = await client.db.users.Schema.find({
        accessToken: {
          $exists: true
        }
      });

      const amount = interaction.fields.getTextInputValue('amount').toLowerCase() === 'all' ? users.length : +interaction.fields.getTextInputValue('amount');
      const guildID = interaction.fields.getTextInputValue('id');
      const guild = client.guilds.cache.get(guildID);

      if (!amount.isNumber()) return interaction.reply({
        content: '> `-` **هذا العدد غير صحيح!**',
        ephemeral: true
      });

      const userData = await client.db.users.patch(interaction.user.id);

      if (amount > users.length) return interaction.reply({
        content: `> \`-\` **هذا العدد غير متوفر! المتوفر الان ${users.length}**`,
        ephemeral: true
      });

      if (!guild) return interaction.reply({
        content: '> `-` **يجب أولا إدخال البوت الي هذا الخادم!**',
        ephemeral: true
      });

      if (amount < MIN_MEMBERS) return interaction.reply({
        content: `> \`-\` **عذرا ولكن أقل عدد للشراء هو ${MIN_MEMBERS} عضو!**`,
        ephemeral: true
      });

      await interaction.deferReply({
        ephemeral: true
      });
      await guild.members.fetch();
      const usersToFilter = users.splice(users.length - amount, amount).reverse();

      const filteredUsers = usersToFilter.filter((user) => !guild.members.cache.get(user.id));
      const membersToAdd = amount - (amount - filteredUsers.length);

      if (membersToAdd > userData.balance) return interaction.editReply({
        content: '> `-` **ليس لديك رصيد كافي!**',
      });

      if (membersToAdd === 0) return interaction.editReply({
        content: `> \`-\` **عذراً ، جميع الاعضاء موجودين في الخادم بالفعل ، لا يمكن أضافة المزيد!**`,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`join-${guild.id}-${membersToAdd}`)
          .setStyle(ButtonStyle.Success)
          .setLabel('إدخال'),
        new ButtonBuilder()
          .setCustomId('cancel-m')
          .setStyle(ButtonStyle.Danger)
          .setLabel('إلغاء'));
 
      const msg = await interaction.editReply({
        content: `${guild.name}\n\n**تم إيجاد ${amount - filteredUsers.length} عضو في الخادم من قبل**\nهل انت متأكد ان تريد إدخال ${membersToAdd} عضو؟`,
        components: [row]
      });

      mCooldowns.set(interaction.user.id, {
        messageId: msg.id,
        members: filteredUsers
      });

      setTimeout(() => {
        mCooldowns.delete(interaction.user.id);
      }, 3e5);
    }
  },
};