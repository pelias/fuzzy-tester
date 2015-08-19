'use strict';

var tape = require( 'tape' );

var sanitiseTestCase = require( '../lib/sanitiseTestCase' );

tape( 'testCaseSanitiser', function ( test ){
  test.test( 'test case with no expected or unexpected block is placeholder', function( t ) {
    var testCase = {};
    var expected_message = 'Placeholder test: no `expected` or `unexpected` given';

    t.equal(expected_message, sanitiseTestCase(testCase), 'return message specifies placeholder');
    t.end();
  });

  test.test( 'test case with empty expected block is placeholder', function( t ) {
    var testCase = { expected: {}};
    var expected_message = 'Placeholder test: `expected` block is empty';

    t.equal(expected_message, sanitiseTestCase(testCase), 'return message specifies placeholder');
    t.end();
  });

  test.test( 'test case with expected block is not placeholder', function( t ) {
    var testCase = {expected: {properties:[]}};

    t.equal(testCase, sanitiseTestCase(testCase), 'test case returned unaltered');
    t.end();
  });

  test.test( 'test case with unexpected block is not placeholder', function( t ) {
    var testCase = {unexpected: {}};

    t.equal(testCase, sanitiseTestCase(testCase), 'test case returned unaltered');
    t.end();
  });

  test.test( 'test case with string in properties array and no locations marked as placeholder', function( t ) {
    var testCase = {
      expected: {
        properties: [
          'a place'
        ]
      }
    };
    var expected_message = 'Placeholder: no matches for a place in `locations.json`.';

    t.equal(expected_message, sanitiseTestCase(testCase), 'return message specifies placeholder due to location');
    t.end();
  });

  test.test( 'test case with string in properties array and matching location replaces string', function( t ) {
    var testCase = {
      expected: {
        properties: [
          'a real place'
        ]
      }
    };
    var locations = {
      'a real place': {
        'name': 'a real place',
        'admin0': 'USA',
        'admin1': 'New York'
      }
    };

    var expected_testCase = {
      expected: {
        properties: [
          {
            'name': 'a real place',
            'admin0': 'USA',
            'admin1': 'New York'
          }
        ]
      }
    };

    var result = sanitiseTestCase(testCase, locations);
    t.deepEqual(result, expected_testCase, 'test case has location filled in');
    t.end();
  });

  test.end();
});
