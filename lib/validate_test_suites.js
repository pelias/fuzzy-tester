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

    return true;
  });
}

function validateTestSuites(testSuites) {
  return testSuites.every(validateTestSuite);
}

module.exports = validateTestSuites;
