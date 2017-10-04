const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const dice = require('./dice.js');
const commands = require('./commands.js');
const channels = require('./channels.js');

var environment = {
  "emojis": { },
  "allowedChannels": [ ]
};
var allowedChannels = [ ];

client.on('ready', () => {
  console.log('Connected!');

  client.emojis.forEach(function(emoji) {
    environment.emojis[emoji.name] = `<:${emoji.name}:${emoji.id}>`;
  });

  environment.user = client.user;
});


client.on('message', message => {
  if (message.author.bot) return;               // Don't respond to other bots (or yourself)
  if (!message.content.startsWith('!')) return; // Don't look at messages that don't start with a bang
  
  console.log('---');
  environment.message = message;

  if (environment.allowedChannels.length === 0) {           // Fill the list of allowed channels if it's empty
    channels.setAllowedChannels(environment);
  }
  if (!environment.allowedChannels.some(c => c === message.channel.id)) { // Don't respond outside allowed channels
    return;
  }

  var [command, ...args] = message.content.substring(1).split(/\W+/);
  command = command.toLowerCase();

  console.log(command);
  console.log(args);
/*
  if (command === 'ping') {
    message.reply('pong' + (args.length > 0 ? args : ''));
  }

  if (command === 'roll') {
    var diceSet = args.shift();
    var title = args.join(' ');
    var msg = title.length > 0 ? title + ': ' : '';
    msg += dice(diceSet, emojis);
    message.reply(msg);
  }

  if (command === 'channels') {
    setAllowedChannels(message);
    var channelInfo = message.guild.channels.filter(c => allowedChannels.some(ac => ac === c.id)).map(c => `#${c.name}`);
    message.channel.send("Allowed Channels:\n" + channelInfo.join('\n'));
  }
*/
  commands.forEach(function(c) {
    if(command === c.command) {
      environment.message = message;
      c.process(environment, args);
    }
  });

  environment.message = { };
});

var auth = JSON.parse(fs.readFileSync('auth.json', 'utf8'));
client.login(auth.token);