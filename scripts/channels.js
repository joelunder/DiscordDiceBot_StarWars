module.exports = {
  getRoles: function (userId, guild) {
    return new Set(guild.members.get(userId).roles.filter(r => r.name !== `@everyone`).map(r => r.id));
  },

  getChannels: function (roles, channels) {
    let allowedChannels = new Set();
    if(roles.size > 0) {
      channels.forEach(channel => {
        let perms = channel.permissionOverwrites.filter(p => p.allow === 3072 && p.type === `role`).map(p => p.id);
        if(perms.length > 0 && perms.some(p => roles.has(p))) {
          allowedChannels.add(channel.id);
        }
      });
    }
    return allowedChannels;
  },

  channelAllowed: function(channel, roles) {
    let perms = channel.permissionOverwrites.filter(p => p.allow === 3072 && p.type === `role`).map(p => p.id);
    return perms.length > 0 && perms.some(p => roles.has(p));
  }
}