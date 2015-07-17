var tape = require( 'tape' );

var equalProperties = require( '../lib/equal_properties.js');

tape( 'equalProperties() works.', function ( test ){
  var testCases = [
    {
      expected: {a: 1, b: 2},
      actual: {a: 1},
      match: false
    },
    {
      expected: {a: 1, b: 2},
      actual: {a: 1, b: 2},
      match: true
    },
    {
      expected: {a: 1, b: 2},
      actual: {a: 1, b: 3},
      match: false
    },
    {
      expected: {a: 1},
      actual: {a: 1, b: 2},
      match: true
    },
    {
      expected: {a: 1},
      actual: {a: 1},
      match: true
    }
  ];

  testCases.forEach( function ( testCase ){
    var match = equalProperties( testCase.expected, testCase.actual );
    test.equal( match, testCase.match, 'Properties match succesful.' );
  });
  test.end();
});
