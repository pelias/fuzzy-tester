var tape = require( 'tape' );

var scoreTest = require( '../lib/scoreTest' );

tape( 'scoreUnexpected basics', function ( test ){
  test.test('default weight returned when no unexpected properties found', function(t) {
    var unexpected = {
      properties: [
        {
          name: 'unexpectedName'
        }
      ]
    };

    var features = [
      {
        properties: {
          name: 'a great name'
        }
      },
      {
        properties: {
          name: 'another great name'
        }
      }
    ];
    var result = scoreTest.scoreUnexpected(unexpected, features);
    t.equal(result.score, 1, 'score is 1 (the default weight)');
    t.equal(result.max_score, 1, 'max score is 1');
    t.equal(result.diff, '', 'diff is empty');
    t.end();
  });

  test.test('0 score returned when unexpected property found', function(t) {
    var unexpected = {
      properties: [
        {
          name: 'unexpectedName'
        }
      ]
    };

    var features = [
      {
        properties: {
          name: 'a great name'
        }
      },
      {
        properties: {
          name: 'unexpectedName'
        }
      }
    ];
    var result = scoreTest.scoreUnexpected(unexpected, features);
    t.equal(result.score, 0, 'score is 0');
    t.equal(result.max_score, 1, 'max score is 1');
    t.deepEquals(result.diff,[ 'unexpected property found from {"name":"unexpectedName"}' ],
                 'the diff says which unexpected feature was found');
    t.end();
  });

  test.test('correct score returned when result not within specified distance of coordinates', function(t) {
    var context = {
      distanceThresh: 1000,
      priorityThresh: 1,
      weights: {
        coordinates: 1,
        priorityThresh: 1
      }
    };
    var testCase = {
      expected: {
        properties: [
          {
            name: 'test'
          }
        ],
        coordinates: [
          [ 1.0, 1.0]
        ]
      }
    };

    var features = [
      {
        properties: {
          name: 'test',
          locality: 'place'
        },
        geometry: {
          coordinates: [ 50.0, 50.0]
        }
      }
    ];

    var result = scoreTest.scoreTest(testCase, features, context);
    t.equal(result.score, 2, 'score is 2');
    t.equal(result.max_score, 3, 'max score is 3');
    t.deepEquals(result.diff,[ 'test,place is not close enough, distance=7140266 m' ],
                 'the diff shows the distance from the expected coordinate');
    t.end();
  });

  test.test('correct score when result not within specified distance, and there are no properties', function(t) {
    var context = {
      distanceThresh: 1000,
      priorityThresh: 1,
      weights: {
        coordinates: 1,
        priorityThresh: 1
      }
    };
    var testCase = {
      expected: {
        properties: [
        ],
        coordinates: [
          [ 1.0, 1.0]
        ]
      }
    };

    var features = [
      {
        properties: {
          name: 'test',
          locality: 'place'
        },
        geometry: {
          coordinates: [ 50.0, 50.0]
        }
      }
    ];

    var result = scoreTest.scoreTest(testCase, features, context);
    t.equal(result.score, 0, 'score is 0');
    t.equal(result.max_score, 1, 'max score is 1');
    t.deepEquals(result.diff,[ 'test,place is not close enough, distance=7140266 m' ],
                 'the diff shows the distance from the expected coordinate');
    t.end();
  });
});
