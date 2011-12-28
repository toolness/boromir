var Combat = (function(Grammar) {
  // attacks per round for fighter classes, 3rd ed PHB pg. 36
  var ATTACKS_PER_ROUND = [
    [1], [2], [3], [4], [5], [6,1], [7,2], [8,3], [9,4],
    [10,5], [11,6,1], [12,7,2], [13,8,3], [14,9,4],
    [15,10,5], [16,11,6,1], [17,12,7,2], [18,13,8,3],
    [19,14,9,4], [20,15,10,5]
  ];
  
  var utils = {
    typeCheck: function(obj, typeMap) {
      for (var name in typeMap)
        if (typeof(obj[name]) != typeMap[name])
          throw new Error("expected option '" + name + "' to be type " +
                          typeMap[name] + ", not " + obj[name]);
    },
    abilityMod: function(score) {
      if (score == 1)
        return -5;
      return Math.floor((score - 2) / 2) - 4;
    },
    getRandomInt: function(min, max) {  
      return Math.floor(Math.random() * (max - min + 1)) + min;  
    },
    dieRoll: function(num, sides, plus) {
      var sum = 0;
      
      if (arguments.length == 1 && typeof(num) == "string")
        return utils.dieRoll.apply(this, utils.parseDieString(num));
      
      for (var i = 0; i < num; i++)
        sum += utils.getRandomInt(1, sides);
      return sum + (plus ? plus : 0);
    },
    randomChoice: function(array) {
      return array[utils.getRandomInt(0, array.length-1)];
    },
    parseDieString: function(string) {
      var parts = string.split("d");
      var secondParts = parts[1].split("+");
      var num = parseInt(parts[0]);
      var sides = parseInt(secondParts[0]);
      if (secondParts.length == 2)
        return [num, sides, parseInt(secondParts[1])];
      return [num, sides, 0];
    }
  };
  
  function Thing(options) {
    utils.typeCheck(options, {
      name: "string",
      isUnique: "boolean"
    });
    
    var name = options.name;
    var isUnique = options.isUnique;
    var self = {
      name: name,
      gender: options.gender || "neuter",
      extend: function(more) {
        Grammar.utils.extend(self, more);
      }
    };

    if (!isUnique) {
      self.definiteName = "the " + name;
      if (name.match(/^[aeiou]/))
        self.indefiniteName = "an " + name;
      else
        self.indefiniteName = "a " + name;
    } else {
      self.definiteName = name;
      self.indefiniteName = name;
    }
    
    return self;
  }
  
  function Equippable(options) {
    var self = Thing(options);

    self.extend({
      wearer: options.wearer
    });
    
    return self;
  }

  function Weapon(options) {
    var self = Equippable(options);

    utils.typeCheck(options, {
      damage: "string",
      words: "object",
      critRange: "number",
      critMultiplier: "number"
    });

    self.extend({
      damage: options.damage,
      words: options.words,
      critRange: options.critRange,
      critMultiplier: options.critMultiplier,
      isAttackRollCritical: function(attackRoll) {
        return (attackRoll >= 20 - self.critRange);
      },
      damageRoll: function(attackRoll) {
        var numTimes = 1;
        var damage = 0;
        if (self.isAttackRollCritical(attackRoll))
          numTimes = self.critMultiplier;
        for (var i = 0; i < numTimes; i++)
          damage += utils.dieRoll(self.damage) + self.wearer.mod('str');
        return damage;
      }
    });

    return self;
  }

  function Armor(options) {
    var self = Equippable(options);
    
    utils.typeCheck(options, {
      armorBonus: "number"
    });
    
    self.extend({
      armorBonus: options.armorBonus
    });
    
    return self;
  }
  
  function Creature(options) {
    var self = Thing(options);

    utils.typeCheck(options, {
      level: "number",
      str: "number",
      con: "number",
      dex: "number",
      hp: "number",
      parts: "object",
      stumbles: "object"
    });

    self.extend({
      level: options.level,
      str: options.str,
      con: options.con,
      dex: options.dex,
      maxBaseHp: options.hp,
      parts: options.parts,
      stumbles: options.stumbles,
      equipWeapon: function(weapon) {
        weapon.wearer = self;
        self.weapon = weapon;
      },
      equipArmor: function(armor) {
        armor.wearer = self;
        self.armor = armor;
      },
      armorClass: function() {
        return 10 + self.armor.armorBonus + self.mod('dex');
      },
      baseAttackBonus: function() {
        return ATTACKS_PER_ROUND[self.level - 1];
      },
      mod: function(name) {
        if (name.length != 3 || !(name in self))
          throw new Error("invalid attribute name: " + name);
        return utils.abilityMod(self[name]);
      },
      check: function(name) {
        return utils.dieRoll('1d20') + self.mod(name);
      },
      maxHp: function() {
        return self.maxBaseHp + (self.mod('con') * self.level);
      },
      fullyHeal: function() {
        self.hp = self.maxHp();
      },
      loseHp: function(amount) {
        self.hp -= amount;
        if (self.hp < 0)
          self.hp = 0;
      }
    });

    self.fullyHeal();
    return self;
  }
  
  function Narrator(view, output) {    
    var self = {
      output: output,
      hit: function(attacker, defender, damage, attackRoll, roundNumber) {
        var weapon = attacker.weapon;
        var percent = damage / defender.hp;
        var part = null;
        var phrase;
        var stumbleDesc;
        var dict = view.makeGrammarDict(attacker, defender);

        dict.weapon = attacker.weapon.name;
        dict.o_weapon = defender.weapon.name;

        if (percent < 0.15) {
          phrase = utils.randomChoice(weapon.words.light);
        } else if (percent < 0.5) {
          phrase = utils.randomChoice(weapon.words.medium);
        } else {
          phrase = utils.randomChoice(weapon.words.heavy);
          if (percent < 1.0) {
            part = utils.randomChoice(defender.parts.heavy);
          } else {
            part = utils.randomChoice(defender.parts.fatal);
          }
        }
        
        if (attacker.weapon.isAttackRollCritical(attackRoll) ||
            percent >= 0.8) {
          if (roundNumber == 1) {
            stumbleDesc = utils.randomChoice(defender.stumbles[0]);
          } else {
            stumbleDesc = utils.randomChoice(defender.stumbles[1]);
          }
          stumbleDesc = view.parseString(stumbleDesc, dict);
          output.emit("stumble", stumbleDesc, {
            attacker: attacker,
            defender: defender
          });
          output.pause(1);
        }
        
        if (part) {
          phrase = "%(name)s " + phrase + " %(o_name_pos)s " + part;
        } else {
          phrase = "%(name)s " + phrase + " %(o_name)s";
        }
        
        phrase += " for " + damage + " damage!";
        phrase = view.parseString(phrase, dict);
        output.emit("hit", phrase, {
          attacker: attacker,
          defender: defender,
          damage: damage
        });
      },
      miss: function(attacker, defender) {
        var dict = view.makeGrammarDict(attacker, defender);
        var phrase = "%(name)s misses %(o_name)s!";
        phrase = view.parseString(phrase, dict);
        output.emit("miss", phrase, {
          attacker: attacker,
          defender: defender
        });
      }
    };
    
    return self;
  }
  
  function MeleeAttack(narrator, dieRoll) {
    dieRoll = dieRoll || utils.dieRoll;

    function oneAttack(attacker, defender, baseAttackBonus, roundNumber) {
      var attackRoll = dieRoll('1d20');
      var attack = attackRoll + baseAttackBonus + attacker.mod('str');
      var defense = defender.armorClass();

      if (defender.hp == 0)
        return;

      if (attack >= defense) {
        var damage = attacker.weapon.damageRoll(attackRoll);
        narrator.hit(attacker, defender, damage, attackRoll, roundNumber);
        defender.loseHp(damage);
      } else {
        narrator.miss(attacker, defender);
      }
    }
    
    var self = {
      executeTurn: function(attacker, defender) {
        var attacks = attacker.baseAttackBonus();
        oneAttack(attacker, defender, attacks[0], 1);
        for (var i = 1; i < attacks.length; i++) {
          narrator.output.pause(2);
          oneAttack(attacker, defender, attacks[i], 1 + i);
        }
      }
    };
    
    return self;
  }
  
  return {
    utils: utils,
    Weapon: Weapon,
    Armor: Armor,
    Creature: Creature,
    Narrator: Narrator,
    MeleeAttack: MeleeAttack
  };
})(Grammar);
