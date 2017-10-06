const Channels = require('./channels.js');

module.exports = {
  'Environment': function(userId) {
    this.userId = userId;
    this.guilds = new Map();
  },

  'Guild': function (guild, userId, symbols) {
    this.id = guild.id;
    this.name = guild.name;

    [this.roles, this.allowedChannels] = Channels.getAllowedChannels(userId, guild);
  
    this.emoji = new Map();
    symbols.forEach(symbol => {
      let emoji = guild.emojis.find("name", symbol) || guild.emojis.find(e => e.name.includes(symbol));
      if (emoji === null) return;
      this.emoji.set(symbol, emoji.toString());
    }, this);
  }
};