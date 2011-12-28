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
    extend: function(a, b) {
      for (var name in b)
        a[name] = b[name];
      return a;
    },
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
      var SQUARES = /\[(.*?)(\|(.+?))?\]/g,
          ANGLES  = /\<(.*?)(\|(.+?))?\>/g;

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
    utils: utils,
    View: function View(viewer) {
      var self = {
        makeGrammarDict: function(subject, object) {
          function posessive(name) {
            return name + "'s";
          }

          function fillDict(dict, target, prefix) {
            if (!prefix)
              prefix = "";

            if (target === viewer) {
              utils.extend(dict, utils.makePronounDict("you", prefix));
              dict[prefix + 'name'] = 'you';
              dict[prefix + 'name_pos'] = 'your';
            } else {
              utils.extend(dict, utils.makePronounDict(target.gender,
                                                       prefix));
              dict[prefix + 'name'] = target.definiteName;
              dict[prefix + 'name_pos'] = posessive(target.definiteName);
            }
          }

          var dict = {
            __subject: subject,
            __object: object
          };

          fillDict(dict, subject);
          fillDict(dict, object, "o_");
          return dict;
        },
        parseString: function(string, dict) {
          var isSubjPlural = (dict.__subject === viewer);
          var isObjPlural = (dict.__object === viewer);
          
          string = utils.parseString(string, isSubjPlural, isObjPlural);
          return utils.applyDict(string, dict);
        }
      };

      return self;
    }
  };
})();
