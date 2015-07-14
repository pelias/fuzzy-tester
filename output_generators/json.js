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
function saveFailTestResult( result ) {
  if( result.result === 'fail' && result.testCase.status === 'pass' ) {
    fs.ensureDirSync('./failures');
    var recordFailFile = './failures/' + sanitize_filename(
        util.format('%s_%s.json', result.testCase.id, result.testCase.in.input));
    var recordFail = {
      test_case: result.testCase,
      response: result.response.body.features
    };
    fs.writeFileSync(recordFailFile, JSON.stringify(recordFail, null, 2));
  }
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults ) {

  suiteResults.results.forEach( function ( suiteResult ) {
    suiteResult.results.forEach( function (testResult) {
      saveFailTestResult( testResult );
    });
  });

  terminal( suiteResults );
}

module.exports = prettyPrintSuiteResults;
