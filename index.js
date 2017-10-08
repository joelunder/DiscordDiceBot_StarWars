const Discord = require(`discord.js`);
const client = new Discord.Client();

const fs = require(`fs`);
const Commands = require(`./scripts/commands.js`);
const Channels = require(`./scripts/channels.js`);
const BotConfig = require(`./scripts/bot-config.js`);

var environment;

client.on(`ready`, () => {
  console.log(`Connected, preparing configuration...`);

  environment = new BotConfig.Environment(client.user.id);

  client.guilds.forEach(guild => {
    environment.guilds.set(guild.id, new BotConfig.Guild(guild, environment.userId));
  });

  console.log(`Configuration complete, bot ready.`);
});

client.on(`guildMemberUpdate`, (o, n) => {
  if(o.user.id === environment.userId) {
    let changed = false;
    n.roles.filter(r => r.name !== `@everyone`).forEach(newRole => {
      if(!environment.guilds.get(n.guild.id).roles.has(newRole.id)) {
        console.log(`New role assigned: ${newRole.name} ${newRole.id}`);
        changed = true;
        environment.guilds.get(n.guild.id).roles.add(newRole.id);
      }
    });
    environment.guilds.get(n.guild.id).roles.forEach(oldRole => {
      if(!n.roles.some(newRole => newRole.id === oldRole)) {
        console.log(`Old role removed: ${oldRole}`);
        changed = true;
        environment.guilds.get(n.guild.id).roles.delete(oldRole);
      }
    });

    if(changed) {
      environment.guilds.get(n.guild.id).allowedChannels = Channels.getChannels(environment.guilds.get(n.guild.id).roles, n.guild.channels);
    }
  }
});

client.on(`channelUpdate`, (o, n) => {
  if (n.type !== `text`) return; // We only care about text Channels. DMs are always allowed and Voice has no bot.

  if(Channels.channelAllowed(n, environment.guilds.get(n.guild.id).roles)) {
    environment.guilds.get(n.guild.id).allowedChannels.add(n.id);
  } else {
    environment.guilds.get(n.guild.id).allowedChannels.delete(n.id);
  }
});

client.on(`channelCreate`, n => {
  if (n.type !== `text`) return; // We only care about text Channels. DMs are always allowed and Voice has no bot.
  
  if(Channels.channelAllowed(n, environment.guilds.get(n.guild.id).roles)) {
    environment.guilds.get(n.guild.id).allowedChannels.add(n.id);
  }
});

client.on(`channelDelete`, o => {
  environment.guilds.get(o.guild.id).allowedChannels.delete(o.id);
});

client.on(`emojiUpdate`, (o, n) => {
  console.log(`event: emojiUpdate`);
  environment.guilds.get(o.guild.id).updateEmoji(o, n);
});

client.on(`emojiCreate`, n => {
  console.log(`event: emojiCreate`);
  environment.guilds.get(n.guild.id).checkEmoji(n);
});

client.on(`emojiDelete`, o => {
  console.log(`event: emojiDelete`);
  environment.guilds.get(o.guild.id).removeEmoji(o);
});

client.on(`message`, message => {
  if (message.author.bot) return;               // Don't respond to other bots (or yourself)
  if (!message.content.startsWith(`!`)) return; // Don't look at messages that don't start with a bang
  if (!environment.guilds.get(message.guild.id).allowedChannels.has(message.channel.id)) return; // Don't respond outside allowed Channels

  console.log(`---`);

  let [command, ...args] = message.content.split(/\s+/);
  command = command.slice(1).toLowerCase();
  console.log(`Command: ${command} | Args: ${args}`);

  Commands.forEach(function (c) {
    if (command === c.command) {
      c.process(environment, message, args);
    }
  });
});

client.on(`error`, error => {
  console.log(`event: error`);
  console.log(error);
});
client.on(`warn`, warn => {
  console.log(`event: warn`);
  console.log(warn);
});

console.log("--------------------------------------------------------------");

var auth = JSON.parse(fs.readFileSync(`auth.json`, `utf8`));
client.login(auth.token);
auth = {};

client.on(`clientUserGuildSettingsUpdate`, () => console.log(`event: clientUserGuildSettingsUpdate`));
client.on(`clientUserSettingsUpdate`, () => console.log(`event: clientUserSettingsUpdate`));
client.on(`disconnect`, () => console.log(`event: disconnect`));
client.on(`guildBanAdd`, () => console.log(`event: guildBanAdd`));
client.on(`guildBanRemove`, () => console.log(`event: guildBanRemove`));
client.on(`guildCreate`, () => console.log(`event: guildCreate`));
client.on(`guildDelete`, () => console.log(`event: guildDelete`));
client.on(`guildUnavailable`, () => console.log(`event: guildUnavailable`));
client.on(`guildUpdate`, () => console.log(`event: guildUpdate`));
client.on(`roleCreate`, () => console.log(`event: roleCreate`));
client.on(`roleUpdate`, () => console.log(`event: roleUpdate`));
client.on(`userNoteUpdate`, () => console.log(`event: userNoteUpdate`));
client.on(`userUpdate`, () => console.log(`event: userUpdate`));