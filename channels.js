function setAllowedChannels(environment) {
  console.log("Resetting allowed channels");
  var roles = environment.message.guild.members.find("id", environment.user.id).roles.filter(r => r.name !== "@everyone");
  environment.message.guild.channels.forEach(function(channel) {
    if(channel.permissionOverwrites.filter(p => p.allow === 3072).some(p => roles.some(r => r.id === p.id))) {
      environment.allowedChannels.push(channel.id);
    }
  });
}

module.exports = {
  "setAllowedChannels": setAllowedChannels
}