const fs = require('fs');
const stringRegex = /\d+[BSADPCF]/g
const matchRegex = /(\d+)([BSADPCF])/

function DieType(name, results) {
    this.name = name;
    this.results = results;
}
DieType.prototype.roll = function() {
  return this.results[Math.floor(Math.random() * this.results.length)];
}

function DieRoller(dice, emoji) {
  var diceConfig = JSON.parse(fs.readFileSync('dice.json', 'utf8'));

  var matches = dice.toUpperCase().match(stringRegex);
  var total = [];
  matches.forEach(function(match) {
    var diematch = match.match(matchRegex);
    var num = diematch[1];
    var type = diematch[2];
 
    var die = new DieType(type, diceConfig["types"][type].results);
    for (var i = 0; i < num; i++) {
        total.push(die.roll());
    }
  });

  var symbols = total.join('').split(''); // Combine all multi-symbol results into a single array of all symbols rolled
  var individual = total.join(', ');
  
  var totals = { "S": 0, "A": 0, "F": 0, "T": 0, "U": 0, "P": 0, "D": 0, "L": 0 };
  while(symbols.length > 0) {
    var symbol = symbols.shift();
    var symbolConfig = diceConfig.symbols[symbol];
    if(symbolConfig.hidden) {
      continue;
    }
    if(symbolConfig.adds) {                   // If the symbol adds another symbol, then enqueue it to process later
      symbols.push(symbolConfig.adds);
    }
    if(symbolConfig.counters) {               // If the symbol counters another one...
      if(totals[symbolConfig.counters] > 0) {   // Then check to see if one it counters is already added...
        totals[symbolConfig.counters]--;          // And remove it
      } else {
        totals[symbol]++;                       // Otherwise add it to the running total
      }
    } else {                                  // If it doesn't, then add it to the total
      totals[symbol]++;
    }
  }

  var combined = '';
  for (var sym in totals) {
    if (totals.hasOwnProperty(sym)) {
      if(totals[sym] > 0) {
        var symConfig = diceConfig.symbols[sym];
        // in emoji
        if(totals[sym] > 8) {
          combined += `${emoji[symConfig.emoji]} . . . `;
        } else {
          for(var i = 0; i < totals[sym]; i++) {
            combined += emoji[symConfig.emoji];
          }
        }
        // in words
        combined += ` ${totals[sym]} ${(totals[sym] > 1 ? symConfig.name.plural : symConfig.name.singular)}\n`;
      }
    }
  }

  return `
${combined}
${individual}`;
}

module.exports = DieRoller;