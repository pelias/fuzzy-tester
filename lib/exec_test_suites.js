/**
 * @file Several functions that handle test-running and statistics collection.
 */

'use strict';

var execTestSuite = require ( '../lib/exec_test_suite' );

/**
 * Execute all the tests in a test-suite file with `evalTest()`, and pass an
 * object containing the results to `cb()`. `apiUrl` contains the URL of the
 * Pelias API to query.
 */
var stats = {
  testsCompleted: 0,
  testsTotal: 0
};

/**
 * Asynchronously execute the given `testSuites` against the Pelias API running
 * at `apiUrl`, and pass the results to the `outputGenerator` function.
 */
function execTestSuites( apiUrl, endpoint, testSuites, outputGenerator, testType ){ // jshint ignore:line
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

  testSuites.forEach( function ( suite ){
    suite.tests = suite.tests.filter( function ( testCase ){
      return testType === undefined || testCase.type === testType;
    });
  });

  stats.testsTotal = testSuites.reduce( function ( acc, suite ){
    return acc + suite.tests.length;
  }, 0);
  var numTestSuites = testSuites.length;
  function runNextSuite(){
    var suite = testSuites.pop();
    execTestSuite( apiUrl, suite, stats, function ( testResults ){
      suiteResults.results.push( testResults );

      [ 'pass', 'fail', 'placeholder', 'timeTaken', 'regression' ].forEach( function ( propName ){
        suiteResults.stats[ propName ] += testResults.stats[ propName ];
      });

      if( suiteResults.results.length === numTestSuites ){
        process.stdout.write( '\r' ); // Clear the test-completion counter from the terminal.
        outputGenerator( suiteResults );
      }
      else {
        runNextSuite();
      }
    });
  }

  runNextSuite();
}

module.exports = execTestSuites;
