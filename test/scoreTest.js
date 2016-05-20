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
});
