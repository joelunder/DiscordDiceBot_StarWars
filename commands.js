const dice = require('./dice.js');
const channels = require('./channels.js');
const criticals = require('./criticals.js');

const fs = require('fs');
const tables = JSON.parse(fs.readFileSync('misctables.json', 'utf8'));

const commands = [
  {
    "command": "help",
    "process": function (environment, args) {
      if (args.length === 0) {
        environment.message.channel.send("This is a bot that will help automate some of the fiddly bits of running a game in FFG's Star Wars RPG games. Use !commands to get a list of commands.");
      } else {
        var helpCommand = args.shift().toLowerCase();
        var foundCommand = commands.find(c => c.command === helpCommand)
        if (foundCommand) {
          environment.message.channel.send(foundCommand.help);
        } else {
          environment.message.channel.send(`Command not found: ${helpCommand}`)
        }
      }
    },
    help: "Are you serious?"
  },
  {
    "command": "commands",
    "process": function (environment, args) {
      var commandNames = commands.map(c => `+ ${c.command}`);
      environment.message.channel.send(`available commands:
${commandNames.join('\n')}
For help with a specific command, type !help <command>`);
    },
    "help": "List all commands available."
  },
  {
    "command": "roll",
    "process": function (environment, args) {
      var diceSet = args.shift();
      var title = args.join(' ');
      var msg = title.length > 0 ? title + ':\n' : '';
      msg += dice(diceSet, environment.emojis);
      environment.message.reply(msg);
    },
    "help": `Roll a number of FFG Star Wars dice and calculate the results.
Dice abbreviations:
+ B - Boost
+ A - Ability
+ P - Proficiency
+ S - Setback
+ D - Difficulty
+ C - Challenge
+ F - Force

Combine the number of dice and the abbreviation for their type in a single block (e.g. "!roll 3P1A1C1D"). The final result (after all cancellations) will be displayed. All Success/Failure from Triumph/Despair results are already added and calculated in.`
  },
  {
    "command": "channels",
    "process": function (environment, args) {
      channels.setAllowedChannels(environment);
      var channelInfo = environment.message.guild.channels.filter(c => environment.allowedChannels.some(ac => ac === c.id)).map(c => `#${c.name}`);
      environment.message.channel.send(`Allowed Channels:\n${channelInfo.join('\n')}`);
    },
    "help": `Update the internal list of channels the bot is allowed to post to, then show that list.

The bot is only allowed to post to rooms that are restricted to a role that it has. A Discord admin should be able to confirm this.`
  },
  {
    "command": "ping",
    "process": function (environment, args) {
      environment.message.channel.send("Pinging . . .")
        .then(m => m.edit(`Pong. Latency is ${m.createdTimestamp - environment.message.createdTimestamp}ms.`));
    },
    "help": "Ping the bot and check the current latency between the bot and the Discord server."
  },
  {
    "command": "crit",
    "process": function(environment, args) { 
      environment.message.reply(criticals.rollCritical('crit', args))
    },
    "help": 'Roll on the critical hit table for enemies on foot. Enter a number to add a bonus to the roll (e.g. "!crit 15"). Use !shipcrit for critical hits against vehicles or ships.'
  },
  {
    "command": "shipcrit",
    "process": function(environment, args) { 
      environment.message.reply(criticals.rollCritical('shipcrit', args))
    },
    "help": 'Roll on the critical hit table for hits against vehicles or ships. Enter a number to add a bonus to the roll (e.g. "!shipcrit 15"). Use !crit for critical hits against enemies on foot.'
  },
  {
    "command": "shipsystems",
    "process": function (environment, args) {
      if (args.length < 1) {
        environment.message.reply("Please specify a ship silhouette size (Small or Large).");
      } else {
        var size = args.shift().toLowerCase();
        if (tables.shipsystems[size]) {
          environment.message.channel.send("Ship Systems:\n" + tables.shipsystems[size].join('\n'));
        } else {
          environment.message.reply("Please specify a ship silhouette size (Small or Large).");
        }
      }
    },
    "help": "Specify a ship size and receive a list of Ship Systems. Useful for deciding on system failures after critical hits."
  }
];

module.exports = commands;