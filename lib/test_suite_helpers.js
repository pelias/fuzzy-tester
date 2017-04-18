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

/**
 * A single test case can have many results if it was run through autocomplete mode
 * where each character is turned into its own test. This returns the "primary"
 * test result.
 */
function getMainResult(testCase) {
  return testCase.results[testCase.full_url];
}

/* return true if a test was expected to fail, but it passed */
function isImprovement(result) {
  return result.progress ==='improvement';
}

/* return true if a test was not expected to fail, but it did fail */
function isRegression(result) {
  return result.progress === 'regression';
}

/* return true if every test case in a test suite had the expected result
 * (no improvements or regressions)
 */
function allTestsAsExpected(testSuite) {
  return testSuite.tests.every(function(testCase) {
    var result = getMainResult(testCase);
    return !isImprovement(result) && !isRegression(result);
  });
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
  getLocations: getLocations,
  getMainResult: getMainResult,
  allTestsAsExpected: allTestsAsExpected
};
