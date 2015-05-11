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

tape( 'evalTest() evaluates all edge cases correctly', function ( test ){
  var tests = [
    {
      description: '0 API results results in failure.',
      priorityThresh: 1,
      apiResults: [],
      testCase: {
        expected: {
          properties: []
        }
      },
      expected: 'fail'
    },
    {
      description: 'A result in the priority threshold matches as expected.',
      priorityThresh: 1,
      apiResults: [{
        properties: {a: 1}
      }],
      testCase: {
        expected: {
          properties: [{
            a: 1
          }]
        }
      },
      expected: 'pass'
    },
    {
      description: 'A result outside of the priority threshold fails.',
      priorityThresh: 1,
      apiResults: [{ properties: {} }, { properties: { a: 1 }}],
      testCase: {
        expected: {
          properties: [{
            a: 1
          }]
        }
      },
      expected: 'fail'
    },
    {
      description: 'Test case with no `expected`/`unexpected` props identified as a placeholder.',
      priorityThresh: -1,
      apiResults: [],
      testCase: {},
      expected: 'placeholder'
    },
    {
      description: 'Test case with no `locations.json` props identified as a placeholder.',
      priorityThresh: -1,
      apiResults: [{ properties: {} }, { properties: { a: 1 }}],
      testCase: {
        expected: {
          properties: [
            'This hopefully isn\'t in locations.json'
          ]
        }
      },
      expected: 'placeholder'
    },
    {
      description: 'Unexpected properties passes when no match found.',
      priorityThresh: 0,
      apiResults: [{ properties: {} }],
      testCase: {
        unexpected: {
          properties: [{
            a: 1
          }]
        },
      },
      expected: 'pass'
    },
    {
      description: 'Unexpected properties fails when a match was found.',
      priorityThresh: 0,
      apiResults: [{ properties: {a: 1} }],
      testCase: {
        unexpected: {
          properties: [{
            a: 1
          }]
        },
      },
      expected: 'fail'
    },
    {
      description: 'Expected/unexpected properties work as expected when both are specified..',
      priorityThresh: 1,
      apiResults: [{ properties: {a: 1} }],
      testCase: {
        expected: {
          properties: [{
            a: 1
          }]
        },
        unexpected: {
          properties: [{
            b: 1
          }]
        },
      },
      expected: 'pass'
    },
    {
      description: 'Multiple expected blocks should ALL be found',
      priorityThresh: 3,
      apiResults: [
        { properties: {a:1, b:2} },
        { properties: {a:3, b:5} },
        { properties: {a:4, b:6} }
      ],
      testCase: {
        expected: {
          properties: [
            {a:1, b:2},
            {a:4, b:6}
          ]
        }
      },
      expected: 'pass'
    },
    {
      description: 'Only one of multiple expected blocks found should fail',
      priorityThresh: 3,
      apiResults: [
        { properties: {a:1, b:2} },
        { properties: {a:3, b:5} }
      ],
      testCase: {
        expected: {
          properties: [
            {a:1, b:2},
            {a:4, b:6}
          ]
        }
      },
      expected: 'fail'
    },
    {
      description: 'Multiple expected blocks should ALL be found within priority threshold',
      priorityThresh: 2,
      apiResults: [
        { properties: {a:1, b:2} },
        { properties: {a:3, b:5} },
        { properties: {a:4, b:6} }
      ],
      testCase: {
        expected: {
          properties: [
            {a:1, b:2},
            {a:4, b:6}
          ]
        }
      },
      expected: 'fail'
    }
  ];

  tests.forEach( function ( testCase ){
    var result = runTests.evalTest(
      testCase.priorityThresh, testCase.testCase, testCase.apiResults
    );
    test.equal( result.result, testCase.expected, testCase.description );
  });

  test.end();
});

tape( 'execTestSuite() throws on bad test-cases.', function ( test ){
  test.throws( function (){
    var testSuite = {
      tests: [ { status: 'not a real status' } ]
    };
    runTests.execTestSuite( 'not a url', testSuite, null);
  }, /Invalid test status/, 'Throws exception on invalid test status.' );

  test.throws( function (){
    var testSuite = {
      tests: [{
        unexpected: {
          properties: [
            'a string?!'
          ]
        }
      }]
    };
    runTests.execTestSuite( 'not a url', testSuite, null);
  }, /MUST be objects/, 'Throws exception on non-object unexpected text-case.' );
  test.end();
});
