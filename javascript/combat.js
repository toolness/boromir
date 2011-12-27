var Combat = (function(Grammar) {
  // attacks per round for fighter classes, 3rd ed PHB pg. 36
  var ATTACKS_PER_ROUND = [
    [1], [2], [3], [4], [5], [6,1], [7,2], [8,3], [9,4],
    [10,5], [11,6,1], [12,7,2], [13,8,3], [14,9,4],
    [15,10,5], [16,11,6,1], [17,12,7,2], [18,13,8,3],
    [19,14,9,4], [20,15,10,5]
  ];
  
  var utils = {
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
    var name = options.name;
    var isUnique = options.isUnique;
    var self = {
      name: name,
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
          damage += utils.dieRoll(self.damage) + self.wearer.strengthMod();
        return damage;
      }
    });

    return self;
  }

  return {
    utils: utils,
    Weapon: Weapon
  };
})(Grammar);
