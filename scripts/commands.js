const fs = require(`fs`);
const path = require(`path`);

const Dice = require(`./dice.js`);
const Criticals = require(`./criticals.js`);

const tables = JSON.parse(fs.readFileSync(path.join(__dirname, `..`, `data`, `misctables.json`), `utf8`));

const logReason = function(reason) {
  console.log(reason);
}

const commands = [
  {
    command: `help`,
    process: function (environment, message, args) {
      if (args.length === 0) {
        message.channel.send(`This is a bot that will help automate some of the fiddly bits of running a game in FFG's Star Wars RPG games. Use !commands to get a list of commands.`);
      } else {
        let helpCommand = args.shift().toLowerCase();
        let foundCommand = commands.find(c => c.command === helpCommand)
        if (foundCommand) {
          message.channel.send(foundCommand.help)
            .catch(logReason);
        } else {
          message.channel.send(`Command not found: ${helpCommand}`)
            .catch(logReason);
        }
      }
    },
    help: `Are you serious?`
  },
  {
    command: `commands`,
    process: function (environment, message, args) {
      message.channel.send(`Available commands:
${commands.map(c => `+ ${c.command}`).join(`\n`)}
For help with a specific command, type !help <command>`)
        .catch(logReason);
    },
    help: `List all commands available.`
  },
  {
    command: `roll`,
    process: function (environment, message, args) {
      let diceSet = args.shift();
      let title = args.join(` `);
      let msg = title.length > 0 ? `${title}:` : ``;
      msg += Dice.DieRoller(diceSet, environment.guilds.get(message.guild.id).emoji);
      message.reply(msg, { split: { maxLength: 1900, char: `,` } })
        .catch(logReason);
    },
    help: `Roll a number of FFG Star Wars dice and calculate the results.
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
    command: `ping`,
    process: function (environment, message, args) {
      let msg = message; // save message for the callback`s scope
      message.channel.send(`Pinging . . .`)
        .then(m => m.edit(`Pong. Latency is ${m.createdTimestamp - msg.createdTimestamp}ms.`).catch(logReason))
        .catch(logReason);
    },
    help: `Ping the bot and check the current latency between the bot and the Discord server.`
  },
  {
    command: `crit`,
    process: function (environment, message, args) {
      message.reply(Criticals.rollCritical(`crit`, args))
        .catch(logReason);
    },
    help: `Roll on the critical hit table for enemies on foot. Enter a number to add a bonus to the roll (e.g. "!crit 15"). Use !shipcrit for critical hits against vehicles or ships.`
  },
  {
    command: `shipcrit`,
    process: function (environment, message, args) {
      message.reply(Criticals.rollCritical(`shipcrit`, args))
        .catch(logReason);
    },
    help: `Roll on the critical hit table for hits against vehicles or ships. Enter a number to add a bonus to the roll (e.g. "!shipcrit 15"). Use !crit for critical hits against enemies on foot.`
  },
  {
    command: `shipsystems`,
    process: function (environment, message, args) {
      if (args.length < 1) {
        message.reply(`Please specify a ship silhouette size (Small or Large).`)
          .catch(logReason);
      } else {
        let size = args.shift().toLowerCase();
        if (tables.shipsystems[size]) {
          message.channel.send(`Ship Systems:\n${tables.shipsystems[size].join(`\n`)}`)
            .catch(logReason);
        } else {
          message.reply(`Please specify a ship silhouette size (Small or Large).`)
            .catch(logReason);
        }
      }
    },
    help: `Specify a ship size and receive a list of Ship Systems. Useful for deciding on system failures after critical hits.`
  },
  {
    command: `test`,
    process: function (environment, message, args) {
      message.reply(`What did you think this was going to do?`)
        .catch(logReason);
    },
    help: `This is a testing command`
  }
];

module.exports = commands;