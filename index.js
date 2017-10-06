const Discord = require(`discord.js`);
const client = new Discord.Client();

const fs = require(`fs`);
const dice = require(`./dice.js`);
const Commands = require(`./commands.js`);
const Channels = require(`./channels.js`);
const BotConfig = require(`./botConfig.js`);

var environment;

client.on(`ready`, () => {
  console.log(`Connected, preparing configuration...`);

  environment = new BotConfig.Environment(client.user.id);

  let sym = JSON.parse(fs.readFileSync(`dice.json`, `utf-8`)).symbols;
  let symbols = Object.keys(sym).filter(s => !sym[s].hidden).map(s => sym[s].emoji);

  client.guilds.forEach(guild => {
    environment.guilds[guild.id] = new BotConfig.Guild(guild, environment.userId, symbols);
  });

  console.log(environment.guilds);

  console.log(`Configuration complete, bot ready.`)
});

client.on(`guildMemberUpdate`, (o, n) => {
  console.log(`event: guildMemberUpdate`);
  console.log(o);
  console.log(n);
});

client.on(`channelUpdate`, (o, n) => {
  console.log(`event: channelUpdate`);
  if (n.type !== `text`) return; // We only care about text Channels. DMs are always allowed and Voice has no bot.

  let perms = n.permissionOverwrites.filter(p => p.allow === 3072 && p.type === `role`);
  if (perms.length > 0) {
    let allowed = perms.some(p => this.roles.some(r => r.id === p.id, this));
    if (!allowed && environment.guilds[n.guild.id].indexOf(n.id) > -1) {
      environment.guilds[n.guild.id].slice(environment.guilds[n.guild.id].indexOf(n.id), 1);
    }
  }

  console.log(environment.guilds[n.guild.id]);
});

client.on(`emojiUpdate`, (o, n) => {
  console.log(`event: emojiUpdate: ${o} -> ${n}`);
  environment.guilds[o.guild.id].emoji.forEach((v, k, m) => {
    if (v === o.toString()) {
      m.set(k, n.toString());
      console.log(`--Changed reference: ${k}`);
    }
  });
});

client.on(`message`, message => {
  if (message.author.bot) return;               // Don't respond to other bots (or yourself)
  if (!message.content.startsWith(`!`)) return; // Don't look at messages that don't start with a bang
  if (!environment.guilds[message.guild.id].allowedChannels.has(c => c === message.channel.id)) return; // Don't respond outside allowed Channels

  console.log(`---`);

  let [command, ...args] = message.content.substring(1).split(/\W+/);
  command = command.toLowerCase();
  console.log(`Command: ${command} | Args: ${args}`);

  Commands.forEach(function (c) {
    if (command === c.command) {
      c.process(environment, message, args);
    }
  });
});

console.log("--------------------------------------------------------------");

var auth = JSON.parse(fs.readFileSync(`auth.json`, `utf8`));
client.login(auth.token);
auth = {};

client.on(`channelCreate`, () => console.log(`event: channelCreate`));
client.on(`channelDelete`, () => console.log(`event: channelDelete`));
client.on(`channelPinsUpdate`, () => console.log(`event: channelPinsUpdate`));
client.on(`clientUserGuildSettingsUpdate`, () => console.log(`event: clientUserGuildSettingsUpdate`));
client.on(`clientUserSettingsUpdate`, () => console.log(`event: clientUserSettingsUpdate`));
client.on(`disconnect`, () => console.log(`event: disconnect`));
client.on(`emojiCreate`, () => console.log(`event: emojiCreate`));
client.on(`emojiDelete`, () => console.log(`event: emojiDelete`));
client.on(`error`, () => console.log(`event: error`));
client.on(`guildBanAdd`, () => console.log(`event: guildBanAdd`));
client.on(`guildBanRemove`, () => console.log(`event: guildBanRemove`));
client.on(`guildCreate`, () => console.log(`event: guildCreate`));
client.on(`guildDelete`, () => console.log(`event: guildDelete`));
client.on(`guildUnavailable`, () => console.log(`event: guildUnavailable`));
client.on(`guildUpdate`, () => console.log(`event: guildUpdate`));
client.on(`roleCreate`, () => console.log(`event: roleCreate`));
client.on(`roleDelete`, () => console.log(`event: roleDelete`));
client.on(`roleUpdate`, () => console.log(`event: roleUpdate`));
client.on(`userNoteUpdate`, () => console.log(`event: userNoteUpdate`));
client.on(`userUpdate`, () => console.log(`event: userUpdate`));
client.on(`warn`, () => console.log(`event: warn`));