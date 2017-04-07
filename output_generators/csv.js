/**
 * @file A terminal/json-file output generator for test-suites results.
 */

'use strict';

var util = require( 'util' );
var fs = require('fs-extra');
var terminal = require('./terminal');
var haversine = require( 'haversine' ); // distance measure for angle coords

// replacer for stringifying testCase to avoid circular structure
function replace(key, value) {
  if (key === 'results' || key === 'result') {
    return undefined;
  }
  return value;
}

/**
 * Format and print a test result to csv file.
 */
function saveTestResult(testCase) {

  var line = `${testCase.id}, "${testCase.in.text}",`;
  line += `${testCase.expected.coordinates[0][0] }, ${testCase.expected.coordinates[0][1] },`;

  if (testCase.result.response.body.features.length > 0) {
    line += `"${testCase.result.response.body.features[0].properties.label}",`;
    line += `${testCase.result.response.body.features[0].geometry.coordinates[0]},`;
    line += `${testCase.result.response.body.features[0].geometry.coordinates[1]},`;

    const p1 = {
      longitude: testCase.expected.coordinates[0][0],
      latitude: testCase.expected.coordinates[0][1]
    };
    const p2 = {
      longitude: testCase.result.response.body.features[0].geometry.coordinates[0],
      latitude: testCase.result.response.body.features[0].geometry.coordinates[1]
    };
    line += Math.floor(haversine(p1, p2)*1000); // to metres
  }
    
  return line + '\n';
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults, config, testSuites ) {

  let output = 'count,address,exp_lon,exp_lat,act_address,act_lon,act_lat,dist\n';

  testSuites.forEach(function(suite) {
    suite.tests.forEach(function(testCase) {
      testCase.result = testCase.results[testCase.full_url];
      output += saveTestResult( testCase );
    });
  });

  fs.writeFileSync('./csv_results.csv', output);
  
  return terminal( suiteResults, config, testSuites );
}

module.exports = prettyPrintSuiteResults;
