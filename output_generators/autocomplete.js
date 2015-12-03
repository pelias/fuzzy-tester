/**
 * @file A terminal output generator for test-suites results with autocomplete.
 */

'use strict';

// add color methods to String.prototype
require( 'colors' );

var _ = require( 'lodash' );

/* get a title for this test case with the following features:
 * * contains any extra query parameters (api key and of course text don't count)
 * * changes the color of the text to match the test result of the original query
 *   - except passing tests which are kept uncolored to avoid color overload
 */
function getTestCaseTitleString(testCase, suiteResults) {
  var original_result = suiteResults[testCase.full_url];
  var colors = {
    pass: 'reset', // avoid color overload by keeping passing tests plainly colored
    improvement: 'green',
    regression: 'red',
    fail: 'yellow'
  };
  var params = _.clone(testCase.in);
  delete params.api_key;
  delete params.text;
  var paramsString = (Object.keys(params).length === 0 ) ? '' : JSON.stringify(params);

  var textColor = colors[original_result.progress || original_result.result];
  return testCase.in.text[textColor] + ' ' + paramsString;
}

function prettyPrintTestCase(testCase, suiteResults) {
  // filter out /reverse tests
  if(testCase.in.text === undefined) {
    return;
  }

  var result_parts = testCase.autocompleteURLs.map(function (url) {
    var result = suiteResults[url];

    var score = 'F';
    if (result) {
      var idx = result.index;
      var c;
      if( result.result === 'pass') {
        c = idx.toString();
        score = c.green;
      } else if (result.result === 'fail') {
        c = (result.score > 0 && idx !== undefined) ? idx.toString() : 'F';
        score = c.red;
      } else {
        console.log(result.result);
      }
    } else {
      score = 'F'.blue;
    }
    return score;
  });

  console.log(getTestCaseTitleString(testCase, suiteResults));
  console.log(result_parts.join(''));
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults, config, testSuites ){
  console.log( 'Autocomplete Tests for:', config.endpoint.url.blue + ' (' + config.endpoint.name.blue + ')' );

  var allSuiteResults = _.flatten(suiteResults);

  var indexedResults = allSuiteResults.reduce(function(index, result) {
    index[result.url] = result;
    return index;
  }, {});

  testSuites.forEach( function(testSuite) {
    console.log();
    console.log(testSuite.name.blue);
    testSuite.tests.forEach( function(testCase) {
      prettyPrintTestCase(testCase, indexedResults);
    });
  });

  console.log( '\nAggregate test results'.blue );
  console.log( 'Pass: ' + suiteResults.stats.pass.toString().green );
  console.error( 'Fail: ' + suiteResults.stats.fail.toString().yellow );
  console.error( 'Placeholders: ' + suiteResults.stats.placeholder.toString().cyan );

  var numRegressions = suiteResults.stats.regression;
  var regressionsColor = ( numRegressions > 0 ) ? 'red' : 'yellow';
  var total = suiteResults.stats.pass +  suiteResults.stats.fail + suiteResults.stats.regression;
  var pass = total - numRegressions;
  var percentage = pass * 100.0 / total;
  console.log( 'Regressions: ' + numRegressions.toString()[ regressionsColor ] );
  console.log( 'Took %sms', suiteResults.stats.timeTaken );
  console.log( 'Test success rate %s%%', Math.round(percentage).toString());

  console.log( '' );
  if( numRegressions > 0 ){
    console.error( 'FATAL ERROR: %s regression(s) detected.'.red.inverse, numRegressions );
    return 1;
  }
  else {
    console.log( '0 regressions detected. All good.' );
    return 0;
  }
}

module.exports = prettyPrintSuiteResults;
