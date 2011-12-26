var Grammar = (function() {
  var utils = {
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
