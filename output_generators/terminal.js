/**
 * @file A terminal output generator for test-suites results.
 */

'use strict';

// add color methods to String.prototype
require( 'colors' );

var util = require( 'util' );
const url = require('url');

var percentageForDisplay = require('../lib/percentageForDisplay');
var testSuiteHelpers = require('../lib/test_suite_helpers');

function inputToUrl(testCase) {
  const path = `/v1/${testCase.endpoint}`;

  const paramStrings = [];

  const priorityParams = ['point.lat', 'point.lon', 'text'];

  Object.keys(testCase.in).forEach(function(key) {
    // skip keys already in the priority list
    if (priorityParams.includes(key)) {
      return;
    } else {
      paramStrings.push(`${key}=${testCase.in[key]}`);
    }
  });

  // ensure priority params are last
  priorityParams.forEach(function (priorityParam) {
    if (testCase.in[priorityParam]) {
      paramStrings.push(`${priorityParam}=${testCase.in[priorityParam]}`);
    }
  });

  return `${path}?${paramStrings.join('&')}`;
}


/**
 * Format and print a test result to the terminal.
 */
function prettyPrintTestCase( testCase, quiet, index ){
  var result = testSuiteHelpers.getMainResult(testCase);
  var id = result.testCase.id || index;
  delete result.testCase.in.api_key; // don't display API key

  const query = inputToUrl(testCase);

  var expectationCount;

  if (result.testCase.expected && result.testCase.expected.properties) {
    expectationCount = result.testCase.expected.properties.length;
  } else {
    expectationCount = 0;
  }

  var expectationString = (expectationCount > 1) ? ' (' + expectationCount + ' expectations)' : '';
  var testDescription = query + expectationString;

  var status = (result.progress === undefined) ? '' : result.progress.inverse + ' ';
  switch( result.result ){
    case 'pass':
      if (!quiet || result.progress === 'improvement') {
        console.log(util.format('  ✔ %s[%s] "%s"', status, id, testDescription).green);
      }
      break;

    case 'fail':
      var color = (result.progress === 'regression') ? 'red' : 'yellow';
      if (!quiet || color === 'red') {
        console.log(
          util.format( '  ✘ %s[%s] "%s": %s', status, id, testDescription, result.msg )[ color ]
        );
      }
      break;

    case 'placeholder':
      console.log( util.format( '  ! [%s] "%s": %s', id, testDescription, result.msg ).cyan );
      break;

    default:
      console.log( util.format( 'Result type `%s` not recognized.', result.result ) );
      process.exit( 1 );
      break;
  }
}

/*
 * Decide whether a test suite should be displayed in output
 * only tests where an unexpected (regression or improvement) result occured should cause
 * the test suite to display
 */
function shouldDisplayTestSuite(testSuite) {
  return !testSuiteHelpers.allTestsAsExpected(testSuite);
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults, config, testSuites ){
  if (testSuites.length === 0) {
    console.log('No tests found. Place test definitions in the `test_cases` directory');
    return 0;
  }

  console.log( 'Tests for:', config.endpoint.url.blue + ' (' + config.endpoint.name.blue + ')' );

  testSuites.forEach( function(testSuite) {

    if (!config.quiet || shouldDisplayTestSuite(testSuite)) {
      console.log();
      console.log(testSuite.name.blue);

      testSuite.tests.forEach( function(testCase, index) {
        prettyPrintTestCase( testCase, config.quiet, index );
      });
    }
  });

  console.log( '\nAggregate test results'.blue );
  console.log( 'Pass: ' + suiteResults.stats.pass.toString().green );
  console.log( 'Improvements: ' + suiteResults.stats.improvement.toString().green);
  console.log( 'Fail: ' + suiteResults.stats.fail.toString().yellow );
  console.log( 'Placeholders: ' + suiteResults.stats.placeholder.toString().cyan );

  var numRegressions = suiteResults.stats.regression;
  var total = suiteResults.stats.pass +  suiteResults.stats.fail + suiteResults.stats.regression;
  var pass = total - numRegressions;

  console.log( 'Regressions: ' + numRegressions.toString().red);
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
