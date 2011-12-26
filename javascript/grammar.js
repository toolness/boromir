var Grammar = (function() {
  var PRONOUNS = {
    male: {
      himself: "himself",
      his: "his",
      him: "him",
      he: "he"
    },
    female: {
      himself: "herself",
      his: "her",
      him: "her",
      he: "she"      
    },
    neuter: {
      himself: "itself",
      his: "its",
      him: "it",
      he: "it"      
    },
    you: {
      himself: "yourself",
      his: "your",
      him: "you",
      he: "you"      
    }
  };

  var utils = {
    makePronounDict: function(gender, prefix) {
      if (!prefix)
        prefix = "";
      if (!(gender in PRONOUNS))
        throw new Error("invalid gender: " + gender);
      var dict = {};
      for (var name in PRONOUNS[gender])
        dict[prefix + name] = PRONOUNS[gender][name];
      return dict;
    },
    applyDict: function(string, dict) {
      return string.replace(/%\(([a-zA-Z0-9_]+)\)s/g, function(str, term) {
        return dict[term].toString();
      });
    },
    parseString: function(string, isSquarePlural, isAnglePlural) {
      var SQUARES = /\[(.*?)(\|(.+))?\]/g,
          ANGLES  = /\<(.*?)(\|(.+))?\>/g;

      function replaceBrackets(string, regexp, isPlural) {
        return string.replace(regexp, function(str, singular, plural) {
          if (isPlural)
            return plural ? plural.slice(1) : "";
          return singular;
        });
      }

      string = replaceBrackets(string, SQUARES, isSquarePlural);
      return replaceBrackets(string, ANGLES, isAnglePlural);
    }
  };

  return {
    utils: utils
  };
})();
