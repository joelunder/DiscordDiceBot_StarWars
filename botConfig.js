const Channels = require(`./channels.js`);
const fs = require(`fs`);

var sym = JSON.parse(fs.readFileSync(`dice.json`, `utf-8`)).symbols;
const symbols = Object.keys(sym).filter(s => !sym[s].hidden).map(s => sym[s].emoji);
sym = null;

module.exports = {
  Environment: function(userId) {
    this.userId = userId;
    this.guilds = new Map();
  },

  Guild: function (guild, userId) {
    this.id = guild.id;
    this.name = guild.name;

    [this.roles, this.allowedChannels] = Channels.getAllowedChannels(userId, guild);
  
    this.emoji = new Map();
    symbols.forEach(symbol => {
      let emoji = guild.emojis.find(e => e.name === symbol) || guild.emojis.find(e => e.name.includes(symbol));
      if (emoji === null) return;
      this.emoji.set(symbol, emoji.toString());
    }, this);

    this.removeEmoji = function(oldEmoji) {
      this.emoji.forEach((curEmoji, curSymbol) => {
        if(curEmoji === oldEmoji.toString()) {
          console.log(`--Removing mapping: ${curSymbol}: ${oldEmoji.name}`);
          this.emoji.delete(curSymbol);
        }
      });
    }

    this.checkEmoji = function(newEmoji) {
      symbols.forEach(symbol => {
        let emojiFound = newEmoji.name === symbol || newEmoji.name.includes(symbol);
        if (emojiFound) {
          console.log(`--New Emoji Found: ${symbol}: ${newEmoji}`);
          this.emoji.set(symbol, newEmoji.toString());
        }
      });
    }

    this.updateEmoji = function(oldEmoji, newEmoji) {
      this.removeEmoji(oldEmoji);
      this.checkEmoji(newEmoji);
    };
  }
};