/**
 * A tool for executing all of the `acceptance-tests` tests and formatting
 * their results into grokkable output.
 */

var locations = require( './test_cases/locations.json' );
var querystring = require( 'querystring' );
var supertest = require( 'supertest' );
var colors = require( 'colors' );
var util = require( 'util' );

/**
 * Format and print a test result to the terminal.
 */
function prettyPrintResult( result ){
  var id = result.testCase.id;
  var input = result.testCase.in.input;
  switch( result.result ){
    case 'pass':
      var output = util.format( '  ✔ [%s] "%s"', id, input ).green;
      console.log( output );
      break;

    case 'fail':
      var output = util.format( '  ✘ [%s] "%s": %s', id, input, result.msg ).red;
      console.error( output );
      break;

    case 'placeholder':
      var output = util.format( '  ! [%s] "%s": %s', id, input, result.msg ).yellow;
      console.error( output );
      break;

    default:
      var output = util.format( 'Result type `%s` not recognized.', result.result );
      console.error( output );
      process.exit( 1 );
      break;
  }

  return output;
}

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
  else if( testCase.out === null ){
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
      placeholder: 0
    },
    results: []
  };

  testSuite.tests.forEach( function ( testCase ){
    supertest( apiUrl )
      .get( '/search?' + querystring.stringify( testCase.in ) )
      .expect( 'Content-Type', /json/ )
      .expect( 200 )
      .end( function ( err, res ) {
        if( err ){
          throw err;
        }

        var priority = ( 'priorityThresh' in res ) ?
          result.priorityThresh :
          testSuite.priorityThresh;

        var results = evalTest( priority, testCase, res.body.features );
        results.testCase = testCase;
        testResults.stats[ results.result ]++;
        testResults.results.push( results );

        if( testResults.results.length === testSuite.tests.length ){
          cb( testResults );
        }
      });
  });
}

/**
 * URLs for the various Pelias APIs out in the wild. Can be specified as a
 * command-line argument (see `runTests()`).
 */
var PELIAS_ENDPOINTS = {
  local: 'http://localhost:3100/',
  dev: 'http://pelias.dev.mapzen.com/',
  stage: 'http://pelias.stage.mapzen.com/',
  prod: 'http://pelias.mapzen.com/'
};

/**
 * Execute all tests in `test_cases/search.json` (will change as more files are
 * added).
 */
(function runTests(){
  var argv = process.argv.slice( 2 );
  var apiUrl;
  if( argv.length > 0 ){
    var endpt = argv[ 0 ];
    if( endpt in PELIAS_ENDPOINTS ){
      apiUrl = PELIAS_ENDPOINTS[ endpt ];
    }
    else {
      console.error(
        endpt, 'is not a recognized endpoint. Try one of:',
        JSON.stringify( PELIAS_ENDPOINTS, undefined, 4 )
      );
      process.exit( 1 );
    }
  }
  else {
    apiUrl = PELIAS_ENDPOINTS.prod;
  }

  var testSuites = [ require( './test_cases/search.json' ) ];

  console.log( 'Tests for:', apiUrl.bold, '\n' );
  testSuites.forEach( function ( suite ){
    console.log( suite.name.bold );
    var startTime = new Date().getTime();
    execTestSuite( 'http://pelias.mapzen.com', suite, function ( testResults ){
      var timeTaken = new Date().getTime() - startTime;
      testResults.results.sort( function ( a, b ){
        return (a.testCase.id > b.testCase.id) ? 1 : -1;
      });
      testResults.results.forEach( function ( result ){
        prettyPrintResult( result );
      });

      console.log( '\n  Pass: ' + testResults.stats.pass.toString().green );
      console.error( '  Fail: ' + testResults.stats.fail.toString().red );
      console.error( '  Placeholders: ' + testResults.stats.placeholder.toString().yellow );
      console.log( '  Took %sms', timeTaken );
    });
  });
})();
