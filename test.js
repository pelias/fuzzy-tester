var testSuites = [ require( './test_cases/search.json' ) ];
var locations = require( './test_cases/locations.json' );
var querystring = require( 'querystring' );
var supertest = require( 'supertest' );

testSuites.forEach( execTextSuite );

function equalProperties( expected, actual ){
  for( var prop in expected ){
    if( actual[ prop ] !== expected[ prop ] ){
      return false;
    }
  }
  return true;
}

function execTextSuite( testSuite ){
  var testResults = [];

  testSuite.tests.forEach( function ( test ){
    supertest( 'http://pelias.mapzen.com' )
      .get( '/search?' + querystring.stringify( test.in ) )
      .expect( 'Content-Type', /json/ )
      .expect( 200 )
      .end( function ( err, res ) {
        if( err ){
          throw err;
        }

        var expected;
        if( typeof testSuite.out === 'string' ){
          if( testSuite.out in locations ){
            expected = locations;
          }
        }
        var pass = equalProperties( testSuite. )
        console.log( res.body );
        process.exit( 0 );
      });
  });
}
