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
function getTestCaseTitleString(testCase) {
  var original_result = testCase.results[testCase.full_url];
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

  var expectationCount = testCase.expected.properties.length;
  var expectationString = (expectationCount > 1) ? ' (' + expectationCount + ' expectations)' : '';

  return testCase.in.text[textColor] + ' ' + paramsString + expectationString;
}

function prettyPrintTestCase(testCase) {
  // filter out /reverse tests
  if(testCase.in.text === undefined || !testCase.expected) {
    return;
  }

  var result_parts = testCase.autocompleteURLs.map(function (url) {
    var result = testCase.results[url];

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

  console.log(getTestCaseTitleString(testCase));
  console.log(result_parts.join(''));
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults, config, testSuites ){
  console.log( 'Autocomplete Tests for:', config.endpoint.url.blue + ' (' + config.endpoint.name.blue + ')' );

  testSuites.forEach( function(testSuite) {
    console.log();
    console.log(testSuite.name.blue);
    testSuite.tests.forEach( function(testCase) {
      prettyPrintTestCase(testCase);
    });
  });

  console.log( '\nAutocomplete stats'.blue);
  console.log( 'Search passes but autocomplete fails: ' + suiteResults.autocomplete.autocomplete_fails_search_passes );
  console.log( 'Jumpy autocomplete cases: ' + suiteResults.autocomplete.autocomplete_passes_then_fails );
  console.log( 'Tests that pass only on last character: ' + suiteResults.autocomplete.only_last_character_passes );

  console.log( '\nAggregate test results'.blue );
  console.log( 'Pass: ' + suiteResults.stats.pass.toString().green );
  console.log( 'Fail: ' + suiteResults.stats.fail.toString().yellow );
  console.log( 'Placeholders: ' + suiteResults.stats.placeholder.toString().cyan );

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
    console.log( 'FATAL ERROR: %s regression(s) detected.'.red.inverse, numRegressions );
    return 1;
  }
  else {
    console.log( '0 regressions detected. All good.' );
    return 0;
  }
}

module.exports = prettyPrintSuiteResults;
