/**
 * @file A terminal output generator for test-suites results with autocomplete.
 */

'use strict';

// add color methods to String.prototype
require( 'colors' );

var url_module = require( 'url' );
var util = require( 'util' );
var _ = require( 'lodash' );

function prettyPrintTestCase(testCase, suiteResults) {
  var result_parts = testCase.autocompleteURLs.map(function (url) {
    var result = suiteResults[url];

    var parsedUrl = url_module.parse(url, true);
    var text = parsedUrl.query.text;
    var score = 'F';
    if (result) {
      var idx = result.index;
      if( result.result === 'pass') {
        var c = (idx === undefined) ? '.' : idx.toString();
        score = c.green;
      } else if (result.result === 'fail') {
        var c = (idx === undefined) ? 'F' : idx.toString();
        score = c.red;
      } else {
        console.log(result.result);
      }
    } else {
      score = 'F'.blue;
    }
    return score;
  });

  // filter out /reverse tests
  if(testCase.in.text !== undefined) {
    console.log(testCase.in.text);
    console.log(result_parts.join(''));
  };
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

  testSuites.forEach( function(testSuite, index) {
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
