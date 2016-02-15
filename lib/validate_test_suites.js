var util = require( 'util' );

var validTestStatuses = [ 'pass', 'fail', undefined ];

function validateTestSuite(testSuite) {
  return testSuite.tests.map( function ( testCase ){
    if( validTestStatuses.indexOf( testCase.status ) === -1 ){
      throw util.format(
        'Invalid test status: `%s`. Recognized statuses are: %s',
        testCase.status, JSON.stringify( validTestStatuses )
      );
    }

    if( 'unexpected' in testCase ){
      testCase.unexpected.properties.forEach( function ( props ){
        if( typeof props !== 'object' ){
          throw 'Unexpected properties MUST be objects! Strings are not supported. Exiting. ' +
            JSON.stringify( testCase, undefined, 4 );
        }
      });
    }

    if( 'expected' in testCase && 'coordinates' in testCase.expected ){
      testCase.expected.coordinates.forEach( function ( coords ){
        if( coords.constructor !== Array ){
          throw 'Unexpected: coordinates MUST be arrays! Exiting.';
        }
	if( coords.length !== 2 ){
          throw 'Coordinates must have 2 values for lon and lat. Exiting.';
        }
      });
    }

    return true;
  });
}

function validateTestSuites(testSuites) {
  return testSuites.every(validateTestSuite);
}

module.exports = validateTestSuites;
