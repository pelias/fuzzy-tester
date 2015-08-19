var tape = require( 'tape' );

var evalTest = require( '../lib/eval_test' );

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
      description: 'Test case with string in properties array matching location uses that location',
      priorityThresh: 2,
      locations:  {
          'my home': {
              'name': 'la casa'
          }
      },
      apiResults: [{ properties: {} }, { properties: { name: 'la casa' }}],
      testCase: {
        expected: {
          properties: [
              'my home'
          ]
        }
      },
      expected: 'pass'
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
      description: 'Expected blocks need not be specified in the order they appear in the api results',
      priorityThresh: 3,
      apiResults: [
        { properties: {a:1, b:2} },
        { properties: {a:3, b:5} },
        { properties: {a:4, b:6} }
      ],
      testCase: {
        expected: {
          properties: [
            {a:4, b:6},
            {a:1, b:2}
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
    },
    {
      description: 'Weights can be set at the testSuite level',
      priorityThresh: 3,
      weights: {
        properties: {
          a: 50
        }
      },
      apiResults: [
        { properties: {a:1, b:2} },
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
      expected: 'pass',
      expected_score: 104 // 2x 50 for a, 2x1 for b, 2x1 for priorityThresh
    }
  ];

  tests.forEach( function ( one_test ){
    var context = {
      priorityThresh: one_test.priorityThresh,
      locations: one_test.locations,
      weights: one_test.weights
    };

    var result = evalTest(
      one_test.testCase, one_test.apiResults, context
    );
    test.equal( result.result, one_test.expected, one_test.description );

    if (one_test.expected_score) {
      test.equal( result.score, one_test.expected_score, 'score should be as expected');
    }
  });

  test.end();
});

