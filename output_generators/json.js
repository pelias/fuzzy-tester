/**
 * @file A terminal/json-file output generator for test-suites results.
 */

'use strict';

var util = require( 'util' );
var fs = require('fs-extra');
var terminal = require('./terminal');
var sanitize_filename = require('sanitize-filename');

// replacer for stringifying testCase to avoid circular structure
function replace(key, value) {
  if (key === 'results' || key === 'result') {
    return undefined;
  }
  return value;
}

/**
 * Format and print a test result to json file.
 */
function saveFailTestResult( testCase ) {
  if( testCase.result.result === 'fail' && testCase.status === 'pass' ) {
    fs.ensureDirSync('./failures');
    var recordFailFile = './failures/' + sanitize_filename(
        util.format('%s_%s.json', testCase.id, testCase.in.text));
    var recordFail = {
      test_case: testCase,
      response: testCase.result.response.body.features
    };
    fs.writeFileSync(recordFailFile, JSON.stringify(recordFail, replace, 2));
  }
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults, config, testSuites ) {

  testSuites.forEach(function(suite) {
    suite.tests.forEach(function(testCase) {
      testCase.result = testCase.results[testCase.full_url];
      saveFailTestResult( testCase );
    });
  });

  return terminal( suiteResults, config, testSuites );
}

module.exports = prettyPrintSuiteResults;
