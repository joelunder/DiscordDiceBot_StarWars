const fs = require(`fs`);
const path = require(`path`);

const stringRegex = /\d+[BSADPCF]/g
const matchRegex = /(\d+)([BSADPCF])/
const diceTypes = new Map();
const symbols = new Map();

class DieType {
  constructor(data) {
    this.results = data.results;
    this.successAxis = data.successAxis;
  }

  roll() {
    return this.results[Math.floor(Math.random() * this.results.length)];
  }
}

class DicePool {
  constructor(diceString) {
    this.Dice = [];
    
    let matches = diceString.toUpperCase().match(stringRegex);
    matches.forEach(function (match) {
      let diematch = match.match(matchRegex);
      let num = diematch[1];
      let type = diematch[2];

      for (let i = 0; i < num; i++) {
        this.Dice.push(diceTypes.get(type));
      }
    }, this);
  }

  showSuccesses() {
    return this.Dice.some(d => d.successAxis);
  }

  roll() {
    let totals = new RollTotals(this.showSuccesses());
    this.Dice.forEach(die => {
      totals.processRoll(die.roll());
    });
    totals.compileResult();
    return totals;
  }
}

class Symbol {
  constructor(data) {
    this.name = data.name;
    this.emoji = data.emoji;

    this.hidden = data.hidden;
    this.adds = data.adds;
    this.counters = data.counters;
  }
}

class RollTotals {
  constructor(successAxis) {
    this.Totals = new Map([
      [`S`, 0],
      [`A`, 0],
      [`F`, 0],
      [`T`, 0],
      [`U`, 0],
      [`P`, 0],
      [`L`, 0],
      [`D`, 0]
    ]);

    this.Rolls = [];
    this.SuccessAxis = successAxis;
  }

  processRoll(roll) {
    this.Rolls.push(roll);
    roll.split(``).forEach(result => {
      this.increment(result);
    });
  }

  increment(symbol) {
    let count = this.Totals.get(symbol)
    if (!isNaN(count)) {
      this.Totals.set(symbol, ++count);
    }

    // Add in any extra successes or failures from Triumph/Despair
    if (symbols.get(symbol).adds) {
      this.increment(symbols.get(symbol).adds);
    }
  }

  compileResult() {
    this.Totals.forEach((count, symbol) => {
      let symbolConfig = symbols.get(symbol);
      if (symbolConfig.counters) {
        let diff = this.Totals.get(symbolConfig.counters) - count;
        if (diff >= 0) {
          this.Totals.set(symbolConfig.counters, diff);
          this.Totals.set(symbol, 0);
        } else {
          this.Totals.set(symbolConfig.counters, 0);
          this.Totals.set(symbol, 0 - diff);
        }
      }
    });
  }

  writeResults(emoji) {
    var combined = [];
    if (this.Totals.get(`S`) === 0 && this.Totals.get(`F`) === 0 && this.SuccessAxis) {
      combined.push(`0 Successes\n`);
    }

    let shortHand = Array.from(this.Totals.values()).some(count => count > 8);
    this.Totals.forEach((count, symbol) => {
      if (count > 0) {
        let symbolConfig = symbols.get(symbol);
        // in emoji
        if (emoji.has(symbolConfig.emoji)) {
          if (shortHand) {
            combined.push(`${emoji.get(symbolConfig.emoji)} . . . `);
          } else {
            for (var i = 0; i < count; i++) {
              combined.push(emoji.get(symbolConfig.emoji));
            }
          }
          combined.push(` `);
        }

        // in words
        combined.push(`${count} ${(count > 1 ? symbolConfig.name.plural : symbolConfig.name.singular)}\n`);
      }
    });

    return `
${combined.join('')}
${this.Rolls.join(', ')}`;
  }
}

var diceConfig = JSON.parse(fs.readFileSync(path.join(__dirname, `..`, `data`, `dice.json`), `utf8`));
Object.keys(diceConfig.types).forEach(type => {
  diceTypes.set(type, new DieType(diceConfig.types[type]));
});
Object.keys(diceConfig.symbols).forEach(symbol => {
  symbols.set(symbol, new Symbol(diceConfig.symbols[symbol]));
});

module.exports = {
  DieRoller: function (dice, emoji) {
    var pool = new DicePool(dice);
    var result = pool.roll();
    return result.writeResults(emoji);
  }
};