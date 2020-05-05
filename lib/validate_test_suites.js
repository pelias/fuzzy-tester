var util = require( 'util' );

var validTestStatuses = [ 'pass', 'fail', undefined ];

function setEndpoint(testCase, testSuite) {
  testCase.endpoint = testCase.endpoint || testSuite.endpoint || 'search';
}

function validateTestSuite(testSuite) {
  return testSuite.tests.map( function ( testCase ){
    if( validTestStatuses.indexOf( testCase.status ) === -1 ){
      throw util.format(
        'Invalid test status: `%s`. Recognized statuses are: %s',
        testCase.status, JSON.stringify( validTestStatuses )
      );
    }

    // default test case status to pass when unset
    if (testCase.status === undefined) {
      testCase.status = 'pass';
    }

    // ensure endpoint is set for later use
    setEndpoint(testCase, testSuite);

    if( 'unexpected' in testCase ){
      testCase.unexpected.properties.forEach( function ( props ){
        if( typeof props !== 'object' ){
          throw 'Unexpected properties MUST be objects! Strings are not supported. Exiting. ' +
            JSON.stringify( testCase, undefined, 4 );
        }
      });
    }

    if( 'expected' in testCase && 'coordinates' in testCase.expected ){
      var coordinateList = testCase.expected.coordinates;
      var countError = 'Coordinates must have 2 values for lon and lat. Exiting.';

      if (coordinateList.constructor === Array ) {
        if (Array.isArray(coordinateList[0])) { // multiple expected coordinates
          coordinateList.forEach( function ( coords ){
            if( coords.constructor !== Array ){ // do not allow mixed types at this point
              throw 'Unexpected: coordinates MUST be arrays! Exiting.';
            }
            if( coords.length !== 2 ){
              throw countError;
            }
          });
        } else { // single lon, lat value pair
          if( coordinateList.length !== 2 ){
            throw countError;
          }
        }
      }
    }

    return true;
  });
}

function validateTestSuites(testSuites) {
  return testSuites.every(validateTestSuite);
}

module.exports = validateTestSuites;
