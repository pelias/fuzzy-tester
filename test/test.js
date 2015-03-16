/**
 * @file Unit tests for `../run_tests.js`.
 */

'use strict';

var tape = require( 'tape' );
var runTests = require( '../run_tests' );

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
    var match = runTests.equalProperties( testCase.expected, testCase.actual );
    test.equal( match, testCase.match, 'Properties match succesful.' );
  });

  test.end();
});
