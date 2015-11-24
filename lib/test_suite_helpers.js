var path = require( 'path' );

/**
 * Calculate the "progress" of a test case
 * Defined as improvements for tests that passed but were expected to fail,
 * and regressions for tests that failed but were expected to pass.
 * Tests that are passing or not passing as expected do not have a defined progress.
 */
function getTestCaseProgress( results, testCase ) {
  if( results.result === 'pass' && testCase.status === 'fail' ){
    return 'improvement';
  } else if( results.result === 'fail' && testCase.status === 'pass' ){
    return 'regression';
  } // all other cases undefined
}

function getLocations() {
  try {
    return require( path.resolve(process.cwd() + '/locations.json') );
  } catch (e) {
    return {};
  }
}

module.exports = {
  getTestCaseProgress: getTestCaseProgress,
  getLocations: getLocations
};
