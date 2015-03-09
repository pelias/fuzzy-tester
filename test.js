var locations = require( './test_cases/locations.json' );
var querystring = require( 'querystring' );
var supertest = require( 'supertest' );

var testSuites = [ require( './test_cases/search.json' ) ];
testSuites.forEach( execTestSuite );

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
      expected = locations;
    }
    else {
      return {
        success: false,
        msg: 'Placeholder test, no `out` object matches in `locations.json`.'
      }
    }
  }
  else if( testCase.out === null ){
    return {
      success: false,
      msg: 'Placeholder test, no `out` specified.'
    };
  }

  for( var ind = 0; ind < apiResults.length; ind++ ){
    var result = apiResults[ ind ];
    if( equalProperties( expected, result.properties ) ){
      var success = ( ind + 1 ) <= priorityThresh;
      return ( success ) ?
        { success: true } :
        {
          success: false,
          msg: 'Result found, but not in top ' + priorityThresh
        }
    }
  }

  return {
    success: false,
    msg: 'No result found.'
  }
}

function execTestSuite( testSuite ){
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

        var priority = ( 'priorityThresh' in result ) ?
          result.priorityThresh :
          testSuite.priorityThresh;

        var results = evalTest( priority, testCase, res.body.features );
        results.testCase = testCase;
        testResults.append( results );
      });
  });
}
