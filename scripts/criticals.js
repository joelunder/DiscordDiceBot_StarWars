const fs = require(`fs`);
const path = require(`path`);
const criticals = JSON.parse(fs.readFileSync(path.join(__dirname, `..`, `data`, `criticals.json`), `utf8`));

module.exports = {
  rollCritical: function (type, args) {
    console.log(args);
    let critValue = 0;
    if (args.length >= 1) {
      let mod = parseInt(args.shift());
      if (!isNaN(mod)) {
        critValue += mod;
      }
    }
    critValue += Math.floor(Math.random() * 100) + 1;
  
    let critsSuffered = [];
    criticals[type].filter(r => r.minRange <= critValue && r.maxRange >= critValue).forEach(function (range) {
      let critLine = `**${range.title}** (Sev ${range.severity}) - ${range.desc}`;
      if (range.additionalRolls) {
        range.additionalRolls.forEach(function (extra) {
          let extraRoll = Math.floor(Math.random() * extra.size) + 1;
          extra.table.filter(r => r.minRange <= extraRoll && r.maxRange >= extraRoll).forEach(function (extraResult) {
            critLine += `\n*${extra.name}* - ${extraResult.text}`;
          });
        });
      }
      critsSuffered.push(critLine);
    });
  
    return `Crit Roll: ${critValue}\n${critsSuffered.join(`\n`)}`;
  }
};