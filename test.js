/**
 * A tool for executing all of the `acceptance-tests` tests and formatting
 * their results into grokkable output.
 */

var locations = require( './locations.json' );
var util = require( 'util' );
var querystring = require( 'querystring' );
var supertest = require( 'supertest' );
var colors = require( 'colors' );
var commander = require( 'commander' );
var requireDir = require( 'require-dir' );

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
 * Parse command-line arguments and execute indicated test-suites.
 */
(function runTests(){
  var endpts = Object.keys( PELIAS_ENDPOINTS ).join( ', ' );
  commander
    .option(
      '-e, --endpoint <endpoint>',
      'The name of the Pelias API to target. Any of: ' + endpts, 'prod'
    )
    .parse( process.argv );

  var apiUrl;
  if( commander.endpoint in PELIAS_ENDPOINTS ){
    apiUrl = PELIAS_ENDPOINTS[ commander.endpoint ];
  }
  else {
    console.error(
      apiUrl, 'is not a recognized endpoint. Try:',
      JSON.stringify( PELIAS_ENDPOINTS, undefined, 4 )
    );
    process.exit( 1 );
  }

  var testSuites;
  if( commander.args.length > 0 ){
    testSuites = commander.args.map( function ( filePath ){
      return require( './' + filePath );
    });
  }
  else {
    var testFiles = requireDir( 'test_cases' );
    testSuites = [];
    for( var file in testFiles ){
      testSuites.push( testFiles[ file ] );
    }
  }

  console.log( 'Tests for:', apiUrl.bold );
  testSuites.map( function ( suite ){
    var startTime = new Date().getTime();
    execTestSuite( apiUrl, suite, function ( testResults ){
      console.log( '\n' + suite.name.bold );
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
