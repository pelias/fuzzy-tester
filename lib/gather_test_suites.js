function filterTestsByType(testSuites, testType) {
  if (testType === undefined) {
    return testSuites;
  }

  return testSuites.map( function ( suite ){
    suite.tests = suite.tests.filter( function ( testCase ){
      return testCase.type === testType;
    });
    return suite;
  });
}

function gather_test_suites(config) {
   return filterTestsByType(config.testSuites, config.testType);
}

module.exports = gather_test_suites;
