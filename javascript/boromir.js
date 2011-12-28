var Boromir = (function(Combat) {
  var WORDS = {
    pierce: {
      light: [ "scrape[s]", "scratch[es]", "graze[s]", "minorly wound[s]" ],
      medium: [ "cut[s] into", "wound[s]", "maul[s]" ],
      heavy: [ "tear[s] into", "rip[s] into", "drive[s] %(his)s %(weapon)s into",
               "thrust[s] %(his)s %(weapon)s into" ]
    },
    slash: {
      light: [ "scrape[s]", "scratch[es]", "graze[s]", "head-butt[s]", "punch[es]", "kick[s]" ],
      medium: [ "cut[s] into", "wound[s]", "slash[es]", "slice[s]", "stab[s]" ],
      heavy: [ "tear[s] into", "drive[s] %(his)s %(weapon)s into",
               "thrust[s] %(his)s %(weapon)s into", "skewer[s]", "run[s] %(his)s %(weapon)s through"]
    },
    bludgeon: {
      light: [ "strike[s]", "glance[s]", "slap[s]" ],
      medium: [ "pound[s]", "beat[s]", "batter[s]", "hammer[s]", "slug[s]" ],
      heavy: [ "hurl[s] %(his)s %(weapon)s into", "hammer[s] %(his)s %(weapon)s into", "drive[s] %(his)s %(weapon)s into" ]
    },
    stumbles: [
      [ "%(o_name)s tr<ies|y> to anticipate %(name_pos)s attack, but miscalculate<s>...",
        "%(o_name)s <is|are> caught off-guard for a moment...!",
        "%(o_name)s tr<ies|y> to dodge %(name_pos)s attack, but stumble<s>...",
        "Weary from battle, %(o_name)s stagger<s> for a moment...",
        "%(name)s trip[s] %(o_name)s and %(o_he)s fall<s> to the ground!",
        "%(name)s launch[es] %(himself)s at %(o_name)s!" ],
      [ "%(o_name)s make<s> a feeble attempt to block %(name_pos)s next attack...", 
        "%(o_name)s moan<s>...", 
        "%(o_name)s reel<s> from the shock...", 
        "%(o_name)s stagger<s>...", 
        "%(o_name)s fall<s> to %(o_his)s knees!", 
        "%(name)s trip[s] %(o_name)s and %(o_he)s fall<s> to the ground!" ]
    ],
    humanoidParts: {
      light: [ "fingers", "hand", "shoulder", "arm", "foot", "leg" ],
      medium: [ "right arm", "left arm", "right leg", "left leg", "side", "flank" ],
      heavy: [ "thigh", "stomach", "knee", "midsection", "torso", "ribcage", "back" ],
      fatal: [ "chest", "head", "neck", "spine", "skull", "eyes" ]
    }
  };

  var WEAPONS = [
    [ "mace and chain",  12,  "1d8", 0, 2, 12, "bludgeon" ],
    [ "warhammer",       12,  "1d8", 0, 3,  8, "bludgeon" ],
    [ "greatsword",      50,  "2d6", 1, 2, 15, "slash" ],
    [ "longsword",       15,  "1d8", 1, 2,  4, "slash" ],
    [ "dagger",           2,  "1d4", 1, 2,  1, "pierce" ],
    [ "battleaxe",       10,  "1d8", 0, 3,  7, "slash" ]
  ];

  var ARMORS = [
    [ "cloth",            0,  0,  8,   1 ],
    [ "padded",           5,  1,  8,  10 ],
    [ "leather",         10,  2,  6,  15 ],
    [ "chain shirt",    100,  4,  4,  25 ],
    [ "chainmail",      150,  5,  2,  40 ],
    [ "splint mail",    200,  6,  0,  45 ],
    [ "half plate",     600,  7,  0,  50 ],
    [ "full plate",    1500,  8,  1,  50 ]
  ];

  function makeEquippable(name, array, factory) {
    if (name == "random")
      return factory(Combat.utils.randomChoice(array));

    for (var i = 0; i < array.length; i++)
      if (array[i][0] == name)
        return factory(array[i]);
    
    throw new Error("unknown equippable: " + name);
  }
  
  var utils = {
    makeWeapon: function(name) {
      return makeEquippable(name, WEAPONS, function(info) {
        return Combat.Weapon({
          name: info[0],
          damage: info[2],
          isUnique: false,
          critRange: info[3],
          critMultiplier: info[4],
          words: WORDS[info[6]]
        });
      });
    },
    makeArmor: function(name) {
      return makeEquippable(name, ARMORS, function(info) {
        return Combat.Armor({
          name: info[0],
          armorBonus: info[2],
          isUnique: false
        });
      });
    }
  };
  
  return {
    WORDS: WORDS,
    WEAPONS: WEAPONS,
    ARMORS: ARMORS,
    utils: utils
  };
})(Combat);
