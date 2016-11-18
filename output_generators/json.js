/**
 * @file A terminal/json-file output generator for test-suites results.
 */

'use strict';

var util = require( 'util' );
var fs = require('fs-extra');
var terminal = require('./terminal');
var sanitize_filename = require('sanitize-filename');

/**
 * Format and print a test result to json file.
 */
function saveFailTestResult( testCase ) {
  if( testCase.results[testCase.full_url].result === 'fail' && testCase.status === 'pass' ) {
    fs.ensureDirSync('./failures');
    var recordFailFile = './failures/' + sanitize_filename(
        util.format('%s_%s.json', testCase.id, JSON.stringify(testCase.in.input)));
    var recordFail = {
      test_case: testCase,
      response: testCase.results[testCase.full_url].responseFeatures
    };
    fs.writeFileSync(recordFailFile, JSON.stringify(recordFail, null, 2));
  }
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults, config, testSuites ) {

  testSuites.forEach( function ( suite ) {
    suite.forEach( function (testCase) {
      saveFailTestResult( testCase );
    });
  });

  return terminal( suiteResults, config, testSuites );
}

module.exports = prettyPrintSuiteResults;
