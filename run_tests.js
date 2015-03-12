/**
 * @file Several functions that handle test-running and statistics collection.
 */

'use strict';

var locations = require( './locations.json' );
var querystring = require( 'querystring' );
var supertest = require( 'supertest' );
var util = require( 'util' );

/**
 * Return a boolean indicating whether `actual` has all the key value pairs
 * contained in `expected`.
 */
function equalProperties( expected, actual ){
  for( var prop in expected ){
    if( actual[ prop ] !== expected[ prop ] ){
      return false;
    }
  }
  return true;
}

/**
 * Given a test-case, the API results for the input it specifies, and a
 * priority-threshold to find the results in, return an object indicating the
 * status of this test (whether it passed, failed, is a placeholder, etc.)
 */
function evalTest( priorityThresh, testCase, apiResults ){
  var expected;
  if( typeof testCase.out === 'string' ){
    if( testCase.out in locations ){
      expected = locations[ testCase.out ];
    }
    else {
      return {
        result: 'placeholder',
        msg: 'Placeholder test, no `out` object matches in `locations.json`.'
      }
    }
  }
  else if( !( 'out' in testCase ) || testCase.out === null ){
    return {
      result: 'placeholder',
      msg: 'Placeholder test, no `out` specified.'
    };
  }
  else {
    expected = testCase.out;
  }

  for( var ind = 0; ind < apiResults.length; ind++ ){
    var result = apiResults[ ind ];
    if( equalProperties( expected, result.properties ) ){
      var success = ( ind + 1 ) <= priorityThresh;
      return ( success ) ?
        { result: 'pass' } :
        {
          result: 'fail',
          msg: util.format( 'Result found, but not in top %s.', priorityThresh )
        }
    }
  }

  return {
    result: 'fail',
    msg: 'No result found.'
  }
}

/**
 * Execute all the tests in a test-suite file with `evalTest()`, and pass an
 * object containing the results to `cb()`. `apiUrl` contains the URL of the
 * Pelias API to query.
 */
function execTestSuite( apiUrl, testSuite, cb ){
  var testResults = {
    stats: {
      pass: 0,
      fail: 0,
      placeholder: 0,
      timeTaken: null,
      name: testSuite.name
    },
    results: []
  };

  var startTime = new Date().getTime();
  testSuite.tests.forEach( function ( testCase ){
    supertest( apiUrl )
      .get( '/search?' + querystring.stringify( testCase.in ) )
      .expect( 'Content-Type', /json/ )
      .expect( 200 )
      .end( function ( err, res ) {
        if( err ){
          throw err;
        }

        stats.testsCompleted++;
        process.stderr.write( util.format(
          '\rTests completed: %s/%s', stats.testsCompleted.toString().bold,
          stats.testsTotal
        ));
        var priority = ( 'priorityThresh' in res ) ?
          result.priorityThresh :
          testSuite.priorityThresh;

        var results = evalTest( priority, testCase, res.body.features );
        results.testCase = testCase;
        testResults.stats[ results.result ]++;
        testResults.results.push( results );

        if( testResults.results.length === testSuite.tests.length ){
          testResults.stats.timeTaken = new Date().getTime() - startTime;
          testResults.results.sort( function ( a, b ){
            return (a.testCase.id > b.testCase.id) ? 1 : -1;
          });
          cb( testResults );
        }
      });
  });
}

var stats = {
  testsCompleted: 0,
  testsTotal: 0
};

/**
 * Asynchronously execute the given `testSuites` against the Pelias API running
 * at `apiUrl`, and pass the results to the `outputGenerator` function.
 */
function execTestSuites( apiUrl, testSuites, outputGenerator ){
  var suiteResults = {
    stats: {
      pass: 0,
      fail: 0,
      placeholder: 0,
      timeTaken: 0,
      url: apiUrl
    },
    results: []
  };

  testSuites.map( function ( suite ){
    stats.testsTotal += suite.tests.length;
    execTestSuite( apiUrl, suite, function ( testResults ){
      suiteResults.results.push( testResults );

      [ 'pass', 'fail', 'placeholder', 'timeTaken' ].forEach( function ( propName ){
        suiteResults.stats[ propName ] += testResults.stats[ propName ];
      });

      if( suiteResults.results.length === testSuites.length ){
        process.stdout.write( '\r' ); // Clear the test-completion counter from the terminal.
        outputGenerator( suiteResults );
      }
    });
  });
}

module.exports = execTestSuites;
