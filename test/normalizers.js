var normalizers = require( '../lib/normalizers' );
var tape = require( 'tape' );

tape( 'identity should return whatever was passed in ', function ( test ){
  var val = '123asdfasdf';

  test.equal(normalizers.identity(val), val);
  test.end();

});

tape( 'stripPunctuation should return null when null is input', function(test) {
  test.equal(normalizers.stripPunctuation(null), null);
  test.end();

});

tape( 'stripPunctuation should return object supplied when pass an object', function(test) {
  var input = { 'foo': { 'bar': '!@#$'}, 'baz': 'AB*()CD'};

  test.deepEqual(normalizers.stripPunctuation(input), input);
  test.end();

});

tape( 'stripPunctuation should return input when passed a number', function(test) {
  var input = 17.3;

  test.equal(normalizers.stripPunctuation(input), input);
  test.end();

});

tape( 'stripPunctuation should remove all non-whitespace, digit, and letter characters', function (test) {
  var input = ' 1! #3 A\tB%C\'D\" ';

  test.equal(normalizers.stripPunctuation(input), ' 1 3 A\tBCD ');
  test.end();

});

tape( 'non-string input to toLowerCase should return input value unmodified', function(test) {
  var input = { 'foo': { 'bar': '!@#$'}, 'baz': 'AB*()CD'};

  test.deepEqual(normalizers.toLowerCase(input), input);
  test.end();

});

tape( 'non-string input to toUpperCase should return input value unmodified', function(test) {
  var input = { 'foo': { 'bar': '!@#$'}, 'baz': 'AB*()CD'};

  test.deepEqual(normalizers.toUpperCase(input), input);
  test.end();

});

tape( 'toLowerCase should return string input lowercased', function(test) {
  var input = 'AbC';

  test.equal(normalizers.toLowerCase(input), 'abc');
  test.end();

});

tape( 'toUpperCase should return string input uppercased', function(test) {
  var input = 'aBc';

  test.equal(normalizers.toUpperCase(input), 'ABC');
  test.end();

});

tape( 'trim returns string without leading and trailing whitespace', function(test) {
  var input = ' abc ';

  test.equal(normalizers.trim(input), 'abc');
  test.end();
});

tape( 'non-string input to abbreviateDirectionals should return input value unmodified', function(test) {
  var input = { 'foo': { 'bar': '!@#$'}, 'baz': 'AB*()CD'};

  test.deepEqual(normalizers.abbreviateDirectionals(input), input);
  test.end();

});

tape( 'abbreviateDirectionals should replace all \'North\' with \'N\'', function(test) {
  var input = 'word1 nOrTh word2 NoRtH word3';

  test.equal(normalizers.abbreviateDirectionals(input), 'word1 N word2 N word3');
  test.end();

});

tape( 'abbreviateDirectionals should replace \'South\' with \'S\'', function(test) {
  var input = 'word1 sOuTh word2 SoUtH word3';

  test.equal(normalizers.abbreviateDirectionals(input), 'word1 S word2 S word3');
  test.end();

});

tape( 'abbreviateDirectionals should replace \'West\' with \'W\'', function(test) {
  var input = 'word1 wEsT word2 WeSt word3';

  test.equal(normalizers.abbreviateDirectionals(input), 'word1 W word2 W word3');
  test.end();

});

tape( 'abbreviateDirectionals should replace \'East\' with \'E\'', function(test) {
  var input = 'word1 eAsT word2 EaSt word3';

  test.equal(normalizers.abbreviateDirectionals(input), 'word1 E word2 E word3');
  test.end();

});

tape( 'abbreviateDirectionals should replace all \'NorthWest\' with \'NW\'', function(test) {
  var input = 'word1 nOrThWeSt word2 NoRtHwEsT word3';

  test.equal(normalizers.abbreviateDirectionals(input), 'word1 NW word2 NW word3');
  test.end();

});

tape( 'abbreviateDirectionals should replace all \'NorthEast\' with \'NE\'', function(test) {
  var input = 'word1 nOrThEaSt word2 NoRtHeAsT word3';

  test.equal(normalizers.abbreviateDirectionals(input), 'word1 NE word2 NE word3');
  test.end();

});

tape( 'abbreviateDirectionals should replace \'SouthWest\' with \'SW\'', function(test) {
  var input = 'word1 sOuThWeSt word2 SoUtHwEsT word3';

  test.equal(normalizers.abbreviateDirectionals(input), 'word1 SW word2 SW word3');
  test.end();

});

tape( 'abbreviateDirectionals should replace \'SouthEast\' with \'SE\'', function(test) {
  var input = 'word1 sOuThEaSt word2 SoUtHeAsT word3';

  test.equal(normalizers.abbreviateDirectionals(input), 'word1 SE word2 SE word3');
  test.end();

});

tape( 'all expanded directionals should be replaced with abbreviations', function(test) {
  var input = 'NORTH SOUTH EAST WEST NORTHWEST NORTHEAST SOUTHWEST SOUTHEAST';

  test.equal(normalizers.abbreviateDirectionals(input), 'N S E W NW NE SW SE');
  test.end();
});

tape( 'non-string input to abbreviateMountSaintFort should return input value unmodified', function(test) {
  var input = { 'foo': { 'bar': '!@#$'}, 'baz': 'AB*()CD'};

  test.deepEqual(normalizers.abbreviateMountSaintFort(input), input);
  test.end();

});

tape( 'abbreviateMountSaintFort should replace \'Mount\' with \'Mt\'', function(test) {
  var input = 'word1 mOuNt word2 MoUnT word3';

  test.equal(normalizers.abbreviateMountSaintFort(input), 'word1 Mt word2 Mt word3');
  test.end();

});

tape( 'abbreviateMountSaintFort should replace \'Saint\' with \'St\'', function(test) {
  var input = 'word1 sAiNt word2 SaInT word3';

  test.equal(normalizers.abbreviateMountSaintFort(input), 'word1 St word2 St word3');
  test.end();

});

tape( 'abbreviateMountSaintFort should replace \'Fort\' with \'Ft\'', function(test) {
  var input = 'word1 fOrT word2 FoRt word3';

  test.equal(normalizers.abbreviateMountSaintFort(input), 'word1 Ft word2 Ft word3');
  test.end();

});

tape( 'all expanded city terms should be replaced with abbreviations', function(test) {
  var input = 'MOUNT SAINT FORT';

  test.equal(normalizers.abbreviateMountSaintFort(input), 'Mt St Ft');
  test.end();
});

tape( 'remove ordinals handles all ordinals', function(test) {
  var tests = ['35TH', '1ST', '3RD', '2ND'];
  var expected = [ '35', '1', '3', '2'];

  var actual = tests.map(normalizers.removeOrdinals);
  test.deepEqual(actual, expected, 'all ordinals are removed');
  test.end();
});

tape( 'remove ordinals leaves other numbers alone', function(test) {
  var input = '101 60TH';
  var expected = '101 60';

  test.equal(normalizers.removeOrdinals(input), expected, 'other numbers left alone');
  test.end();
});

tape( 'remove ordinals handles lowercase and uppercase', function(test) {
  var input = '5th';
  var expected = '5';

  test.equal(normalizers.removeOrdinals(input), expected, 'lowercase ordinals removed');
  test.end();
});

tape( 'remove ordinals handles multiple ordinals', function(test) {
  var input = '4th and 5th';
  var expected = '4 and 5';

  test.equal(normalizers.removeOrdinals(input), expected, 'multiple ordinals all removed');
  test.end();
});

tape( 'remove ordinals leaves lone ordinal suffexes alone', function(test) {
  var input = 'th';
  var expected = 'th';

  test.equal(normalizers.removeOrdinals(input), expected, 'lone ordinal suffix not removed');
  test.end();
});

tape( 'remove ordinals does not touch fully spelled out ordinals', function(test) {
  var input = 'third';
  var expected = 'third';

  test.equal(normalizers.removeOrdinals(input), expected, 'fully spelled out ordinal not removed');
  test.end();
});
