'use strict';

var equalProperties = require( '../lib/equal_properties' );
var isObject = require( 'is-object' );

/**
 * Given the properties of a test case,
 * construct the actual expected object.
 * This simply acounts for pre-defiend locations for now
 */
function constructExpectedOutput(properties, locations) {
  return properties.map(function(property) {
    if ( typeof property === 'string' && property in locations ) {
      return locations[property];
    // this intentionally leaves unmatched location strings as strings
    // that way it is possible to go back and look for them later
    } else {
      return property;
    }
  });
}

/**
 * Find unmatched location strings left from running constructExpectedOutput
 */
function findPlaceholders(expected) {
  return expected.filter(function(item) {
    return typeof item === 'string';
  });
}

/**
 * Given a test case and a set of api results,
 * check every api result to ensure it has none of the
 * properties that are explicitly expected to not be present
 */
function unexpectedTestsPass(testCase, apiResults) {
  if (testCase.unexpected === undefined) {
    return true;
  }

  // test every api result
  return apiResults.every(function(result) {
    // if every unexpected input is not found, the tests pass
    return testCase.unexpected.properties.every(function(property) {
      return !equalProperties(property, result.properties);
    });
  });
}

/**
 * Check if a given result is found early enough in api results to satisfy
 * a priority threshold. Note that the priorityThresh is 1-indexed where
 * the apiResults are zero-indexed.
 */
function inPriorityThresh(apiResults, result, priorityThresh) {
  return apiResults.indexOf(result) <= priorityThresh - 1;
}

function expectedTestsPass(expected, apiResults, priorityThresh) {
  return expected.every(function(expect) {
    return apiResults.some(function(result) {
      return equalProperties(expect, result.properties) && inPriorityThresh(apiResults, result, priorityThresh);
    });
  });
}

/**
 * Given a test-case, the API results for the input it specifies, and a
 * priority-threshold to find the results in, return an object indicating the
 * status of this test (whether it passed, failed, is a placeholder, etc.)
 */
function evalTest( priorityThresh, testCase, apiResults, locations ){
  locations = locations || {};

  if( (!( 'expected' in testCase ) || testCase.expected.properties === null) &&
      !( 'unexpected' in testCase ) ){
    return {
      result: 'placeholder',
      msg: 'Placeholder test, no `expected` specified.'
    };
  }

  if ( !isObject(apiResults) || apiResults.length === 0 ) {
    return {
      result: 'fail',
      msg: 'no results returned'
    };
  }

  var expected = [];
  if( 'expected' in testCase ){
    expected = constructExpectedOutput(testCase.expected.properties, locations);

    if( 'priorityThresh' in testCase.expected ){
      priorityThresh = testCase.expected.priorityThresh;
    }

    var missed_locations = findPlaceholders(expected);
    if (missed_locations.length > 0) {
      return {
        result: 'placeholder',
        msg: 'Placeholder: no matches for ' + missed_locations.join(', ') + ' in `locations.json`.'
      };
    }
  }

  if (!unexpectedTestsPass(testCase, apiResults)) {
    return {
      result: 'fail',
      msg: 'Unexpected results found'
    };
  }

  if (!expectedTestsPass(expected, apiResults, priorityThresh)) {
    return {
      result: 'fail',
      msg: 'No matching result found.'
    };
  }

  return { result: 'pass' };
}

module.exports = evalTest;
