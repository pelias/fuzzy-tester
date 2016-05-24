var tape = require( 'tape' );

var formatTestCase = require( '../../lib/email/format_test_case' );


tape( 'format_test_case', function ( test ){
  test.test('passing test case shows pass', function(t) {
    var testCase = {
      id: 1,
      in: {
        text: 'London, UK'
      },
      full_url: 'localhost:3100/v1/search?text=London, UK',
      results: {
        'localhost:3100/v1/search?text=London, UK': {
          result: 'pass',
          progress: 'pass'
        }
      }
    };

    var output = formatTestCase(testCase);
    var expected = {
      string: '✔ <span class="status">pass</span> [1] "{\n    "text": "London, UK"\n}"'
    };

    t.deepEqual(output, expected, 'passing output is as expected');
    t.end();
  });

  test.test('failing test case shows fail', function(t) {
    var testCase = {
      id: 1,
      in: {
        text: 'London, UK'
      },
      full_url: 'localhost:3100/v1/search?text=London, UK',
      results: {
        'localhost:3100/v1/search?text=London, UK': {
          result: 'fail',
          progress: 'fail',
          msg: 'There was some sort of failure'
        }
      }
    };

    var output = formatTestCase(testCase);
    var expected = {
      string: '✘ <span class="status">fail</span> [1] "{\n    "text": "London, UK"\n}": There was some sort of failure'
    };

    t.deepEqual(output, expected, 'failing output is as expected');
    t.end();
  });
});
