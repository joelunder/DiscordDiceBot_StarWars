const fs = require('fs');
const criticals = JSON.parse(fs.readFileSync('criticals.json', 'utf8'));

function rollCritical(type, args) {
  console.log(args);
  var critValue = 0;
  if (args.length >= 1) {
    var mod = parseInt(args.shift());
    if (!isNaN(mod)) {
      critValue += mod
    }
  }
  critValue += Math.floor(Math.random() * 100) + 1;

  var critsSuffered = [];
  criticals[type].filter(r => r.minRange <= critValue && r.maxRange >= critValue).forEach(function (range) {
    var critLine = `**${range.title}** (Sev ${range.severity}) - ${range.desc}`;
    if (range.additionalRolls) {
      range.additionalRolls.forEach(function (extra) {
        var extraRoll = Math.floor(Math.random() * extra.size) + 1;
        extra.table.filter(r => r.minRange <= extraRoll && r.maxRange >= extraRoll).forEach(function (extraResult) {
          critLine += `\n*${extra.name}* - ${extraResult.text}`;
        });
      });
    }
    critsSuffered.push(critLine);
  });

  return `Crit Roll: ${critValue}\n${critsSuffered.join('\n')}`;
}

module.exports = {
  "rollCritical": rollCritical
}