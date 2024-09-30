const { OWNERS } = require('../src/Constants.js');

module.exports = {
  name: 'messageCreate',
  execute(message, client) {
    if (message.author.bot || !message.guild) return;
    if (message.channel.id === '1266394847728766976' && !(message.content.toLowerCase().startsWith('c') || message.content.toLowerCase().startsWith('#credit'))) return message.delete().catch(() => {});
    if (!message.content.startsWith(client.prefix)) return;
    
    const args = message.content.slice(client.prefix.length).trim().replaceAll('\n', ' ').split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    if (command.owners && !OWNERS.includes(message.author.id)) return;
    
    try {
      command.execute(message, args, client);
    } catch (e) {
      console.error(e);
    } 
  },
};