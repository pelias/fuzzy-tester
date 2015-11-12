/**
 * @file exec_test_suites logic to handle running all the test suites.
 */

'use strict';

var execTestSuite = require ( '../lib/exec_test_suite' );

/**
 * Execute all the tests in a test-suite file with `evalTest()`, and pass an
 * object containing the results to `cb()`. `apiUrl` contains the URL of the
 * Pelias API to query.
 */
var globalStats = {
  testsCompleted: 0,
  testsTotal: 0
};

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

function countTotalTests(testSuites) {
  return testSuites.reduce( function ( acc, suite ){
    return acc + suite.tests.length;
  }, 0);
}

/**
 * Asynchronously execute the given `testSuites` against the Pelias API running
 * at `apiUrl`, and pass the results to a callbackfunction.
 */
function execTestSuites( apiUrl, endpoint, testSuites, callback, testType ){ // jshint ignore:line
  var suiteResults = {
    stats: {
      pass: 0,
      fail: 0,
      placeholder: 0,
      regression: 0,
      timeTaken: 0,
      url: apiUrl,
      endpoint: endpoint
    },
    results: []
  };

  testSuites = filterTestsByType(testSuites);
  globalStats.testsTotal = countTotalTests(testSuites);
  var numTestSuites = testSuites.length;

  testSuites.forEach(function(suite) {
    execTestSuite( apiUrl, suite, globalStats, function ( testResults ){
      suiteResults.results.push( testResults );

      [ 'pass', 'fail', 'placeholder', 'timeTaken', 'regression' ].forEach( function ( propName ){
        suiteResults.stats[ propName ] += testResults.stats[ propName ];
      });

      if( suiteResults.results.length === numTestSuites ){
        process.stdout.write( '\r' ); // Clear the test-completion counter from the terminal.
        callback( suiteResults );
      }
    });
  });
}

module.exports = execTestSuites;
