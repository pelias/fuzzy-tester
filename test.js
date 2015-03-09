var locations = require( './test_cases/locations.json' );
var querystring = require( 'querystring' );
var supertest = require( 'supertest' );
var colors = require( 'colors' );
var util = require( 'util' );

var testSuites = [ require( './test_cases/search.json' ) ];
testSuites.forEach( function ( suite ){
  var startTime = new Date().getTime();
  execTestSuite( suite, function ( testResults ){
    var timeTaken = new Date().getTime() - startTime;
    testResults.results.sort( function ( a, b ){
      return (a.testCase.id > b.testCase.id) ? 1 : -1;
    });
    testResults.results.forEach( function ( result ){
      prettyPrintResult( result );
    });
  });
});

function prettyPrintResult( result ){
  switch( result.result ){
    case 'pass':
      var output = util.format(
        '✔ [%s] "%s"', result.testCase.id, result.testCase.in.input
      ).green;
      console.log( output );
      break;

    case 'fail':
      var output = util.format(
        '✘ [%s] "%s": %s', result.testCase.id, result.testCase.in.input,
        result.msg
      ).red;
      console.error( output );
      break;

    case 'placeholder':
      var output = util.format(
        '! [%s] "%s": %s', result.testCase.id, result.testCase.in.input,
        result.msg
      ).yellow;
      console.error( output );
      break;

    default:
      console.error(
        util.format( 'Result type `%s` not recognized.', result.result )
      );
      process.exit( 1 );
      break;
  }

  return output;
}

function equalProperties( expected, actual ){
  for( var prop in expected ){
    if( actual[ prop ] !== expected[ prop ] ){
      return false;
    }
  }
  return true;
}

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

function execTestSuite( testSuite, cb ){
  var testResults = [];

  testSuite.tests.forEach( function ( testCase ){
    supertest( 'http://pelias.mapzen.com' )
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
        testResults.push( results );

        if( testResults.length === testSuite.tests.length ){
          cb( testResults );
        }
      });
  });
}
