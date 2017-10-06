module.exports = {
  setAllowedChannels: function (environment) {
    console.log("Resetting allowed channels");
    let roles = environment.message.guild.members.find("id", environment.userId).roles.filter(r => r.name !== "@everyone");
    environment.message.guild.channels.forEach(function(channel) {
      if(channel.permissionOverwrites.filter(p => p.allow === 3072).some(p => roles.some(r => r.id === p.id))) {
        environment.allowedChannels.push(channel.id);
      }
    });
  },

  getAllowedChannels: function (userId, guild) { 
    let allowedChannels = new Set();
    let roles = new Set(guild.members.get(userId).roles.filter(r => r.name !== '@everyone').map(r => r.id));
  
    if(roles.size > 0) {
      guild.channels.forEach(channel => {
        let perms = channel.permissionOverwrites.filter(p => p.allow === 3072 && p.type === 'role').map(p => p.id);
        if(perms.length > 0 && perms.some(p => roles.has(p))) {
          allowedChannels.add(channel.id);
        }
      });
  
      return [roles, allowedChannels];
    }
  },

  getRoles: function (userId, guild) {
    return new Set(guild.members.get(userId).roles.filter(r => r.name !== '@everyone').map(r => r.id));
  },

  getChannels: function (roles, guild) {
    let allowedChannels = new Set();
    if(roles.size > 0) {
      guild.channels.forEach(channel => {
        let perms = channel.permissionOverwrites.filter(p => p.allow === 3072 && p.type === 'role').map(p => p.id);
        if(perms.length > 0 && perms.some(p => roles.has(p))) {
          allowedChannels.add(channel.id);
        }
      });
    }
    return allowedChannels;
  }
}