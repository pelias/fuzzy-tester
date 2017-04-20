/**
 * @file A terminal output generator for test-suites results.
 */

'use strict';

// add color methods to String.prototype
require( 'colors' );

var util = require( 'util' );

var percentageForDisplay = require('../lib/percentageForDisplay');

/**
 * Format and print a test result to the terminal.
 */
function prettyPrintResult( result, testSuite, quiet ){
  var id = quiet ? `[${testSuite}][${result.testCase.id}]` : `[${result.testCase.id}]`;
  delete result.testCase.in.api_key; // don't display API key

  var input = JSON.stringify(result.testCase.in);
  var expectationCount;
  var expectationString = (expectationCount > 1) ? ' (' + expectationCount + ' expectations)' : '';
  var testDescription = input + expectationString;

  if (result.testCase.expected && result.testCase.expected.properties) {
    expectationCount = result.testCase.expected.properties.length;
  } else {
    expectationCount = 0;
  }

  var status = (result.progress === undefined) ? '' : result.progress.inverse + ' ';
  switch( result.result ){
    case 'pass':
      if (!quiet) {
        console.log(util.format('  ✔ %s %s "%s"', status, id, testDescription).green);
      }
      break;

    case 'fail':
      var color = (result.progress === 'regression') ? 'red' : 'yellow';
      console.log(
        util.format( '  ✘ %s %s "%s": %s', status, id, testDescription, result.msg )[ color ]
      );
      break;

    case 'placeholder':
      console.log( util.format( '  ! %s "%s": %s', id, testDescription, result.msg ).cyan );
      break;

    default:
      console.log( util.format( 'Result type `%s` not recognized.', result.result ) );
      process.exit( 1 );
      break;
  }
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults, config, testSuites ){
  console.log( 'Tests for:', config.endpoint.url.blue + ' (' + config.endpoint.name.blue + ')' );

  testSuites.forEach(function (testSuite) {
    if (!config.quiet) {
      console.log();
      console.log(testSuite.name.blue);
    }
    testSuite.tests.forEach( function(testCase) {
      prettyPrintResult( testCase.results[testCase.full_url], testSuite.name, config.quiet );
    });
  });

  console.log( '\nAggregate test results'.blue );
  console.log( 'Pass: ' + suiteResults.stats.pass.toString().green );
  console.log( 'Improvements: ' + suiteResults.stats.improvement.toString().green);
  console.log( 'Fail: ' + suiteResults.stats.fail.toString().yellow );
  console.log( 'Placeholders: ' + suiteResults.stats.placeholder.toString().cyan );

  var numRegressions = suiteResults.stats.regression;
  var regressionsColor = ( numRegressions > 0 ) ? 'red' : 'yellow';
  var total = suiteResults.stats.pass +  suiteResults.stats.fail + suiteResults.stats.regression;
  var pass = total - numRegressions;

  console.log( 'Regressions: ' + numRegressions.toString()[ regressionsColor ] );
  console.log( 'Took %sms', suiteResults.stats.timeTaken );
  console.log( 'Test success rate %s%%', percentageForDisplay(total,pass));

  console.log( '' );
  if( numRegressions > 0 ){
    console.log( 'FATAL ERROR: %s regression(s) detected.'.red.inverse, numRegressions );
    return 1;
  }
  else {
    console.log( '0 regressions detected. All good.' );
    return 0;
  }
}

module.exports = prettyPrintSuiteResults;
